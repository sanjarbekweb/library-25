import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/errors";
import {
  SubmitFeedbackSchema,
  SubmitFeedbackInput,
  ModerateFeedbackSchema,
  ModerateFeedbackInput,
  DeleteFeedbackSchema,
  DeleteFeedbackInput,
  AdminFeedbackQuerySchema,
  AdminFeedbackQueryInput,
} from "@/lib/schemas/feedback-schema";
import { Prisma } from "@prisma/client";

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
  loanId: string;
  rating: number;
  comment: string | null;
  isModerated: boolean;
  createdAt: Date;
  borrowedAt: Date;
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
 * Upholds Prisma Isolation invariant and strict server-verified identity.
 * Enforces loan status === 'RETURNED' and 1-feedback-per-loan database constraint.
 */
export async function submitBookFeedback(
  rawInput: SubmitFeedbackInput,
  clerkUserId: string
) {
  const input = SubmitFeedbackSchema.parse(rawInput);

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true, firstName: true, lastName: true },
  });

  if (!user) {
    throw new ServiceError("USER_NOT_FOUND", "User profile not found", 404);
  }

  const loan = await prisma.loan.findUnique({
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

  const feedback = await prisma.feedback.create({
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

  return {
    id: feedback.id,
    bookId: feedback.bookId,
    bookTitle: feedback.book.title,
    rating: feedback.rating,
    comment: feedback.comment,
    createdAt: feedback.createdAt,
  };
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

  const [totalCount, publishedCount, moderatedCount, allFeedbacksForStats, paginatedFeedbacks] =
    await Promise.all([
      prisma.feedback.count(),
      prisma.feedback.count({ where: { isModerated: false } }),
      prisma.feedback.count({ where: { isModerated: true } }),
      prisma.feedback.findMany({
        select: { rating: true },
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
    ]);

  const avgRatingSum = allFeedbacksForStats.reduce((acc, f) => acc + f.rating, 0);
  const averageRating =
    allFeedbacksForStats.length > 0
      ? Number((avgRatingSum / allFeedbacksForStats.length).toFixed(1))
      : null;

  const filteredTotal = await prisma.feedback.count({ where });

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
    borrowedAt: f.loan.borrowedAt,
    returnedAt: f.loan.returnedAt,
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
 */
export async function toggleFeedbackModeration(rawInput: ModerateFeedbackInput) {
  const input = ModerateFeedbackSchema.parse(rawInput);

  const existing = await prisma.feedback.findUnique({
    where: { id: input.feedbackId },
    select: { id: true, bookId: true },
  });

  if (!existing) {
    throw new ServiceError("FEEDBACK_NOT_FOUND", "Feedback entry not found", 404);
  }

  const updated = await prisma.feedback.update({
    where: { id: input.feedbackId },
    data: { isModerated: input.isModerated },
  });

  return {
    id: updated.id,
    bookId: updated.bookId,
    isModerated: updated.isModerated,
  };
}

/**
 * Service function for administrators to permanently delete an inappropriate review.
 */
export async function deleteFeedback(rawInput: DeleteFeedbackInput) {
  const input = DeleteFeedbackSchema.parse(rawInput);

  const existing = await prisma.feedback.findUnique({
    where: { id: input.feedbackId },
    select: { id: true, bookId: true },
  });

  if (!existing) {
    throw new ServiceError("FEEDBACK_NOT_FOUND", "Feedback entry not found", 404);
  }

  await prisma.feedback.delete({
    where: { id: input.feedbackId },
  });

  return { success: true, deletedId: input.feedbackId, bookId: existing.bookId };
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

