import { prisma } from "../utils/prisma";
import { CopyStatus, HistoryAction, ReservationStatus } from "@prisma/client";
import { CreateReservationInput, CancelReservationInput } from "../schemas/reservation.schema";

export class ReservationRepository {
  async findStudentById(studentId: string) {
    return prisma.user.findUnique({
      where: { id: studentId },
    });
  }

  async findActiveHoldForStudentAndBook(studentId: string, bookId: string) {
    return prisma.reservation.findFirst({
      where: {
        bookId,
        studentId,
        status: ReservationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async findAvailableCopy(bookId: string, copyId?: string) {
    if (copyId) {
      return prisma.bookCopy.findFirst({
        where: {
          id: copyId,
          bookId,
          status: CopyStatus.AVAILABLE,
        },
        select: { id: true, barcode: true, version: true },
      });
    }

    return prisma.bookCopy.findFirst({
      where: {
        bookId,
        status: CopyStatus.AVAILABLE,
      },
      orderBy: { barcode: "asc" },
      select: { id: true, barcode: true, version: true },
    });
  }

  async executeCreateReservation(
    targetCopy: { id: string; barcode: string; version: number },
    student: any,
    input: CreateReservationInput,
    expiresAt: Date
  ) {
    const now = new Date();
    return prisma.$transaction(async (tx) => {
      // In-transaction verification of existing active hold
      const inTxExisting = await tx.reservation.findFirst({
        where: {
          bookId: input.bookId,
          studentId: student.id,
          status: ReservationStatus.PENDING,
          expiresAt: { gt: now },
        },
      });

      if (inTxExisting) {
        throw new Error("RESERVATION_EXISTS");
      }

      // Conditional copy claim with optimistic lock
      const claimed = await tx.bookCopy.updateMany({
        where: {
          id: targetCopy.id,
          status: CopyStatus.AVAILABLE,
          version: input.expectedVersion !== undefined ? input.expectedVersion : targetCopy.version,
        },
        data: {
          status: CopyStatus.RESERVED,
          currentHolderId: student.id,
          version: { increment: 1 },
        },
      });

      if (claimed.count === 0) {
        throw new Error("COPY_CONCURRENTLY_RESERVED");
      }

      // Create Reservation
      const reservation = await tx.reservation.create({
        data: {
          bookId: input.bookId,
          bookCopyId: targetCopy.id,
          studentId: student.id,
          status: ReservationStatus.PENDING,
          expiresAt,
        },
      });

      // Immutable Audit Log
      await tx.bookHistory.create({
        data: {
          bookCopyId: targetCopy.id,
          action: HistoryAction.RESERVED,
          actorId: student.id,
          actorRole: student.role,
          previousState: CopyStatus.AVAILABLE,
          newState: CopyStatus.RESERVED,
          notes: `Online reservation placed by student ${student.firstName} ${student.lastName} (${student.email}). Hold expires ${expiresAt.toISOString()}.`,
        },
      });

      return reservation;
    });
  }

  async findReservationWithCopy(reservationId: string) {
    return prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        bookCopy: true,
        student: true,
      },
    });
  }

  async executeCancelReservation(
    reservation: any,
    actor: any,
    input: CancelReservationInput
  ) {
    return prisma.$transaction(async (tx) => {
      const updatedRes = await tx.reservation.updateMany({
        where: {
          id: reservation.id,
          status: ReservationStatus.PENDING,
        },
        data: { status: ReservationStatus.CANCELLED },
      });

      if (updatedRes.count === 0) {
        throw new Error("CONCURRENCY_CONFLICT");
      }

      if (reservation.bookCopyId) {
        const releasedCopy = await tx.bookCopy.updateMany({
          where: {
            id: reservation.bookCopyId,
            status: CopyStatus.RESERVED,
            currentHolderId: reservation.studentId,
            ...(input.expectedVersion !== undefined ? { version: input.expectedVersion } : {}),
          },
          data: {
            status: CopyStatus.AVAILABLE,
            currentHolderId: null,
            version: { increment: 1 },
          },
        });

        if (releasedCopy.count > 0) {
          await tx.bookHistory.create({
            data: {
              bookCopyId: reservation.bookCopyId,
              action: HistoryAction.RESERVATION_CANCELLED,
              actorId: actor.id,
              actorRole: actor.role,
              previousState: CopyStatus.RESERVED,
              newState: CopyStatus.AVAILABLE,
              notes: `Reservation cancelled by ${actor.firstName} ${actor.lastName} (${actor.role}). Physical copy restored to AVAILABLE inventory.`,
            },
          });
        }
      }

      return { success: true, reservationId: reservation.id };
    });
  }

  async findStudentReservations(studentId: string) {
    const reservations = await prisma.reservation.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
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
        bookCopy: {
          select: {
            barcode: true,
          },
        },
      },
    });

    const now = new Date();
    return reservations.map((r) => {
      const effectiveStatus =
        r.status === "PENDING" && r.expiresAt <= now ? "EXPIRED" : r.status;

      return {
        id: r.id,
        bookId: r.book.id,
        bookTitle: r.book.title,
        bookAuthor: r.book.author,
        category: r.book.category,
        coverImageUrl: r.book.coverImageUrl,
        copyBarcode: r.bookCopy?.barcode ?? null,
        status: effectiveStatus,
        expiresAt: r.expiresAt,
        createdAt: r.createdAt,
      };
    });
  }

  async findPendingHolds() {
    return prisma.reservation.findMany({
      where: {
        status: ReservationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      include: {
        book: { select: { id: true, title: true, author: true } },
        bookCopy: { select: { id: true, barcode: true, condition: true } },
        student: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }
}
