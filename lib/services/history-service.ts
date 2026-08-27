import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/errors";
import { CACHE_TAGS, CACHE_TTL } from "@/lib/cache/tags";
import {
  CopyHistoryQuerySchema,
  AuditLogFilterSchema,
  AuditLogFilterInput,
} from "@/lib/schemas/history-schema";
import { CopyCondition, CopyStatus, HistoryAction, LoanStatus } from "@prisma/client";
import { differenceInCalendarDays, isAfter } from "date-fns";

export interface BookHistoryItem {
  id: string;
  bookCopyId: string;
  action: HistoryAction;
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  previousState: string | null;
  newState: string | null;
  notes: string | null;
  createdAt: Date;
}

export interface CopyTraceabilityDetail {
  id: string;
  barcode: string;
  condition: CopyCondition;
  status: CopyStatus;
  createdAt: Date;
  updatedAt: Date;
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string | null;
    category: string;
    coverImageUrl: string | null;
  };
  currentHolder: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  activeLoan: {
    id: string;
    borrowedAt: Date;
    dueDate: Date;
    assistantName: string;
  } | null;
  history: BookHistoryItem[];
}

export interface StudentLoanItem {
  id: string;
  loanId: string;
  copyId: string;
  copyBarcode: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  coverImageUrl: string | null;
  category: string;
  condition: CopyCondition;
  borrowedAt: Date;
  dueDate: Date;
  returnedAt: Date | null;
  status: LoanStatus;
  assistantName: string;
  daysRemaining: number;
  isOverdue: boolean;
  daysOverdue: number;
  feedback?: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
}

export interface StudentLoansOverview {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  stats: {
    activeLoansCount: number;
    overdueLoansCount: number;
    returnedLoansCount: number;
    totalLoansCount: number;
  };
  activeLoans: StudentLoanItem[];
  historicalLoans: StudentLoanItem[];
}

/**
 * Fetch time-sequenced audit records for a physical copy.
 */
export async function getCopyHistory(copyId: string): Promise<BookHistoryItem[]> {
  CopyHistoryQuerySchema.parse({ copyId });

  const copyExists = await prisma.bookCopy.findUnique({
    where: { id: copyId },
    select: { id: true },
  });

  if (!copyExists) {
    throw new ServiceError("COPY_NOT_FOUND", "Book copy not found", 404);
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
    actorName: log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : "System",
    actorEmail: log.actor?.email ?? "",
    actorRole: log.actor?.role ?? "UNKNOWN",
    previousState: log.previousState,
    newState: log.newState,
    notes: log.notes,
    createdAt: log.createdAt,
  }));
}

/**
 * Fetch complete physical copy details and immutable audit history by barcode.
 */
export async function getCopyTraceabilityByBarcode(
  barcode: string
): Promise<CopyTraceabilityDetail> {
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
    throw new ServiceError("COPY_NOT_FOUND", `No book copy found with barcode "${barcode}"`, 404);
  }

  const activeLoan = copy.loans[0]
    ? {
        id: copy.loans[0].id,
        borrowedAt: copy.loans[0].borrowedAt,
        dueDate: copy.loans[0].dueDate,
        assistantName: `${copy.loans[0].assistant.firstName} ${copy.loans[0].assistant.lastName}`,
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
          name: `${copy.currentHolder.firstName} ${copy.currentHolder.lastName}`,
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
      actorName: log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : "System",
      actorEmail: log.actor?.email ?? "",
      actorRole: log.actor?.role ?? "UNKNOWN",
      previousState: log.previousState,
      newState: log.newState,
      notes: log.notes,
      createdAt: log.createdAt,
    })),
  };
}

async function fetchRawUserLoansAndHistory(userId: string): Promise<StudentLoansOverview> {
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
    throw new ServiceError("USER_NOT_FOUND", "User profile not found", 404);
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

  const formattedLoans: StudentLoanItem[] = loans.map((loan) => {
    const isOverdue = loan.status === "OVERDUE" || (loan.status === "ACTIVE" && isAfter(now, loan.dueDate));
    const daysRemaining = differenceInCalendarDays(loan.dueDate, now);
    const daysOverdue = isOverdue ? Math.max(1, differenceInCalendarDays(now, loan.dueDate)) : 0;

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

  const activeLoans = formattedLoans.filter((l) => l.status === "ACTIVE" || l.status === "OVERDUE");
  const historicalLoans = formattedLoans.filter((l) => l.status === "RETURNED");
  const overdueLoansCount = activeLoans.filter((l) => l.isOverdue).length;

  return {
    user: {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
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

const getCachedUserLoansAndHistory = unstable_cache(
  async (uId: string) => fetchRawUserLoansAndHistory(uId),
  ["user-loans-history-data"],
  {
    revalidate: CACHE_TTL.SHORT,
    tags: [CACHE_TAGS.CATALOG],
  }
);

/**
 * Fetch personal active checkouts, historical returns, and due date metrics for a student.
 * Cached with Next.js unstable_cache.
 */
export async function getUserLoansAndHistory(clerkUserId: string): Promise<StudentLoansOverview> {
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });

  if (!user) {
    throw new ServiceError("USER_NOT_FOUND", "User profile not found", 404);
  }

  return getCachedUserLoansAndHistory(user.id);
}

/**
 * Fetch filtered system audit logs for assistant/admin monitoring.
 */
export async function getAllAuditLogs(filterInput?: AuditLogFilterInput): Promise<BookHistoryItem[]> {
  const filter = AuditLogFilterSchema.parse(filterInput || {});

  const whereClause: {
    bookCopyId?: string;
    actorId?: string;
    action?: HistoryAction;
  } = {};

  if (filter.copyId) whereClause.bookCopyId = filter.copyId;
  if (filter.actorId) whereClause.actorId = filter.actorId;
  if (filter.action) whereClause.action = filter.action;

  const logs = await prisma.bookHistory.findMany({
    where: whereClause,
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
    actorName: log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : "System",
    actorEmail: log.actor?.email ?? "",
    actorRole: log.actor?.role ?? "UNKNOWN",
    previousState: log.previousState,
    newState: log.newState,
    notes: log.notes,
    createdAt: log.createdAt,
  }));
}
