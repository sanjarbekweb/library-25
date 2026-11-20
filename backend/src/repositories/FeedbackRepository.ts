import { prisma } from "../utils/prisma";
import { Prisma, DomainEntityType, User } from "@prisma/client";
import { SubmitFeedbackInput, AdminFeedbackQuery } from "../schemas/feedback.schema";

export class FeedbackRepository {
  async createFeedback(input: SubmitFeedbackInput, studentId: string) {
    return prisma.$transaction(async (tx) => {
      // If loan-linked, check that the loan belongs to this student and is returned
      if (input.loanId) {
        const loan = await tx.loan.findFirst({
          where: {
            id: input.loanId,
            studentId,
            bookCopy: { bookId: input.bookId },
            status: "RETURNED",
          },
          include: { feedback: true },
        });

        if (!loan) {
          throw new Error("INVALID_LOAN");
        }

        if (loan.feedback) {
          throw new Error("FEEDBACK_ALREADY_EXISTS");
        }
      } else {
        const existingDirect = await tx.feedback.findFirst({
          where: {
            bookId: input.bookId,
            studentId,
            loanId: null,
          },
        });

        if (existingDirect) {
          const updated = await tx.feedback.update({
            where: { id: existingDirect.id },
            data: {
              rating: input.rating,
              comment: input.comment?.trim() || null,
              isModerated: existingDirect.isModerated,
            },
          });

          await tx.domainAudit.create({
            data: {
              entityType: DomainEntityType.FEEDBACK,
              entityId: updated.id,
              action: "UPDATE",
              actorId: studentId,
              beforeState: { rating: existingDirect.rating, comment: existingDirect.comment, isModerated: existingDirect.isModerated },
              afterState: { rating: updated.rating, comment: updated.comment, isModerated: updated.isModerated },
            },
          });

          return updated;
        }
      }

      const feedback = await tx.feedback.create({
        data: {
          bookId: input.bookId,
          studentId,
          loanId: input.loanId,
          rating: input.rating,
          comment: input.comment?.trim() || null,
          isModerated: false,
        },
      });

      await tx.domainAudit.create({
        data: {
          entityType: DomainEntityType.FEEDBACK,
          entityId: feedback.id,
          action: "CREATE",
          actorId: studentId,
          afterState: { rating: feedback.rating, comment: feedback.comment },
        },
      });

      return feedback;
    });
  }

  async findFeedbacksByBook(bookId: string) {
    return prisma.feedback.findMany({
      where: {
        bookId,
        isModerated: false,
      },
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAllAdmin(queryParams: AdminFeedbackQuery) {
    const { status, rating, search, page, limit } = queryParams;
    const where: Prisma.FeedbackWhereInput = {};

    if (status === "MODERATED") {
      where.isModerated = true;
    } else if (status === "PUBLISHED") {
      where.isModerated = false;
    }

    if (rating) {
      where.rating = rating;
    }

    if (search && search.trim()) {
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

    const skip = (page - 1) * limit;

    const [paginatedFeedbacks, total, totalCount, moderatedCount, publishedCount, avgAgg] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          book: { select: { id: true, title: true, author: true, category: true, coverImageUrl: true } },
          student: { select: { id: true, firstName: true, lastName: true, email: true } },
          loan: { select: { id: true, borrowedAt: true, returnedAt: true } },
        },
      }),
      prisma.feedback.count({ where }),
      prisma.feedback.count(),
      prisma.feedback.count({ where: { isModerated: true } }),
      prisma.feedback.count({ where: { isModerated: false } }),
      prisma.feedback.aggregate({ _avg: { rating: true } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    const averageRating = avgAgg._avg.rating !== null ? Number(avgAgg._avg.rating.toFixed(1)) : null;

    const feedbacks = paginatedFeedbacks.map((f) => ({
      id: f.id,
      bookId: f.bookId,
      bookTitle: f.book.title,
      bookAuthor: f.book.author,
      bookCategory: f.book.category || "General",
      coverImageUrl: f.book.coverImageUrl,
      studentId: f.studentId,
      studentName: `${f.student.firstName} ${f.student.lastName}`.trim(),
      studentEmail: f.student.email,
      loanId: f.loanId,
      rating: f.rating,
      comment: f.comment,
      isModerated: f.isModerated,
      createdAt: f.createdAt,
      borrowedAt: f.loan?.borrowedAt ?? null,
      returnedAt: f.loan?.returnedAt ?? null,
      book: f.book,
      student: f.student,
    }));

    return {
      feedbacks,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      stats: {
        totalCount,
        moderatedCount,
        publishedCount,
        averageRating,
      },
    };
  }

  async toggleModeration(feedbackId: string, isModerated: boolean, actor: User) {
    return prisma.$transaction(async (tx) => {
      const feedback = await tx.feedback.findUnique({
        where: { id: feedbackId },
      });

      if (!feedback) {
        throw new Error("FEEDBACK_NOT_FOUND");
      }

      const updated = await tx.feedback.update({
        where: { id: feedbackId },
        data: { isModerated },
      });

      await tx.domainAudit.create({
        data: {
          entityType: DomainEntityType.FEEDBACK,
          entityId: feedback.id,
          action: isModerated ? "MODERATE_HIDE" : "MODERATE_PUBLISH",
          actorId: actor.id,
          actorRole: actor.role,
          beforeState: { isModerated: feedback.isModerated },
          afterState: { isModerated },
        },
      });

      return updated;
    });
  }

  async deleteFeedback(feedbackId: string, actor: User) {
    return prisma.$transaction(async (tx) => {
      const feedback = await tx.feedback.findUnique({
        where: { id: feedbackId },
      });

      if (!feedback) {
        throw new Error("FEEDBACK_NOT_FOUND");
      }

      await tx.feedback.delete({
        where: { id: feedbackId },
      });

      await tx.domainAudit.create({
        data: {
          entityType: DomainEntityType.FEEDBACK,
          entityId: feedback.id,
          action: "DELETE",
          actorId: actor.id,
          actorRole: actor.role,
          beforeState: { rating: feedback.rating, comment: feedback.comment },
        },
      });

      return feedback;
    });
  }

  async findEligibleLoan(bookId: string, studentId: string) {
    return prisma.loan.findFirst({
      where: {
        studentId,
        bookCopy: { bookId },
        status: "RETURNED",
        feedback: null,
      },
      select: {
        id: true,
        returnedAt: true,
        bookCopy: { select: { barcode: true } },
      },
      orderBy: { returnedAt: "desc" },
    });
  }
}
