import "dotenv/config";
import { prisma, disconnectPrisma } from "../lib/prisma";

export interface AuditReport {
  timestamp: string;
  duplicateActiveLoansPerCopy: Array<{ bookCopyId: string; count: number }>;
  duplicatePendingHoldsPerCopy: Array<{ bookCopyId: string; count: number }>;
  duplicatePendingHoldsPerStudentBook: Array<{ studentId: string; bookId: string; count: number }>;
  availableCopiesWithHolder: Array<{ id: string; barcode: string; currentHolderId: string | null }>;
  borrowedCopiesWithoutHolder: Array<{ id: string; barcode: string }>;
  borrowedCopiesWithoutActiveLoan: Array<{ id: string; barcode: string }>;
  copiesWithZeroHistory: Array<{ id: string; barcode: string }>;
  duplicateDirectReviews: Array<{ studentId: string; bookId: string; count: number }>;
  totalIssuesCount: number;
}

/**
 * Read-only auditor for database invariants.
 * Inspects circulation, holds, copies, reviews, and audit trail consistency without mutating data.
 */
export async function auditExistingState(): Promise<AuditReport> {
  // 1. Duplicate active/overdue loans per copy
  const rawDuplicateLoans = await prisma.loan.groupBy({
    by: ["bookCopyId"],
    where: {
      status: { in: ["ACTIVE", "OVERDUE"] },
    },
    _count: { id: true },
    having: {
      id: { _count: { gt: 1 } },
    },
  });

  const duplicateActiveLoansPerCopy = rawDuplicateLoans.map((l) => ({
    bookCopyId: l.bookCopyId,
    count: l._count.id,
  }));

  // 2. Duplicate pending reservations per copy
  const rawDuplicateCopyHolds = await prisma.reservation.groupBy({
    by: ["bookCopyId"],
    where: {
      status: "PENDING",
      bookCopyId: { not: null },
    },
    _count: { id: true },
    having: {
      id: { _count: { gt: 1 } },
    },
  });

  const duplicatePendingHoldsPerCopy = rawDuplicateCopyHolds
    .filter((h) => h.bookCopyId !== null)
    .map((h) => ({
      bookCopyId: h.bookCopyId as string,
      count: h._count.id,
    }));

  // 3. Duplicate pending reservations per student per book title
  const rawDuplicateStudentHolds = await prisma.reservation.groupBy({
    by: ["studentId", "bookId"],
    where: {
      status: "PENDING",
    },
    _count: { id: true },
    having: {
      id: { _count: { gt: 1 } },
    },
  });

  const duplicatePendingHoldsPerStudentBook = rawDuplicateStudentHolds.map((h) => ({
    studentId: h.studentId,
    bookId: h.bookId,
    count: h._count.id,
  }));

  // 4. Invalid holder-state pairs
  const availableCopiesWithHolder = await prisma.bookCopy.findMany({
    where: {
      status: "AVAILABLE",
      currentHolderId: { not: null },
    },
    select: { id: true, barcode: true, currentHolderId: true },
  });

  const borrowedCopiesWithoutHolder = await prisma.bookCopy.findMany({
    where: {
      status: "BORROWED",
      currentHolderId: null,
    },
    select: { id: true, barcode: true },
  });

  const borrowedCopies = await prisma.bookCopy.findMany({
    where: { status: "BORROWED" },
    select: { id: true, barcode: true },
  });

  const borrowedCopiesWithoutActiveLoan: Array<{ id: string; barcode: string }> = [];
  for (const copy of borrowedCopies) {
    const activeLoan = await prisma.loan.findFirst({
      where: {
        bookCopyId: copy.id,
        status: { in: ["ACTIVE", "OVERDUE"] },
      },
      select: { id: true },
    });
    if (!activeLoan) {
      borrowedCopiesWithoutActiveLoan.push(copy);
    }
  }

  // 5. Copies with zero audit history
  const allCopies = await prisma.bookCopy.findMany({
    select: { id: true, barcode: true },
  });
  const copiesWithZeroHistory: Array<{ id: string; barcode: string }> = [];
  for (const copy of allCopies) {
    const historyCount = await prisma.bookHistory.count({
      where: { bookCopyId: copy.id },
    });
    if (historyCount === 0) {
      copiesWithZeroHistory.push(copy);
    }
  }

  // 6. Duplicate direct reviews by same student for same book
  const rawDuplicateDirectReviews = await prisma.feedback.groupBy({
    by: ["studentId", "bookId"],
    where: {
      loanId: null,
    },
    _count: { id: true },
    having: {
      id: { _count: { gt: 1 } },
    },
  });

  const duplicateDirectReviews = rawDuplicateDirectReviews.map((r) => ({
    studentId: r.studentId,
    bookId: r.bookId,
    count: r._count.id,
  }));

  const totalIssuesCount =
    duplicateActiveLoansPerCopy.length +
    duplicatePendingHoldsPerCopy.length +
    duplicatePendingHoldsPerStudentBook.length +
    availableCopiesWithHolder.length +
    borrowedCopiesWithoutHolder.length +
    borrowedCopiesWithoutActiveLoan.length +
    copiesWithZeroHistory.length +
    duplicateDirectReviews.length;

  return {
    timestamp: new Date().toISOString(),
    duplicateActiveLoansPerCopy,
    duplicatePendingHoldsPerCopy,
    duplicatePendingHoldsPerStudentBook,
    availableCopiesWithHolder,
    borrowedCopiesWithoutHolder,
    borrowedCopiesWithoutActiveLoan,
    copiesWithZeroHistory,
    duplicateDirectReviews,
    totalIssuesCount,
  };
}

// CLI execution entry point
async function run() {
  try {
    console.log("=== ShelfSync Database State Read-Only Audit ===");
    const report = await auditExistingState();
    console.log(`Audit Timestamp: ${report.timestamp}`);
    console.log(`Total Invariant Issues Identified: ${report.totalIssuesCount}\n`);

    console.log(`1. Duplicate Active/Overdue Loans per Copy: ${report.duplicateActiveLoansPerCopy.length}`);
    if (report.duplicateActiveLoansPerCopy.length > 0) {
      console.table(report.duplicateActiveLoansPerCopy);
    }

    console.log(`2. Duplicate Pending Holds per Copy: ${report.duplicatePendingHoldsPerCopy.length}`);
    if (report.duplicatePendingHoldsPerCopy.length > 0) {
      console.table(report.duplicatePendingHoldsPerCopy);
    }

    console.log(`3. Duplicate Pending Holds per Student/Book: ${report.duplicatePendingHoldsPerStudentBook.length}`);
    if (report.duplicatePendingHoldsPerStudentBook.length > 0) {
      console.table(report.duplicatePendingHoldsPerStudentBook);
    }

    console.log(`4. AVAILABLE Copies with currentHolderId set: ${report.availableCopiesWithHolder.length}`);
    if (report.availableCopiesWithHolder.length > 0) {
      console.table(report.availableCopiesWithHolder);
    }

    console.log(`5. BORROWED Copies without currentHolderId: ${report.borrowedCopiesWithoutHolder.length}`);
    if (report.borrowedCopiesWithoutHolder.length > 0) {
      console.table(report.borrowedCopiesWithoutHolder);
    }

    console.log(`6. BORROWED Copies without Active Loan: ${report.borrowedCopiesWithoutActiveLoan.length}`);
    if (report.borrowedCopiesWithoutActiveLoan.length > 0) {
      console.table(report.borrowedCopiesWithoutActiveLoan);
    }

    console.log(`7. Copies with Zero Audit History: ${report.copiesWithZeroHistory.length}`);
    if (report.copiesWithZeroHistory.length > 0) {
      console.table(report.copiesWithZeroHistory);
    }

    console.log(`8. Duplicate Direct Reviews (Same Student + Book): ${report.duplicateDirectReviews.length}`);
    if (report.duplicateDirectReviews.length > 0) {
      console.table(report.duplicateDirectReviews);
    }

    console.log("\nAudit execution completed without any modifications to database state.");
  } catch (err) {
    console.error("Audit execution failed:", err);
    process.exitCode = 1;
  } finally {
    await disconnectPrisma();
  }
}

if (process.argv[1]?.endsWith("audit-existing-state.ts")) {
  run();
}
