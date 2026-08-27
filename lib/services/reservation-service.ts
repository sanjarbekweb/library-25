import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { syncBookToSearchIndex } from "@/lib/search/sync";
import { invalidateBookCache, invalidateUserReservationsCache } from "@/lib/cache/invalidation";
import { CACHE_TAGS, CACHE_TTL } from "@/lib/cache/tags";
import { ServiceError } from "@/lib/errors";
import {
  CreateReservationSchema,
  CancelReservationSchema,
} from "@/lib/schemas/reservation-schema";

export interface StudentReservationItem {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  coverImageUrl: string | null;
  category: string;
  copyBarcode: string | null;
  status: "PENDING" | "FULFILLED" | "CANCELLED" | "EXPIRED";
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Request an online reservation for an available physical copy of a book.
 * Upholds:
 * - Immutable Audit Guarantee (#2): Writes BookHistory inside atomic prisma.$transaction
 * - Search Cache Synchronization (#6): Triggers syncBookToSearchIndex post-commit
 */
export async function requestBookReservation(
  bookId: string,
  userClerkId: string,
  holdDays?: number,
  holdUntilDate?: string
) {
  // Validate input schema
  const parsed = CreateReservationSchema.parse({ bookId, holdDays, holdUntilDate });

  // 1. Resolve user in system of record
  const user = await prisma.user.findUnique({
    where: { clerkId: userClerkId },
  });

  if (!user) {
    throw new ServiceError("USER_NOT_FOUND", "User account does not exist in database");
  }

  // 2. Check if student already has a pending reservation for this book
  const existingReservation = await prisma.reservation.findFirst({
    where: {
      bookId,
      studentId: user.id,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
  });

  if (existingReservation) {
    throw new ServiceError(
      "RESERVATION_EXISTS",
      "You already have an active pending reservation for this book"
    );
  }

  // 3. Find an available physical copy of the book
  const availableCopy = await prisma.bookCopy.findFirst({
    where: {
      bookId,
      status: "AVAILABLE",
    },
  });

  if (!availableCopy) {
    throw new ServiceError(
      "NO_COPIES_AVAILABLE",
      "No physical copies of this book are currently available for reservation"
    );
  }

  // Calculate expiration window based on custom hold duration or calendar date (Max 7 days limit)
  const now = new Date();
  let expiresAt = new Date();

  if (parsed.holdUntilDate) {
    const customDate = new Date(parsed.holdUntilDate);
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + 7);

    if (customDate > maxDate) {
      expiresAt = maxDate;
    } else if (customDate <= now) {
      expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else {
      expiresAt = customDate;
    }
  } else if (parsed.holdDays) {
    const days = Math.min(Math.max(parsed.holdDays, 1), 7);
    expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  } else {
    // Default 48 hours (2 days)
    expiresAt.setHours(expiresAt.getHours() + 48);
  }

  // 4. Atomic transaction: Update copy status, create reservation, append audit log
  const result = await prisma.$transaction(async (tx) => {
    // Transition BookCopy status to RESERVED
    const updatedCopy = await tx.bookCopy.update({
      where: { id: availableCopy.id },
      data: {
        status: "RESERVED",
        currentHolderId: user.id,
      },
    });

    // Create Reservation
    const reservation = await tx.reservation.create({
      data: {
        bookId,
        bookCopyId: availableCopy.id,
        studentId: user.id,
        status: "PENDING",
        expiresAt,
      },
    });

    // Append immutable BookHistory record
    await tx.bookHistory.create({
      data: {
        bookCopyId: availableCopy.id,
        action: "RESERVED",
        actorId: user.id,
        previousState: "AVAILABLE",
        newState: "RESERVED",
        notes: `Online reservation requested by student ${user.firstName} ${user.lastName} (${user.email}). Expires ${expiresAt.toISOString()}.`,
      },
    });

    return { reservation, updatedCopy };
  });

  // 5. Post-commit search cache & server cache synchronization
  await syncBookToSearchIndex(bookId);
  invalidateBookCache(bookId);
  invalidateUserReservationsCache(user.id);

  return result.reservation;
}

/**
 * Cancel an active pending student reservation.
 * Upholds:
 * - Immutable Audit Guarantee (#2)
 * - Search Cache Synchronization (#6)
 */
export async function cancelReservation(
  reservationId: string,
  userClerkId: string
) {
  CancelReservationSchema.parse({ reservationId });

  const user = await prisma.user.findUnique({
    where: { clerkId: userClerkId },
  });

  if (!user) {
    throw new ServiceError("USER_NOT_FOUND", "User account not found");
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { bookCopy: true },
  });

  if (!reservation) {
    throw new ServiceError("RESERVATION_NOT_FOUND", "Reservation record not found");
  }

  // Verify ownership (or admin/assistant override)
  if (reservation.studentId !== user.id && user.role === "STUDENT") {
    throw new ServiceError(
      "UNAUTHORIZED",
      "You are not authorized to cancel this reservation"
    );
  }

  if (reservation.status !== "PENDING") {
    throw new ServiceError(
      "INVALID_STATE",
      `Cannot cancel reservation with status ${reservation.status}`
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    // Transition Reservation to CANCELLED
    const updatedReservation = await tx.reservation.update({
      where: { id: reservationId },
      data: { status: "CANCELLED" },
    });

    // If a physical copy was reserved, release it back to AVAILABLE
    if (reservation.bookCopyId) {
      await tx.bookCopy.update({
        where: { id: reservation.bookCopyId },
        data: {
          status: "AVAILABLE",
          currentHolderId: null,
        },
      });

      // Append immutable audit log
      await tx.bookHistory.create({
        data: {
          bookCopyId: reservation.bookCopyId,
          action: "RESERVATION_CANCELLED",
          actorId: user.id,
          previousState: "RESERVED",
          newState: "AVAILABLE",
          notes: `Reservation cancelled by ${user.firstName} ${user.lastName}. Physical copy restored to AVAILABLE inventory.`,
        },
      });
    }

    return updatedReservation;
  });

  // Sync search cache and server cache post-commit
  await syncBookToSearchIndex(reservation.bookId);
  invalidateBookCache(reservation.bookId);
  invalidateUserReservationsCache(user.id);

  return result;
}

async function fetchRawStudentReservations(userId: string): Promise<StudentReservationItem[]> {
  const reservations = await prisma.reservation.findMany({
    where: { studentId: userId },
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

  return reservations.map((r) => ({
    id: r.id,
    bookId: r.book.id,
    bookTitle: r.book.title,
    bookAuthor: r.book.author,
    category: r.book.category,
    coverImageUrl: r.book.coverImageUrl,
    copyBarcode: r.bookCopy?.barcode ?? null,
    status: r.status,
    expiresAt: r.expiresAt,
    createdAt: r.createdAt,
  }));
}

/**
 * Fetch all reservations for the authenticated student.
 * Automatically checks and updates expired reservations.
 * Cached with Next.js unstable_cache tagged by authenticated user ID.
 */
export async function getStudentReservations(
  userClerkId: string
): Promise<StudentReservationItem[]> {
  const user = await prisma.user.findUnique({
    where: { clerkId: userClerkId },
    select: { id: true },
  });

  if (!user) {
    return [];
  }

  // 1. Process expired PENDING reservations automatically
  const expiredReservations = await prisma.reservation.findMany({
    where: {
      studentId: user.id,
      status: "PENDING",
      expiresAt: { lte: new Date() },
    },
  });

  for (const expRes of expiredReservations) {
    await prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id: expRes.id },
        data: { status: "EXPIRED" },
      });

      if (expRes.bookCopyId) {
        await tx.bookCopy.update({
          where: { id: expRes.bookCopyId },
          data: { status: "AVAILABLE", currentHolderId: null },
        });

        await tx.bookHistory.create({
          data: {
            bookCopyId: expRes.bookCopyId,
            action: "RESERVATION_EXPIRED",
            actorId: user.id,
            previousState: "RESERVED",
            newState: "AVAILABLE",
            notes: "Reservation expired automatically after 48-hour hold window.",
          },
        });
      }
    });

    await syncBookToSearchIndex(expRes.bookId);
    invalidateBookCache(expRes.bookId);
    invalidateUserReservationsCache(user.id);
  }

  // 2. Fetch cached student reservations
  const getCachedReservations = unstable_cache(
    async (uId: string) => fetchRawStudentReservations(uId),
    [`user-reservations-${user.id}`],
    {
      revalidate: CACHE_TTL.SHORT,
      tags: [CACHE_TAGS.USER_RESERVATIONS(user.id)],
    }
  );

  return getCachedReservations(user.id);
}

/**
 * Check whether a student has an active PENDING reservation for a given book.
 */
export async function getStudentReservationForBook(
  bookId: string,
  userClerkId: string
) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userClerkId },
  });

  if (!user) return null;

  const reservation = await prisma.reservation.findFirst({
    where: {
      bookId,
      studentId: user.id,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
  });

  return reservation;
}
