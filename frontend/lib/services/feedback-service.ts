import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/errors";
import {
  SubmitFeedbackSchema,
  SubmitFeedbackInput,
  CreateDirectBookReviewSchema,
  CreateDirectBookReviewInput,
  ModerateFeedbackSchema,
  ModerateFeedbackInput,
  DeleteFeedbackSchema,
  DeleteFeedbackInput,
  AdminFeedbackQuerySchema,
  AdminFeedbackQueryInput,
} from "@/lib/schemas/feedback-schema";
import { syncBookToSearchIndex } from "@/lib/search/sync";
import { invalidateBookCache } from "@/lib/cache/invalidation";
import { Prisma } from "@prisma/client";
import { VerifiedActor, assertAdmin, isHumanActor, HumanActor } from "@/lib/auth/verified-actor";
import { recordDomainAudit } from "@/lib/services/audit-service";
import { withIdempotency } from "@/lib/services/idempotency-service";

export interface AdminFeedbackItem {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCategory: string;
  coverImageUrl: string | null;
  studentId: string;
  studentName: string;
  studentEmail: string;
  loanId: string | null;
  rating: number;
  comment: string | null;
  isModerated: boolean;
  createdAt: Date;
  borrowedAt: Date | null;
  returnedAt: Date | null;
}

export interface AdminFeedbackStats {
  totalCount: number;
  publishedCount: number;
  moderatedCount: number;
  averageRating: number | null;
}

export interface AdminFeedbackResult {
  feedbacks: AdminFeedbackItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: AdminFeedbackStats;
}

/**
 * Service function to submit student rating and written review for a completed loan.
 * Enforces server-verified actor attribution, loan status === 'RETURNED', 1-feedback-per-loan, domain audit, and idempotency.
 */
export async function submitBookFeedback(
  actorOrClerkId: VerifiedActor | string,
  rawInput: SubmitFeedbackInput
) {
  const input = SubmitFeedbackSchema.parse(rawInput);

  let actor: HumanActor;
  if (typeof actorOrClerkId === "string") {
    const user = await prisma.user.findUnique({
      where: { clerkId: actorOrClerkId },
    });
    if (!user || !user.isActive) {
      throw new ServiceError("USER_NOT_FOUND", "User profile not found", 404);
    }
    actor = {
      type: "USER",
      userId: user.id,
      clerkId: user.clerkId,
      role: user.role,
      email: user.email,
    };
  } else {
    if (!isHumanActor(actorOrClerkId)) {
      throw new ServiceError("UNAUTHORIZED_ACTOR", "Only human users can submit feedback", 403);
    }
    actor = actorOrClerkId;
  }

  const result = await prisma.$transaction(async (tx) => {
    return withIdempotency(tx, {
      key: input.idempotencyKey,
      route: "feedback:submit",
      actor,
      payload: input,
      execute: async () => {
        const user = await tx.user.findFirst({
          where: {
            OR: [{ clerkId: actor.clerkId }, { id: actor.userId }],
            isActive: true,
          },
          select: { id: true, firstName: true, lastName: true },
        });

      if (!user) {
        throw new ServiceError("USER_NOT_FOUND", "User profile not found", 404);
      }

      const loan = await tx.loan.findUnique({
        where: { id: input.loanId },
        include: {
          bookCopy: {
            select: {
              bookId: true,
              book: {
                select: {
                  title: true,
                },
              },
            },
          },
          feedback: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!loan) {
        throw new ServiceError("LOAN_NOT_FOUND", "Loan record not found", 404);
      }

      if (loan.studentId !== user.id) {
        throw new ServiceError(
          "UNAUTHORIZED_LOAN_ACCESS",
          "You can only submit feedback for loans issued to your account",
          403
        );
      }

      if (loan.status !== "RETURNED") {
        throw new ServiceError(
          "LOAN_NOT_RETURNED",
          "Reviews can only be submitted after the physical book copy has been returned",
          409
        );
      }

      if (loan.feedback) {
        throw new ServiceError(
          "FEEDBACK_ALREADY_EXISTS",
          "Feedback has already been submitted for this completed loan",
          409
        );
      }

      const feedback = await tx.feedback.create({
        data: {
          bookId: loan.bookCopy.bookId,
          studentId: user.id,
          loanId: loan.id,
          rating: input.rating,
          comment: input.comment ?? null,
          isModerated: false,
        },
        include: {
          book: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      // Transactional Domain Audit log
      await recordDomainAudit(tx, {
        entityType: "FEEDBACK",
        entityId: feedback.id,
        action: "FEEDBACK_SUBMITTED",
        actor,
        beforeState: null,
        afterState: {
          bookId: feedback.bookId,
          studentId: feedback.studentId,
          loanId: feedback.loanId,
          rating: feedback.rating,
          comment: feedback.comment,
          isModerated: feedback.isModerated,
        },
      });

      return {
        statusCode: 201,
        data: {
          id: feedback.id,
          bookId: feedback.bookId,
          bookTitle: feedback.book.title,
          rating: feedback.rating,
          comment: feedback.comment,
          createdAt: feedback.createdAt,
        },
      };
    },
  });
});

  // Post-commit search cache and server cache synchronization
  await syncBookToSearchIndex(result.bookId);
  invalidateBookCache(result.bookId);

  return result;
}

/**
 * Service function for administrators to fetch and moderate all student reviews.
 */
export async function getAdminFeedbacks(
  rawParams?: AdminFeedbackQueryInput
): Promise<AdminFeedbackResult> {
  const params = AdminFeedbackQuerySchema.parse(rawParams || {});
  const { status, search, page, limit } = params;

  const where: Prisma.FeedbackWhereInput = {};

  if (status === "published") {
    where.isModerated = false;
  } else if (status === "moderated") {
    where.isModerated = true;
  }

  if (search && search.trim() !== "") {
    const q = search.trim();
    where.OR = [
      { book: { title: { contains: q, mode: "insensitive" } } },
      { book: { author: { contains: q, mode: "insensitive" } } },
      { student: { firstName: { contains: q, mode: "insensitive" } } },
      { student: { lastName: { contains: q, mode: "insensitive" } } },
      { student: { email: { contains: q, mode: "insensitive" } } },
      { comment: { contains: q, mode: "insensitive" } },
    ];
  }

  const offset = (page - 1) * limit;

  const [totalCount, publishedCount, moderatedCount, feedbackAvg, paginatedFeedbacks, filteredTotal] =
    await Promise.all([
      prisma.feedback.count(),
      prisma.feedback.count({ where: { isModerated: false } }),
      prisma.feedback.count({ where: { isModerated: true } }),
      prisma.feedback.aggregate({
        _avg: { rating: true },
      }),
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              category: true,
              coverImageUrl: true,
            },
          },
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          loan: {
            select: {
              borrowedAt: true,
              returnedAt: true,
            },
          },
        },
      }),
      prisma.feedback.count({ where }),
    ]);

  const averageRating =
    feedbackAvg._avg.rating !== null
      ? Number(feedbackAvg._avg.rating.toFixed(1))
      : null;

  const feedbacks: AdminFeedbackItem[] = paginatedFeedbacks.map((f) => ({
    id: f.id,
    bookId: f.book.id,
    bookTitle: f.book.title,
    bookAuthor: f.book.author,
    bookCategory: f.book.category,
    coverImageUrl: f.book.coverImageUrl,
    studentId: f.student.id,
    studentName: `${f.student.firstName} ${f.student.lastName}`,
    studentEmail: f.student.email,
    loanId: f.loanId,
    rating: f.rating,
    comment: f.comment,
    isModerated: f.isModerated,
    createdAt: f.createdAt,
    borrowedAt: f.loan?.borrowedAt ?? null,
    returnedAt: f.loan?.returnedAt ?? null,
  }));

  return {
    feedbacks,
    pagination: {
      total: filteredTotal,
      page,
      limit,
      totalPages: Math.ceil(filteredTotal / limit) || 1,
    },
    stats: {
      totalCount,
      publishedCount,
      moderatedCount,
      averageRating,
    },
  };
}

/**
 * Service function to toggle moderation state (`isModerated`) for a feedback review.
 * Setting `isModerated: true` hides the review from public catalog views.
 * Enforces admin authorization, domain audit logging, and idempotency.
 */
export async function toggleFeedbackModeration(
  actorOrClerkId: VerifiedActor | string,
  rawInput: ModerateFeedbackInput
) {
  const input = ModerateFeedbackSchema.parse(rawInput);

  let actor: HumanActor;
  if (typeof actorOrClerkId === "string") {
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: actorOrClerkId },
    });
    if (!adminUser || adminUser.role !== "ADMIN" || !adminUser.isActive) {
      throw new ServiceError("UNAUTHORIZED", "Only active administrators can moderate reviews", 403);
    }
    actor = {
      type: "USER",
      userId: adminUser.id,
      clerkId: adminUser.clerkId,
      role: adminUser.role,
      email: adminUser.email,
    };
  } else {
    assertAdmin(actorOrClerkId);
    actor = actorOrClerkId;
  }

  const result = await prisma.$transaction(async (tx) => {
    return withIdempotency(tx, {
      key: input.idempotencyKey,
      route: "feedback:moderate",
      actor,
      payload: input,
      execute: async () => {
        const existing = await tx.feedback.findUnique({
          where: { id: input.feedbackId },
          select: { id: true, bookId: true, isModerated: true },
        });

        if (!existing) {
          throw new ServiceError("FEEDBACK_NOT_FOUND", "Feedback entry not found", 404);
        }

        const updated = await tx.feedback.update({
          where: { id: input.feedbackId },
          data: { isModerated: input.isModerated },
        });

        // Domain audit log
        await recordDomainAudit(tx, {
          entityType: "FEEDBACK",
          entityId: updated.id,
          action: "FEEDBACK_MODERATION_TOGGLED",
          actor,
          beforeState: { isModerated: existing.isModerated },
          afterState: { isModerated: updated.isModerated },
        });

        return {
          statusCode: 200,
          data: {
            id: updated.id,
            bookId: updated.bookId,
            isModerated: updated.isModerated,
          },
        };
      },
    });
  });

  // Invalidate cache post-commit
  await syncBookToSearchIndex(result.bookId);
  invalidateBookCache(result.bookId);

  return result;
}

/**
 * Service function for administrators to permanently delete an inappropriate review.
 * Enforces admin authorization, domain audit logging, and idempotency.
 */
export async function deleteFeedback(
  actorOrClerkId: VerifiedActor | string,
  rawInput: DeleteFeedbackInput
) {
  const input = DeleteFeedbackSchema.parse(rawInput);

  let actor: HumanActor;
  if (typeof actorOrClerkId === "string") {
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: actorOrClerkId },
    });
    if (!adminUser || adminUser.role !== "ADMIN" || !adminUser.isActive) {
      throw new ServiceError("UNAUTHORIZED", "Only active administrators can delete reviews", 403);
    }
    actor = {
      type: "USER",
      userId: adminUser.id,
      clerkId: adminUser.clerkId,
      role: adminUser.role,
      email: adminUser.email,
    };
  } else {
    assertAdmin(actorOrClerkId);
    actor = actorOrClerkId;
  }

  const result = await prisma.$transaction(async (tx) => {
    return withIdempotency(tx, {
      key: input.idempotencyKey,
      route: "feedback:delete",
      actor,
      payload: input,
      execute: async () => {
        const existing = await tx.feedback.findUnique({
          where: { id: input.feedbackId },
          select: { id: true, bookId: true, rating: true, comment: true, studentId: true },
        });

        if (!existing) {
          throw new ServiceError("FEEDBACK_NOT_FOUND", "Feedback entry not found", 404);
        }

        await tx.feedback.delete({
          where: { id: input.feedbackId },
        });

        // Domain audit log
        await recordDomainAudit(tx, {
          entityType: "FEEDBACK",
          entityId: existing.id,
          action: "FEEDBACK_DELETED",
          actor,
          beforeState: {
            id: existing.id,
            bookId: existing.bookId,
            rating: existing.rating,
            comment: existing.comment,
            studentId: existing.studentId,
          },
          afterState: null,
        });

        return {
          statusCode: 200,
          data: { success: true, deletedId: input.feedbackId, bookId: existing.bookId },
        };
      },
    });
  });

  await syncBookToSearchIndex(result.bookId);
  invalidateBookCache(result.bookId);

  return result;
}

/**
 * Check if an authenticated student has a returned loan for a specific book that has no feedback submitted yet.
 */
export async function getEligibleLoanForBookFeedback(
  bookId: string,
  clerkUserId: string
): Promise<{ loanId: string } | null> {
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });

  if (!user) return null;

  const eligibleLoan = await prisma.loan.findFirst({
    where: {
      studentId: user.id,
      bookCopy: { bookId },
      status: "RETURNED",
      feedback: { is: null },
    },
    select: { id: true },
    orderBy: { returnedAt: "desc" },
  });

  return eligibleLoan ? { loanId: eligibleLoan.id } : null;
}

/**
 * Submit or update a direct 5-star rating and written review for any catalog book title.
 * Invariant: Direct reviews use loanId: null and NEVER overwrite or modify a loan-linked review.
 * Invariant: Editing a direct review strictly preserves existing isModerated status so student edits cannot unhide admin-moderated reviews.
 */
export async function submitDirectBookReview(
  actorOrClerkId: VerifiedActor | string,
  rawInput: CreateDirectBookReviewInput
) {
  const input = CreateDirectBookReviewSchema.parse(rawInput);

  let actor: HumanActor;
  if (typeof actorOrClerkId === "string") {
    const user = await prisma.user.findUnique({
      where: { clerkId: actorOrClerkId },
    });
    if (!user || !user.isActive) {
      throw new ServiceError("USER_NOT_FOUND", "User profile not found", 404);
    }
    actor = {
      type: "USER",
      userId: user.id,
      clerkId: user.clerkId,
      role: user.role,
      email: user.email,
    };
  } else {
    if (!isHumanActor(actorOrClerkId)) {
      throw new ServiceError("UNAUTHORIZED_ACTOR", "Only human users can submit reviews", 403);
    }
    actor = actorOrClerkId;
  }

  const result = await prisma.$transaction(async (tx) => {
    return withIdempotency(tx, {
      key: input.idempotencyKey,
      route: "feedback:directReview",
      actor,
      payload: input,
      execute: async () => {
        const user = await tx.user.findFirst({
          where: {
            OR: [{ clerkId: actor.clerkId }, { id: actor.userId }],
            isActive: true,
          },
          select: { id: true, firstName: true, lastName: true },
        });

        if (!user) {
          throw new ServiceError("USER_NOT_FOUND", "User profile not found", 404);
        }

        const book = await tx.book.findUnique({
          where: { id: input.bookId },
          select: { id: true, title: true },
        });

        if (!book) {
          throw new ServiceError("BOOK_NOT_FOUND", "Book title not found", 404);
        }

        // Check if student already left a direct review for this book (distinct from verified-loan reviews)
        const existingFeedback = await tx.feedback.findFirst({
          where: {
            bookId: input.bookId,
            studentId: user.id,
            loanId: null, // Strict direct review invariant
          },
        });

        let feedbackRecord;
        if (existingFeedback) {
          feedbackRecord = await tx.feedback.update({
            where: { id: existingFeedback.id },
            data: {
              rating: input.rating,
              comment: input.comment,
              // Invariant: preserve existing isModerated status so student edit cannot bypass admin moderation
              isModerated: existingFeedback.isModerated,
            },
          });

          await recordDomainAudit(tx, {
            entityType: "FEEDBACK",
            entityId: feedbackRecord.id,
            action: "DIRECT_REVIEW_UPDATED",
            actor,
            beforeState: {
              rating: existingFeedback.rating,
              comment: existingFeedback.comment,
              isModerated: existingFeedback.isModerated,
            },
            afterState: {
              rating: feedbackRecord.rating,
              comment: feedbackRecord.comment,
              isModerated: feedbackRecord.isModerated,
            },
          });
        } else {
          feedbackRecord = await tx.feedback.create({
            data: {
              bookId: input.bookId,
              studentId: user.id,
              loanId: null,
              rating: input.rating,
              comment: input.comment,
              isModerated: false,
            },
          });

          await recordDomainAudit(tx, {
            entityType: "FEEDBACK",
            entityId: feedbackRecord.id,
            action: "DIRECT_REVIEW_CREATED",
            actor,
            beforeState: null,
            afterState: {
              rating: feedbackRecord.rating,
              comment: feedbackRecord.comment,
              isModerated: feedbackRecord.isModerated,
            },
          });
        }

        return {
          statusCode: 200,
          data: feedbackRecord,
        };
      },
    });
  });

  // Post-commit search index and server cache sync
  await syncBookToSearchIndex(input.bookId);
  invalidateBookCache(input.bookId);

  return result;
}

