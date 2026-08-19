import { prisma } from "@/lib/prisma";
import { syncBookToSearchIndex } from "@/lib/search/sync";
import { ServiceError } from "@/lib/errors";
import {
  CheckoutSchema,
  CheckinSchema,
  CheckoutInput,
  CheckinInput,
} from "@/lib/schemas/circulation-schema";
import { CopyCondition, CopyStatus, HistoryAction } from "@prisma/client";
import { addDays, isAfter } from "date-fns";

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

/**
 * Execute in-person checkout of a book copy to a student.
 * System Invariants:
 * - Atomic $transaction creating Loan, updating BookCopy, updating Reservation (if applicable), appending BookHistory audit log
 * - Post-commit Meilisearch search index sync (syncBookToSearchIndex)
 */
export async function checkoutBookCopy(
  input: CheckoutInput,
  assistantClerkId: string
) {
  const parsed = CheckoutSchema.parse(input);

  // 1. Resolve assistant performing checkout
  const assistant = await prisma.user.findUnique({
    where: { clerkId: assistantClerkId },
  });

  if (!assistant) {
    throw new ServiceError("USER_NOT_FOUND", "Assistant user account not found", 404);
  }

  if (assistant.role !== "ASSISTANT" && assistant.role !== "ADMIN") {
    throw new ServiceError(
      "UNAUTHORIZED_ROLE",
      "Only assistants or administrators can execute checkouts",
      403
    );
  }

  // 2. Resolve target student
  const student = await prisma.user.findUnique({
    where: { id: parsed.studentId },
    include: {
      loans: {
        where: { status: "ACTIVE" },
      },
    },
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

  // 3. Resolve BookCopy by ID or Barcode
  const copyIdTrimmed = parsed.copyId.trim();
  const cleanCopyId = copyIdTrimmed.replace(/[- ]/g, "");

  const copy = await prisma.bookCopy.findFirst({
    where: {
      OR: [
        { id: copyIdTrimmed },
        { barcode: { equals: copyIdTrimmed, mode: "insensitive" } },
        { barcode: { equals: cleanCopyId, mode: "insensitive" } },
        { barcode: { contains: copyIdTrimmed, mode: "insensitive" } },
        { book: { isbn: { equals: copyIdTrimmed, mode: "insensitive" } } },
        { book: { isbn: { equals: cleanCopyId, mode: "insensitive" } } },
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
      "Specified physical book copy barcode/ID not found",
      404
    );
  }

  // 4. Validate Copy Availability & Reservation Lock
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

  // Check if student has a pending reservation for this book
  const studentPendingReservation = await prisma.reservation.findFirst({
    where: {
      bookId: copy.bookId,
      studentId: student.id,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
  });

  const now = new Date();
  const dueDate = addDays(now, parsed.dueDays);

  // 5. Atomic Prisma Transaction
  const transactionResult = await prisma.$transaction(async (tx) => {
    // Create Active Loan
    const loan = await tx.loan.create({
      data: {
        bookCopyId: copy.id,
        studentId: student.id,
        assistantId: assistant.id,
        borrowedAt: now,
        dueDate,
        status: "ACTIVE",
      },
    });

    // Update BookCopy status and holder
    await tx.bookCopy.update({
      where: { id: copy.id },
      data: {
        status: "BORROWED",
        currentHolderId: student.id,
      },
    });

    // Fulfill reservation if exists
    const reservationToFulfill =
      activeCopyReservation || studentPendingReservation;
    if (reservationToFulfill) {
      await tx.reservation.update({
        where: { id: reservationToFulfill.id },
        data: {
          status: "FULFILLED",
          bookCopyId: copy.id,
        },
      });
    }

    // Append immutable BookHistory log
    await tx.bookHistory.create({
      data: {
        bookCopyId: copy.id,
        action: HistoryAction.CHECKOUT,
        actorId: assistant.id,
        previousState: copy.status,
        newState: CopyStatus.BORROWED,
        notes: `Checked out to ${student.firstName} ${student.lastName} (${student.email}). Due date: ${dueDate.toISOString().split("T")[0]}`,
      },
    });

    return loan;
  });

  // 6. Search Cache Synchronization (Post-commit)
  await syncBookToSearchIndex(copy.bookId);

  return {
    loanId: transactionResult.id,
    copyBarcode: copy.barcode,
    bookTitle: copy.book.title,
    studentName: `${student.firstName} ${student.lastName}`,
    dueDate,
  };
}

/**
 * Execute in-person check-in of a returned book copy.
 * System Invariants:
 * - Atomic $transaction closing Loan, clearing holder, updating BookCopy condition/status, appending BookHistory audit log
 * - Post-commit Meilisearch search index sync (syncBookToSearchIndex)
 */
export async function checkinBookCopy(
  input: CheckinInput,
  assistantClerkId: string
) {
  const parsed = CheckinSchema.parse(input);

  // 1. Resolve assistant performing check-in
  const assistant = await prisma.user.findUnique({
    where: { clerkId: assistantClerkId },
  });

  if (!assistant) {
    throw new ServiceError("USER_NOT_FOUND", "Assistant user account not found", 404);
  }

  if (assistant.role !== "ASSISTANT" && assistant.role !== "ADMIN") {
    throw new ServiceError(
      "UNAUTHORIZED_ROLE",
      "Only assistants or administrators can execute check-ins",
      403
    );
  }

  const copyIdTrimmed = parsed.copyId.trim();
  const cleanCopyId = copyIdTrimmed.replace(/[- ]/g, "");

  const copy = await prisma.bookCopy.findFirst({
    where: {
      OR: [
        { id: copyIdTrimmed },
        { barcode: { equals: copyIdTrimmed, mode: "insensitive" } },
        { barcode: { equals: cleanCopyId, mode: "insensitive" } },
        { barcode: { contains: copyIdTrimmed, mode: "insensitive" } },
        { book: { isbn: { equals: copyIdTrimmed, mode: "insensitive" } } },
        { book: { isbn: { equals: cleanCopyId, mode: "insensitive" } } },
      ],
    },
    include: {
      book: true,
      loans: {
        where: { status: "ACTIVE" },
        include: { student: true },
      },
    },
  });

  if (!copy) {
    throw new ServiceError(
      "COPY_NOT_FOUND",
      "Specified physical book copy barcode/ID not found",
      404
    );
  }

  const activeLoan = copy.loans[0];
  if (!activeLoan) {
    throw new ServiceError(
      "NO_ACTIVE_LOAN",
      `Physical copy ${copy.barcode} does not have an active borrowing record to check in`,
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

  // 3. Atomic Prisma Transaction
  await prisma.$transaction(async (tx) => {
    // Close Active Loan
    await tx.loan.update({
      where: { id: activeLoan.id },
      data: {
        status: "RETURNED",
        returnedAt: now,
      },
    });

    // Update BookCopy status, condition, and clear holder
    await tx.bookCopy.update({
      where: { id: copy.id },
      data: {
        status: targetStatus,
        condition: targetCondition,
        currentHolderId: null,
      },
    });

    // Append immutable BookHistory log
    await tx.bookHistory.create({
      data: {
        bookCopyId: copy.id,
        action: HistoryAction.CHECKIN,
        actorId: assistant.id,
        previousState: copy.status,
        newState: targetStatus,
        notes:
          parsed.notes ||
          `Checked in from ${activeLoan.student.firstName} ${activeLoan.student.lastName}. Condition: ${targetCondition}. Status set to ${targetStatus}`,
      },
    });
  });

  // 4. Search Cache Synchronization (Post-commit)
  await syncBookToSearchIndex(copy.bookId);

  return {
    loanId: activeLoan.id,
    copyBarcode: copy.barcode,
    bookTitle: copy.book.title,
    studentName: `${activeLoan.student.firstName} ${activeLoan.student.lastName}`,
    returnedAt: now,
    newStatus: targetStatus,
    newCondition: targetCondition,
  };
}

/**
 * Autocomplete / lookup student accounts for checkout assignment.
 */
export async function lookupStudents(query: string): Promise<StudentSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    // Return recent active students if no query provided
    const students = await prisma.user.findMany({
      where: { role: "STUDENT", isActive: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        loans: { where: { status: "ACTIVE" } },
        reservations: { where: { status: "PENDING" } },
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
      activeLoansCount: s.loans.length,
      activeReservationsCount: s.reservations.length,
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
    include: {
      loans: { where: { status: "ACTIVE" } },
      reservations: { where: { status: "PENDING" } },
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
    activeLoansCount: s.loans.length,
    activeReservationsCount: s.reservations.length,
  }));
}

/**
 * Search physical copies for barcode scan / quick selection.
 */
export async function lookupBookCopies(query: string): Promise<CopySearchResult[]> {
  const trimmed = query.trim();
  const mapCopy = (c: any) => ({
    id: c.id,
    barcode: c.barcode,
    condition: c.condition,
    status: c.status,
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

  if (!trimmed) {
    const copies = await prisma.bookCopy.findMany({
      take: 12,
      orderBy: { updatedAt: "desc" },
      include: {
        book: true,
        currentHolder: true,
        loans: { where: { status: "ACTIVE" }, take: 1 },
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
    include: {
      book: true,
      currentHolder: true,
      loans: { where: { status: "ACTIVE" }, take: 1 },
    },
  });

  // Step 2: Tokenized & Fuzzy Stemmed Fallback (e.g. "invester" -> "invest", or multi-word titles)
  if (copies.length === 0) {
    const tokens = trimmed
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length >= 2);

    if (tokens.length > 0) {
      const tokenConditions: any[] = [];

      for (const token of tokens) {
        const stems = new Set<string>();
        stems.add(token);

        if (token.length >= 4) {
          stems.add(token.substring(0, token.length - 2)); // e.g. "invester" -> "invest"
          stems.add(token.substring(0, token.length - 1)); // e.g. "invester" -> "investe"
        }
        if (
          token.endsWith("er") ||
          token.endsWith("or") ||
          token.endsWith("ed") ||
          token.endsWith("ing") ||
          token.endsWith("s")
        ) {
          stems.add(token.replace(/(er|or|ed|ing|s)$/, ""));
        }

        for (const stem of Array.from(stems)) {
          if (stem.length >= 3) {
            tokenConditions.push(
              { barcode: { contains: stem, mode: "insensitive" } },
              {
                book: {
                  OR: [
                    { title: { contains: stem, mode: "insensitive" } },
                    { author: { contains: stem, mode: "insensitive" } },
                    { category: { contains: stem, mode: "insensitive" } },
                    { isbn: { contains: stem, mode: "insensitive" } },
                  ],
                },
              }
            );
          }
        }
      }

      if (tokenConditions.length > 0) {
        copies = await prisma.bookCopy.findMany({
          where: {
            OR: tokenConditions,
          },
          take: 24,
          include: {
            book: true,
            currentHolder: true,
            loans: { where: { status: "ACTIVE" }, take: 1 },
          },
        });
      }
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
    prisma.loan.count({ where: { status: "ACTIVE" } }),
    prisma.loan.count({
      where: {
        status: "ACTIVE",
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
      include: {
        book: true,
        bookCopy: true,
        student: true,
      },
    }),

    // Active Loans List
    prisma.loan.findMany({
      where: { status: "ACTIVE" },
      orderBy: { dueDate: "asc" },
      take: 25,
      include: {
        bookCopy: {
          include: {
            book: true,
          },
        },
        student: true,
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
    isOverdue: isAfter(now, l.dueDate),
    condition: l.bookCopy.condition,
  }));

  return {
    summary,
    pendingReservations: formattedReservations,
    activeLoans: formattedLoans,
  };
}
