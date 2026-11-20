import { prisma } from "@/lib/prisma";
import { syncBookToSearchIndex } from "@/lib/search/sync";
import { invalidateBookCache, invalidateUserLoansCache } from "@/lib/cache/invalidation";
import { ServiceError } from "@/lib/errors";
import {
  CheckoutSchema,
  CheckinSchema,
  CheckoutInput,
  CheckinInput,
} from "@/lib/schemas/circulation-schema";
import { CopyCondition, CopyStatus, HistoryAction, Prisma } from "@prisma/client";
import { addDays, isAfter } from "date-fns";
import { VerifiedActor, assertAssistantOrAdmin } from "@/lib/auth/verified-actor";
import { recordCopyAudit } from "@/lib/services/audit-service";
import { withIdempotency } from "@/lib/services/idempotency-service";

export interface StudentSearchResult {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  activeLoansCount: number;
  activeReservationsCount: number;
}

export interface CopySearchResult {
  id: string;
  barcode: string;
  condition: CopyCondition;
  status: CopyStatus;
  version: number;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookIsbn: string | null;
  coverImageUrl: string | null;
  category: string;
  currentHolderName: string | null;
  currentHolderId: string | null;
  activeLoanId: string | null;
  dueDate: Date | null;
  borrowedAt: Date | null;
}

export interface CirculationDeskSummary {
  activeLoansCount: number;
  overdueLoansCount: number;
  pendingReservationsCount: number;
  availableCopiesCount: number;
}

export interface PendingReservationItem {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  coverImageUrl: string | null;
  studentId: string;
  studentName: string;
  studentEmail: string;
  copyId: string | null;
  copyBarcode: string | null;
  expiresAt: Date;
  createdAt: Date;
}

export interface ActiveLoanItem {
  id: string;
  loanId: string;
  copyId: string;
  copyBarcode: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  coverImageUrl: string | null;
  studentId: string;
  studentName: string;
  studentEmail: string;
  borrowedAt: Date;
  dueDate: Date;
  isOverdue: boolean;
  condition: CopyCondition;
}

async function resolveAssistantActor(actorOrClerkId: VerifiedActor | string): Promise<VerifiedActor> {
  if (typeof actorOrClerkId === "object" && actorOrClerkId !== null && "type" in actorOrClerkId) {
    assertAssistantOrAdmin(actorOrClerkId);
    return actorOrClerkId;
  }

  // Fallback for legacy calls passing string clerkId
  const user = await prisma.user.findUnique({
    where: { clerkId: actorOrClerkId },
  });

  if (!user) {
    throw new ServiceError("USER_NOT_FOUND", "Assistant user account not found", 404);
  }

  if (user.role !== "ASSISTANT" && user.role !== "ADMIN") {
    throw new ServiceError(
      "UNAUTHORIZED_ROLE",
      "Only assistants or administrators can execute circulation operations",
      403
    );
  }

  return {
    type: "USER",
    userId: user.id,
    clerkId: user.clerkId,
    email: user.email,
    role: user.role,
  };
}

/**
 * Execute in-person checkout of a physical book copy to a student.
 * System Invariants:
 * - Exact copy identity: resolved by exact ID or exact unique barcode (no substring/title matching)
 * - Copy-first lock order with optimistic version checking
 * - Owner/version predicates: verifies student active status and hold exclusivity
 * - Exact hold fulfillment: transitions pending reservation for this student/copy to FULFILLED
 * - Atomic $transaction: creates Loan, claims BookCopy, fulfills hold, records BookHistory audit log
 * - Idempotency: retry-safe submission with IdempotencyRecord
 * - Post-commit Meilisearch search index sync and cache invalidation
 */
export async function checkoutBookCopy(
  input: CheckoutInput,
  actorOrClerkId: VerifiedActor | string
) {
  const parsed = CheckoutSchema.parse(input);
  const actor = await resolveAssistantActor(actorOrClerkId);

  // 1. Resolve target student
  const student = await prisma.user.findUnique({
    where: { id: parsed.studentId },
  });

  if (!student) {
    throw new ServiceError("STUDENT_NOT_FOUND", "Student account not found", 404);
  }

  if (!student.isActive) {
    throw new ServiceError(
      "STUDENT_INACTIVE",
      "Student account is deactivated and cannot borrow books",
      400
    );
  }

  // 2. Resolve BookCopy by EXACT ID or EXACT unique Barcode
  const copyIdTrimmed = parsed.copyId.trim();

  const copy = await prisma.bookCopy.findFirst({
    where: {
      OR: [
        { id: copyIdTrimmed },
        { barcode: copyIdTrimmed },
      ],
    },
    include: {
      book: true,
      currentHolder: true,
      reservations: {
        where: {
          status: "PENDING",
          expiresAt: { gt: new Date() },
        },
        include: { student: true },
      },
    },
  });

  if (!copy) {
    throw new ServiceError(
      "COPY_NOT_FOUND",
      "Specified physical book copy barcode/ID not found. Please provide exact barcode.",
      404
    );
  }

  // 3. Validate Copy Availability & Reservation Lock
  if (copy.status === "BORROWED") {
    throw new ServiceError(
      "COPY_ALREADY_BORROWED",
      `Physical copy ${copy.barcode} is currently checked out to another holder`,
      409
    );
  }

  if (copy.status === "MAINTENANCE" || copy.status === "LOST") {
    throw new ServiceError(
      "COPY_UNAVAILABLE",
      `Physical copy ${copy.barcode} is currently in ${copy.status.toLowerCase()} status`,
      409
    );
  }

  // Check active reservations on copy and holder position
  const activeCopyReservation = copy.reservations[0];
  const reservingHolderName = copy.currentHolder
    ? `${copy.currentHolder.firstName} ${copy.currentHolder.lastName}`
    : activeCopyReservation?.student
    ? `${activeCopyReservation.student.firstName} ${activeCopyReservation.student.lastName}`
    : "another student";

  if (
    copy.status === "RESERVED" &&
    (copy.currentHolderId ? copy.currentHolderId !== student.id : (activeCopyReservation && activeCopyReservation.studentId !== student.id))
  ) {
    throw new ServiceError(
      "COPY_RESERVED_OTHER",
      `Physical copy ${copy.barcode} is currently reserved on hold for student ${reservingHolderName}`,
      409
    );
  }

  const now = new Date();
  const dueDate = addDays(now, parsed.dueDays);

  // 4. Atomic Prisma Transaction with Copy-First Lock & Idempotency
  const transactionResult = await prisma.$transaction(async (tx) => {
    return withIdempotency(tx, {
      key: parsed.idempotencyKey,
      route: "circulation:checkout",
      actor,
      payload: parsed,
      execute: async () => {
        // Copy-first lock: atomic conditional claim with optimistic version predicate
        const claimedCopy = await tx.bookCopy.updateMany({
          where: {
            id: copy.id,
            status: { in: [CopyStatus.AVAILABLE, CopyStatus.RESERVED] },
            version: parsed.expectedVersion !== undefined ? parsed.expectedVersion : copy.version,
            ...(copy.status === CopyStatus.RESERVED ? { currentHolderId: student.id } : {}),
          },
          data: {
            status: CopyStatus.BORROWED,
            currentHolderId: student.id,
            version: { increment: 1 },
          },
        });

        if (claimedCopy.count === 0) {
          throw new ServiceError(
            "COPY_CONCURRENTLY_ACQUIRED",
            `Physical copy ${copy.barcode} was concurrently acquired or modified by another session`,
            409
          );
        }

        // Create Active Loan
        const loan = await tx.loan.create({
          data: {
            bookCopyId: copy.id,
            studentId: student.id,
            assistantId: actor.type === "USER" ? actor.userId : student.id,
            borrowedAt: now,
            dueDate,
            status: "ACTIVE",
          },
        });

        // Exact hold fulfillment: fulfill any pending reservation by this student on this book or copy
        await tx.reservation.updateMany({
          where: {
            studentId: student.id,
            bookId: copy.bookId,
            status: "PENDING",
          },
          data: {
            status: "FULFILLED",
            bookCopyId: copy.id,
          },
        });

        // Append immutable BookHistory log
        await recordCopyAudit(
          tx,
          {
            bookCopyId: copy.id,
            action: HistoryAction.CHECKOUT,
            actor,
            previousState: copy.status,
            newState: CopyStatus.BORROWED,
            notes: `Checked out to ${student.firstName} ${student.lastName} (${student.email}). Due date: ${dueDate.toISOString().split("T")[0]}`,
          }
        );

        return {
          statusCode: 201,
          data: {
            loanId: loan.id,
            copyBarcode: copy.barcode,
            bookTitle: copy.book.title,
            studentName: `${student.firstName} ${student.lastName}`,
            dueDate,
          },
        };
      },
    });
  });

  // 5. Search Cache & Server Cache Synchronization (Post-commit)
  await syncBookToSearchIndex(copy.bookId);
  invalidateBookCache(copy.bookId);
  invalidateUserLoansCache(student.id);

  return transactionResult;
}

/**
 * Execute in-person check-in of a returned book copy.
 * System Invariants:
 * - Exact copy identity: resolved by exact ID or exact unique barcode
 * - Single close of active or overdue loan (checked via updateMany count === 1)
 * - Guarded holder release: clears currentHolderId and increments version
 * - Atomic $transaction closing Loan, resetting copy state, recording BookHistory audit log
 * - Idempotency: retry-safe submission with IdempotencyRecord
 * - Post-commit Meilisearch search index sync and cache invalidation
 */
export async function checkinBookCopy(
  input: CheckinInput,
  actorOrClerkId: VerifiedActor | string
) {
  const parsed = CheckinSchema.parse(input);
  const actor = await resolveAssistantActor(actorOrClerkId);

  const copyIdTrimmed = parsed.copyId.trim();

  // 1. Resolve exact copy
  const copy = await prisma.bookCopy.findFirst({
    where: {
      OR: [
        { id: copyIdTrimmed },
        { barcode: copyIdTrimmed },
      ],
    },
    include: {
      book: true,
      loans: {
        where: { status: { in: ["ACTIVE", "OVERDUE"] } },
        include: { student: true },
        orderBy: { borrowedAt: "desc" },
      },
    },
  });

  if (!copy) {
    throw new ServiceError(
      "COPY_NOT_FOUND",
      "Specified physical book copy barcode/ID not found. Please provide exact barcode.",
      404
    );
  }

  const activeLoan = copy.loans[0];
  if (!activeLoan) {
    throw new ServiceError(
      "NO_ACTIVE_LOAN",
      `Physical copy ${copy.barcode} does not have an active or overdue borrowing record to check in`,
      400
    );
  }

  // Determine target condition and status
  const targetCondition = parsed.condition || copy.condition;
  let targetStatus: CopyStatus = CopyStatus.AVAILABLE;

  if (parsed.status) {
    targetStatus = parsed.status;
  } else if (targetCondition === CopyCondition.DAMAGED) {
    targetStatus = CopyStatus.MAINTENANCE;
  }

  const now = new Date();

  // 2. Atomic Prisma Transaction with Copy-First Lock & Single Close of Loan
  const transactionResult = await prisma.$transaction(async (tx) => {
    return withIdempotency(tx, {
      key: parsed.idempotencyKey,
      route: "circulation:checkin",
      actor,
      payload: parsed,
      execute: async () => {
        // Copy-first lock & guarded holder release
        const updatedCopy = await tx.bookCopy.updateMany({
          where: {
            id: copy.id,
            status: CopyStatus.BORROWED,
            version: parsed.expectedVersion !== undefined ? parsed.expectedVersion : copy.version,
          },
          data: {
            status: targetStatus,
            condition: targetCondition,
            currentHolderId: null,
            version: { increment: 1 },
          },
        });

        if (updatedCopy.count === 0) {
          throw new ServiceError(
            "COPY_CONCURRENTLY_MODIFIED",
            `Physical copy ${copy.barcode} was concurrently modified or already returned`,
            409
          );
        }

        // Single close of active/overdue loan
        const closedLoan = await tx.loan.updateMany({
          where: {
            id: activeLoan.id,
            status: { in: ["ACTIVE", "OVERDUE"] },
          },
          data: {
            status: "RETURNED",
            returnedAt: now,
          },
        });

        if (closedLoan.count === 0) {
          throw new ServiceError(
            "LOAN_ALREADY_CLOSED",
            "This borrowing record was concurrently returned or closed",
            409
          );
        }

        // Append immutable BookHistory audit log
        await recordCopyAudit(
          tx,
          {
            bookCopyId: copy.id,
            action: HistoryAction.CHECKIN,
            actor,
            previousState: copy.status,
            newState: targetStatus,
            notes:
              parsed.notes ||
              `Checked in from ${activeLoan.student.firstName} ${activeLoan.student.lastName}. Condition: ${targetCondition}. Status set to ${targetStatus}`,
          }
        );

        return {
          statusCode: 200,
          data: {
            loanId: activeLoan.id,
            copyBarcode: copy.barcode,
            bookTitle: copy.book.title,
            studentName: `${activeLoan.student.firstName} ${activeLoan.student.lastName}`,
            returnedAt: now,
            newStatus: targetStatus,
            newCondition: targetCondition,
          },
        };
      },
    });
  });

  // 3. Search Cache & Server Cache Synchronization (Post-commit)
  await syncBookToSearchIndex(copy.bookId);
  invalidateBookCache(copy.bookId);
  invalidateUserLoansCache(activeLoan.student.id);

  return transactionResult;
}

/**
 * Autocomplete / lookup student accounts for checkout assignment.
 */
export async function lookupStudents(query: string): Promise<StudentSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT", isActive: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        _count: {
          select: {
            loans: { where: { status: { in: ["ACTIVE", "OVERDUE"] } } },
            reservations: { where: { status: "PENDING" } },
          },
        },
      },
    });

    return students.map((s) => ({
      id: s.id,
      clerkId: s.clerkId,
      email: s.email,
      firstName: s.firstName,
      lastName: s.lastName,
      role: s.role,
      isActive: s.isActive,
      activeLoansCount: s._count.loans,
      activeReservationsCount: s._count.reservations,
    }));
  }

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      isActive: true,
      OR: [
        { firstName: { contains: trimmed, mode: "insensitive" } },
        { lastName: { contains: trimmed, mode: "insensitive" } },
        { email: { contains: trimmed, mode: "insensitive" } },
        { clerkId: { contains: trimmed, mode: "insensitive" } },
      ],
    },
    take: 10,
    select: {
      id: true,
      clerkId: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      _count: {
        select: {
          loans: { where: { status: { in: ["ACTIVE", "OVERDUE"] } } },
          reservations: { where: { status: "PENDING" } },
        },
      },
    },
  });

  return students.map((s) => ({
    id: s.id,
    clerkId: s.clerkId,
    email: s.email,
    firstName: s.firstName,
    lastName: s.lastName,
    role: s.role,
    isActive: s.isActive,
    activeLoansCount: s._count.loans,
    activeReservationsCount: s._count.reservations,
  }));
}

interface SelectedCopyRecord {
  id: string;
  barcode: string;
  condition: CopyCondition;
  status: CopyStatus;
  version: number;
  currentHolderId: string | null;
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string | null;
    coverImageUrl: string | null;
    category: string;
  };
  currentHolder: {
    firstName: string;
    lastName: string;
  } | null;
  loans: {
    id: string;
    dueDate: Date;
    borrowedAt: Date;
  }[];
}

/**
 * Search physical copies for barcode scan / quick selection.
 */
export async function lookupBookCopies(query: string): Promise<CopySearchResult[]> {
  const trimmed = query.trim();
  const mapCopy = (c: SelectedCopyRecord): CopySearchResult => ({
    id: c.id,
    barcode: c.barcode,
    condition: c.condition,
    status: c.status,
    version: c.version,
    bookId: c.book.id,
    bookTitle: c.book.title,
    bookAuthor: c.book.author,
    bookIsbn: c.book.isbn,
    coverImageUrl: c.book.coverImageUrl,
    category: c.book.category,
    currentHolderName: c.currentHolder
      ? `${c.currentHolder.firstName} ${c.currentHolder.lastName}`
      : null,
    currentHolderId: c.currentHolderId,
    activeLoanId: c.loans[0]?.id || null,
    dueDate: c.loans[0]?.dueDate || null,
    borrowedAt: c.loans[0]?.borrowedAt || null,
  });

  const bookSelect = {
    id: true,
    title: true,
    author: true,
    isbn: true,
    coverImageUrl: true,
    category: true,
  };

  const holderSelect = {
    firstName: true,
    lastName: true,
  };

  const loanSelect = {
    id: true,
    dueDate: true,
    borrowedAt: true,
  };

  if (!trimmed) {
    const copies = await prisma.bookCopy.findMany({
      take: 12,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        barcode: true,
        condition: true,
        status: true,
        version: true,
        currentHolderId: true,
        book: { select: bookSelect },
        currentHolder: { select: holderSelect },
        loans: { where: { status: { in: ["ACTIVE", "OVERDUE"] } }, select: loanSelect, take: 1 },
      },
    });

    return copies.map(mapCopy);
  }

  const cleanQuery = trimmed.replace(/[- ]/g, "");

  // Step 1: Direct Substring & Barcode Search
  let copies = await prisma.bookCopy.findMany({
    where: {
      OR: [
        { barcode: { contains: trimmed, mode: "insensitive" } },
        { barcode: { contains: cleanQuery, mode: "insensitive" } },
        { id: trimmed },
        {
          book: {
            OR: [
              { title: { contains: trimmed, mode: "insensitive" } },
              { author: { contains: trimmed, mode: "insensitive" } },
              { category: { contains: trimmed, mode: "insensitive" } },
              { isbn: { contains: trimmed, mode: "insensitive" } },
              { isbn: { contains: cleanQuery, mode: "insensitive" } },
            ],
          },
        },
      ],
    },
    take: 24,
    select: {
      id: true,
      barcode: true,
      condition: true,
      status: true,
      version: true,
      currentHolderId: true,
      book: { select: bookSelect },
      currentHolder: { select: holderSelect },
      loans: { where: { status: { in: ["ACTIVE", "OVERDUE"] } }, select: loanSelect, take: 1 },
    },
  });

  // Step 2: Tokenized Fallback
  if (copies.length === 0) {
    const tokens = trimmed
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length >= 2);

    if (tokens.length > 0) {
      const tokenConditions: Prisma.BookCopyWhereInput[] = [];

      for (const token of tokens) {
        tokenConditions.push(
          { barcode: { contains: token, mode: "insensitive" } },
          {
            book: {
              OR: [
                { title: { contains: token, mode: "insensitive" } },
                { author: { contains: token, mode: "insensitive" } },
                { category: { contains: token, mode: "insensitive" } },
              ],
            },
          }
        );
      }

      copies = await prisma.bookCopy.findMany({
        where: {
          OR: tokenConditions,
        },
        take: 24,
        select: {
          id: true,
          barcode: true,
          condition: true,
          status: true,
          version: true,
          currentHolderId: true,
          book: { select: bookSelect },
          currentHolder: { select: holderSelect },
          loans: { where: { status: { in: ["ACTIVE", "OVERDUE"] } }, select: loanSelect, take: 1 },
        },
      });
    }
  }

  return copies.map(mapCopy);
}

/**
 * Fetch complete state bundle for Circulation Desk UI.
 */
export async function getCirculationDeskData() {
  const now = new Date();

  const [
    activeLoansCount,
    overdueLoansCount,
    pendingReservationsCount,
    availableCopiesCount,
    pendingReservations,
    activeLoans,
  ] = await Promise.all([
    prisma.loan.count({ where: { status: { in: ["ACTIVE", "OVERDUE"] } } }),
    prisma.loan.count({
      where: {
        status: { in: ["ACTIVE", "OVERDUE"] },
        dueDate: { lt: now },
      },
    }),
    prisma.reservation.count({
      where: {
        status: "PENDING",
        expiresAt: { gt: now },
      },
    }),
    prisma.bookCopy.count({ where: { status: "AVAILABLE" } }),

    // Pending Reservations Queue
    prisma.reservation.findMany({
      where: {
        status: "PENDING",
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: "asc" },
      take: 15,
      select: {
        id: true,
        bookId: true,
        bookCopyId: true,
        studentId: true,
        expiresAt: true,
        createdAt: true,
        book: {
          select: {
            title: true,
            author: true,
            coverImageUrl: true,
          },
        },
        bookCopy: {
          select: {
            barcode: true,
          },
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),

    // Active & Overdue Loans List
    prisma.loan.findMany({
      where: { status: { in: ["ACTIVE", "OVERDUE"] } },
      orderBy: { dueDate: "asc" },
      take: 25,
      select: {
        id: true,
        bookCopyId: true,
        studentId: true,
        borrowedAt: true,
        dueDate: true,
        status: true,
        bookCopy: {
          select: {
            id: true,
            barcode: true,
            condition: true,
            version: true,
            book: {
              select: {
                id: true,
                title: true,
                author: true,
                coverImageUrl: true,
              },
            },
          },
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
  ]);

  const summary: CirculationDeskSummary = {
    activeLoansCount,
    overdueLoansCount,
    pendingReservationsCount,
    availableCopiesCount,
  };

  const formattedReservations: PendingReservationItem[] = pendingReservations.map(
    (r) => ({
      id: r.id,
      bookId: r.bookId,
      bookTitle: r.book.title,
      bookAuthor: r.book.author,
      coverImageUrl: r.book.coverImageUrl,
      studentId: r.studentId,
      studentName: `${r.student.firstName} ${r.student.lastName}`,
      studentEmail: r.student.email,
      copyId: r.bookCopyId,
      copyBarcode: r.bookCopy?.barcode || null,
      expiresAt: r.expiresAt,
      createdAt: r.createdAt,
    })
  );

  const formattedLoans: ActiveLoanItem[] = activeLoans.map((l) => ({
    id: l.id,
    loanId: l.id,
    copyId: l.bookCopyId,
    copyBarcode: l.bookCopy.barcode,
    bookId: l.bookCopy.book.id,
    bookTitle: l.bookCopy.book.title,
    bookAuthor: l.bookCopy.book.author,
    coverImageUrl: l.bookCopy.book.coverImageUrl,
    studentId: l.studentId,
    studentName: `${l.student.firstName} ${l.student.lastName}`,
    studentEmail: l.student.email,
    borrowedAt: l.borrowedAt,
    dueDate: l.dueDate,
    isOverdue: l.status === "OVERDUE" || isAfter(now, l.dueDate),
    condition: l.bookCopy.condition,
  }));

  return {
    summary,
    pendingReservations: formattedReservations,
    activeLoans: formattedLoans,
  };
}
