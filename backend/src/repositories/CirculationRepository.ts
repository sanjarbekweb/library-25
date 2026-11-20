import prisma from "../utils/prisma";
import { CheckoutInput, CheckinInput } from "../schemas/circulation.schema";
import { User, Prisma, CopyStatus, CopyCondition, HistoryAction } from "@prisma/client";

export class CirculationRepository {
  async findStudentById(studentId: string) {
    return prisma.user.findUnique({
      where: { id: studentId },
    });
  }

  async findAssistantById(assistantId: string) {
    return prisma.user.findUnique({
      where: { id: assistantId },
    });
  }

  async findCopyByBarcodeOrId(copyIdOrBarcode: string) {
    return prisma.bookCopy.findFirst({
      where: {
        OR: [{ id: copyIdOrBarcode }, { barcode: copyIdOrBarcode }],
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
        loans: {
          where: { status: { in: ["ACTIVE", "OVERDUE"] } },
          include: { student: true },
          orderBy: { borrowedAt: "desc" },
        },
      },
    });
  }

  async executeCheckout(
    copy: CopyForCirculation,
    student: User,
    assistant: User,
    input: CheckoutInput,
    dueDate: Date
  ) {
    return prisma.$transaction(async (tx) => {
      const claimedCopy = await tx.bookCopy.updateMany({
        where: {
          id: copy.id,
          status: { in: [CopyStatus.AVAILABLE, CopyStatus.RESERVED] },
          version: input.expectedVersion !== undefined ? input.expectedVersion : copy.version,
          ...(copy.status === CopyStatus.RESERVED ? { currentHolderId: student.id } : {}),
        },
        data: {
          status: CopyStatus.BORROWED,
          currentHolderId: student.id,
          version: { increment: 1 },
        },
      });

      if (claimedCopy.count === 0) {
        throw new Error("COPY_CONCURRENTLY_ACQUIRED");
      }

      const loan = await tx.loan.create({
        data: {
          bookCopyId: copy.id,
          studentId: student.id,
          assistantId: assistant.id,
          borrowedAt: new Date(),
          dueDate,
          status: "ACTIVE",
        },
      });

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

      await tx.bookHistory.create({
        data: {
          bookCopyId: copy.id,
          action: HistoryAction.CHECKOUT,
          actorId: assistant.id,
          actorRole: assistant.role,
          previousState: copy.status,
          newState: CopyStatus.BORROWED,
          notes: `Checked out to ${student.firstName} ${student.lastName}. Due date: ${dueDate.toISOString().split("T")[0]}`,
        },
      });

      return { loan, copyBarcode: copy.barcode, bookTitle: copy.book.title, studentName: `${student.firstName} ${student.lastName}`, dueDate };
    });
  }

  async executeCheckin(
    copy: CopyForCirculation,
    activeLoan: CopyForCirculation["loans"][number],
    assistant: User,
    input: CheckinInput,
    targetStatus: CopyStatus,
    targetCondition: CopyCondition
  ) {
    const now = new Date();
    return prisma.$transaction(async (tx) => {
      const updatedCopy = await tx.bookCopy.updateMany({
        where: {
          id: copy.id,
          status: CopyStatus.BORROWED,
          version: input.expectedVersion !== undefined ? input.expectedVersion : copy.version,
        },
        data: {
          status: targetStatus,
          condition: targetCondition,
          currentHolderId: null,
          version: { increment: 1 },
        },
      });

      if (updatedCopy.count === 0) {
        throw new Error("COPY_CONCURRENTLY_MODIFIED");
      }

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
        throw new Error("LOAN_ALREADY_CLOSED");
      }

      await tx.bookHistory.create({
        data: {
          bookCopyId: copy.id,
          action: HistoryAction.CHECKIN,
          actorId: assistant.id,
          actorRole: assistant.role,
          previousState: copy.status,
          newState: targetStatus,
          notes: input.notes || `Checked in from ${activeLoan.student.firstName} ${activeLoan.student.lastName}. Condition: ${targetCondition}. Status set to ${targetStatus}`,
        },
      });

      return {
        loanId: activeLoan.id,
        copyBarcode: copy.barcode,
        bookTitle: copy.book.title,
        studentName: `${activeLoan.student.firstName} ${activeLoan.student.lastName}`,
        returnedAt: now,
        newStatus: targetStatus,
        newCondition: targetCondition,
      };
    });
  }

  async searchStudents(query: string) {
    const trimmed = query.trim();
    if (!trimmed) {
      return prisma.user.findMany({
        where: { role: "STUDENT", isActive: true },
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, clerkId: true, email: true, firstName: true, lastName: true, role: true, isActive: true,
          _count: { select: { loans: { where: { status: { in: ["ACTIVE", "OVERDUE"] } } }, reservations: { where: { status: "PENDING" } } } },
        },
      });
    }

    return prisma.user.findMany({
      where: {
        role: "STUDENT",
        isActive: true,
        OR: [
          { firstName: { contains: trimmed, mode: "insensitive" } },
          { lastName: { contains: trimmed, mode: "insensitive" } },
          { email: { contains: trimmed, mode: "insensitive" } },
        ],
      },
      take: 10,
      select: {
        id: true, clerkId: true, email: true, firstName: true, lastName: true, role: true, isActive: true,
        _count: { select: { loans: { where: { status: { in: ["ACTIVE", "OVERDUE"] } } }, reservations: { where: { status: "PENDING" } } } },
      },
    });
  }

  async searchCopies(query: string) {
    const trimmed = query.trim();
    if (!trimmed) {
      return prisma.bookCopy.findMany({
        take: 12,
        orderBy: { updatedAt: "desc" },
        include: {
          book: true,
          currentHolder: true,
          loans: { where: { status: { in: ["ACTIVE", "OVERDUE"] } }, take: 1 },
        },
      });
    }

    const cleanQuery = trimmed.replace(/[- ]/g, "");
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
                { isbn: { contains: trimmed, mode: "insensitive" } },
              ],
            },
          },
        ],
      },
      take: 24,
      include: {
        book: true,
        currentHolder: true,
        loans: { where: { status: { in: ["ACTIVE", "OVERDUE"] } }, take: 1 },
      },
    });

    if (copies.length === 0) {
      const tokens = trimmed.toLowerCase().split(/\s+/).filter((t) => t.length >= 2);
      if (tokens.length > 0) {
        const tokenConditions: Prisma.BookCopyWhereInput[] = [];
        for (const token of tokens) {
          tokenConditions.push(
            { barcode: { contains: token, mode: "insensitive" } },
            { book: { OR: [{ title: { contains: token, mode: "insensitive" } }, { author: { contains: token, mode: "insensitive" } }] } }
          );
        }
        copies = await prisma.bookCopy.findMany({
          where: { OR: tokenConditions },
          take: 24,
          include: {
            book: true,
            currentHolder: true,
            loans: { where: { status: { in: ["ACTIVE", "OVERDUE"] } }, take: 1 },
          },
        });
      }
    }
    return copies;
  }
}

export type CopyForCirculation = NonNullable<Awaited<ReturnType<CirculationRepository["findCopyByBarcodeOrId"]>>>;
