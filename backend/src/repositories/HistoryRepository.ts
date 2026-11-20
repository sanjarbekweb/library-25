import { prisma } from "../utils/prisma";
import { HistoryAction, Prisma } from "@prisma/client";
import { AuditLogFilterInput } from "../schemas/history.schema";

function differenceInCalendarDays(d1: Date, d2: Date): number {
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.floor((utc1 - utc2) / (1000 * 60 * 60 * 24));
}

export class HistoryRepository {
  async findUserLoansAndHistory(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    const loans = await prisma.loan.findMany({
      where: { studentId: user.id },
      include: {
        bookCopy: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                author: true,
                coverImageUrl: true,
                category: true,
              },
            },
          },
        },
        assistant: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        feedback: {
          select: {
            id: true,
            rating: true,
            comment: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();

    const formattedLoans = loans.map((loan) => {
      const isOverdue =
        loan.status === "OVERDUE" || (loan.status === "ACTIVE" && now.getTime() > loan.dueDate.getTime());
      const daysRemaining = differenceInCalendarDays(loan.dueDate, now);
      const daysOverdue = isOverdue
        ? Math.max(1, differenceInCalendarDays(now, loan.dueDate))
        : 0;

      return {
        id: loan.id,
        loanId: loan.id,
        copyId: loan.bookCopyId,
        copyBarcode: loan.bookCopy.barcode,
        bookId: loan.bookCopy.book.id,
        bookTitle: loan.bookCopy.book.title,
        bookAuthor: loan.bookCopy.book.author,
        coverImageUrl: loan.bookCopy.book.coverImageUrl,
        category: loan.bookCopy.book.category,
        condition: loan.bookCopy.condition,
        borrowedAt: loan.borrowedAt,
        dueDate: loan.dueDate,
        returnedAt: loan.returnedAt,
        status: isOverdue ? "OVERDUE" : loan.status,
        assistantName: `${loan.assistant.firstName} ${loan.assistant.lastName}`,
        daysRemaining,
        isOverdue,
        daysOverdue,
        feedback: loan.feedback
          ? {
              id: loan.feedback.id,
              rating: loan.feedback.rating,
              comment: loan.feedback.comment,
            }
          : null,
      };
    });

    const activeLoans = formattedLoans.filter(
      (l) => l.status === "ACTIVE" || l.status === "OVERDUE"
    );
    const historicalLoans = formattedLoans.filter((l) => l.status === "RETURNED");
    const overdueLoansCount = activeLoans.filter((l) => l.isOverdue).length;

    return {
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        role: user.role,
      },
      stats: {
        activeLoansCount: activeLoans.length,
        overdueLoansCount,
        returnedLoansCount: historicalLoans.length,
        totalLoansCount: formattedLoans.length,
      },
      activeLoans,
      historicalLoans,
    };
  }

  async findCopyTraceabilityByBarcode(barcode: string) {
    const trimmed = barcode.trim();
    const cleanQuery = trimmed.replace(/[- ]/g, "");

    const copy = await prisma.bookCopy.findFirst({
      where: {
        OR: [
          { barcode: { equals: trimmed, mode: "insensitive" } },
          { barcode: { equals: cleanQuery, mode: "insensitive" } },
          { barcode: { contains: trimmed, mode: "insensitive" } },
          { id: trimmed },
          {
            book: {
              OR: [
                { title: { contains: trimmed, mode: "insensitive" } },
                { author: { contains: trimmed, mode: "insensitive" } },
                { isbn: { contains: trimmed, mode: "insensitive" } },
                { isbn: { contains: cleanQuery, mode: "insensitive" } },
              ],
            },
          },
        ],
      },
      orderBy: { updatedAt: "desc" },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
            category: true,
            coverImageUrl: true,
          },
        },
        currentHolder: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        loans: {
          where: { status: "ACTIVE" },
          include: {
            assistant: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        history: {
          include: {
            actor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!copy) {
      return null;
    }

    const activeLoan = copy.loans[0]
      ? {
          id: copy.loans[0].id,
          borrowedAt: copy.loans[0].borrowedAt,
          dueDate: copy.loans[0].dueDate,
          assistantName: `${copy.loans[0].assistant.firstName} ${copy.loans[0].assistant.lastName}`.trim(),
        }
      : null;

    return {
      id: copy.id,
      barcode: copy.barcode,
      condition: copy.condition,
      status: copy.status,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
      book: copy.book,
      currentHolder: copy.currentHolder
        ? {
            id: copy.currentHolder.id,
            name: `${copy.currentHolder.firstName} ${copy.currentHolder.lastName}`.trim(),
            email: copy.currentHolder.email,
            role: copy.currentHolder.role,
          }
        : null,
      activeLoan,
      history: copy.history.map((log) => ({
        id: log.id,
        bookCopyId: log.bookCopyId,
        action: log.action,
        actorId: log.actorId,
        actorName: log.actor
          ? `${log.actor.firstName} ${log.actor.lastName}`.trim()
          : log.systemActor ?? "System",
        actorEmail: log.actor?.email ?? "",
        actorRole: log.actorRole ?? log.actor?.role ?? "Role not recorded",
        previousState: log.previousState,
        newState: log.newState,
        notes: log.notes,
        createdAt: log.createdAt,
      })),
    };
  }

  async findCopyHistory(copyId: string) {
    const copyExists = await prisma.bookCopy.findUnique({
      where: { id: copyId },
      select: { id: true },
    });

    if (!copyExists) {
      return null;
    }

    const logs = await prisma.bookHistory.findMany({
      where: { bookCopyId: copyId },
      include: {
        actor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return logs.map((log) => ({
      id: log.id,
      bookCopyId: log.bookCopyId,
      action: log.action,
      actorId: log.actorId,
      actorName: log.actor
        ? `${log.actor.firstName} ${log.actor.lastName}`.trim()
        : log.systemActor ?? "System",
      actorEmail: log.actor?.email ?? "",
      actorRole: log.actorRole ?? log.actor?.role ?? "Role not recorded",
      previousState: log.previousState,
      newState: log.newState,
      notes: log.notes,
      createdAt: log.createdAt,
    }));
  }

  async findAllAuditLogs(filter: AuditLogFilterInput) {
    const where: Prisma.BookHistoryWhereInput = {};

    if (filter.copyId) where.bookCopyId = filter.copyId;
    if (filter.actorId) where.actorId = filter.actorId;
    if (filter.action) where.action = filter.action;

    const logs = await prisma.bookHistory.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: filter.limit,
    });

    return logs.map((log) => ({
      id: log.id,
      bookCopyId: log.bookCopyId,
      action: log.action,
      actorId: log.actorId,
      actorName: log.actor
        ? `${log.actor.firstName} ${log.actor.lastName}`.trim()
        : log.systemActor ?? "System",
      actorEmail: log.actor?.email ?? "",
      actorRole: log.actorRole ?? log.actor?.role ?? "Role not recorded",
      previousState: log.previousState,
      newState: log.newState,
      notes: log.notes,
      createdAt: log.createdAt,
    }));
  }
}
