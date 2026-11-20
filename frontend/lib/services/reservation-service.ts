import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { syncBookToSearchIndex } from "@/lib/search/sync";
import { invalidateBookCache, invalidateUserReservationsCache } from "@/lib/cache/invalidation";
import { CACHE_TAGS, CACHE_TTL } from "@/lib/cache/tags";
import { ServiceError } from "@/lib/errors";
import {
  CreateReservationSchema,
  CancelReservationSchema,
  CreateReservationInput,
  CancelReservationInput,
} from "@/lib/schemas/reservation-schema";
import { VerifiedActor } from "@/lib/auth/verified-actor";
import { recordCopyAudit } from "@/lib/services/audit-service";
import { withIdempotency } from "@/lib/services/idempotency-service";
import { CopyStatus } from "@prisma/client";

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
 * - Verified Actor Authority: derives actor strictly from verified session
 * - Atomic $transaction with conditional copy claim (updateMany checking count === 1)
 * - Monotonic copy version increment for optimistic locking
 * - Unique pending hold enforcement per student and book
 * - Immutable Audit Guarantee: writes BookHistory via recordCopyAudit inside atomic transaction
 * - Idempotency: retry-safe with IdempotencyRecord
 * - Post-commit Meilisearch search index sync and cache invalidation
 */
export async function requestBookReservation(
  input: CreateReservationInput,
  actor: VerifiedActor
) {
  const parsed = CreateReservationSchema.parse(input);

  // 1. Resolve student identity
  let studentId: string;
  let studentName: string;
  let studentEmail: string;

  if (actor.type === "USER") {
    const user = await prisma.user.findUnique({
      where: { id: actor.userId },
    });

    if (!user) {
      throw new ServiceError("USER_NOT_FOUND", "User account does not exist in database", 404);
    }

    if (!user.isActive) {
      throw new ServiceError(
        "STUDENT_INACTIVE",
        "Your account is deactivated. Please contact the library administration.",
        400
      );
    }

    studentId = user.id;
    studentName = `${user.firstName} ${user.lastName}`.trim();
    studentEmail = user.email;
  } else {
    throw new ServiceError("UNAUTHORIZED_ACTOR", "System actors cannot place student reservations", 403);
  }

  // 2. Check if student already has a pending reservation for this book
  const existingReservation = await prisma.reservation.findFirst({
    where: {
      bookId: parsed.bookId,
      studentId,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
  });

  if (existingReservation) {
    throw new ServiceError(
      "RESERVATION_EXISTS",
      "You already have an active pending reservation for this book",
      409
    );
  }

  // 3. Find an available physical copy of the book
  let targetCopy: { id: string; barcode: string; version: number } | null = null;

  if (parsed.copyId) {
    const copy = await prisma.bookCopy.findFirst({
      where: {
        id: parsed.copyId,
        bookId: parsed.bookId,
        status: CopyStatus.AVAILABLE,
      },
      select: { id: true, barcode: true, version: true },
    });
    if (!copy) {
      throw new ServiceError(
        "NO_COPIES_AVAILABLE",
        "The requested physical book copy is not available for reservation",
        409
      );
    }
    targetCopy = copy;
  } else {
    const copy = await prisma.bookCopy.findFirst({
      where: {
        bookId: parsed.bookId,
        status: CopyStatus.AVAILABLE,
      },
      orderBy: { barcode: "asc" },
      select: { id: true, barcode: true, version: true },
    });
    if (!copy) {
      throw new ServiceError(
        "NO_COPIES_AVAILABLE",
        "No physical copies of this book are currently available for reservation",
        409
      );
    }
    targetCopy = copy;
  }

  // 4. Calculate expiration window (1 to 7 days, default 48h)
  const now = new Date();
  let expiresAt = new Date();

  if (parsed.holdUntilDate) {
    const customDate = new Date(parsed.holdUntilDate);
    const maxDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    if (customDate > maxDate) {
      expiresAt = maxDate;
    } else if (customDate < minDate) {
      expiresAt = minDate;
    } else {
      expiresAt = customDate;
    }
  } else if (parsed.holdDays) {
    const days = Math.min(Math.max(parsed.holdDays, 1), 7);
    expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  } else {
    // Default 48 hours
    expiresAt.setTime(now.getTime() + 48 * 60 * 60 * 1000);
  }

  // 5. Atomic transaction with Idempotency and Optimistic Lock
  const result = await prisma.$transaction(async (tx) => {
    return withIdempotency(tx, {
      key: parsed.idempotencyKey,
      route: "reservations:create",
      actor,
      payload: parsed,
      execute: async () => {
        // In-transaction recheck for pending reservation from same student
        const inTxExisting = await tx.reservation.findFirst({
          where: {
            bookId: parsed.bookId,
            studentId,
            status: "PENDING",
            expiresAt: { gt: now },
          },
        });

        if (inTxExisting) {
          throw new ServiceError(
            "RESERVATION_EXISTS",
            "You already have an active pending reservation for this book",
            409
          );
        }

        // Conditional copy claim using updateMany with optimistic locking
        const claimed = await tx.bookCopy.updateMany({
          where: {
            id: targetCopy.id,
            status: CopyStatus.AVAILABLE,
            version: parsed.expectedVersion !== undefined ? parsed.expectedVersion : targetCopy.version,
          },
          data: {
            status: CopyStatus.RESERVED,
            currentHolderId: studentId,
            version: { increment: 1 },
          },
        });

        if (claimed.count === 0) {
          throw new ServiceError(
            "COPY_CONCURRENTLY_RESERVED",
            "This book copy was concurrently reserved or modified by another session",
            409
          );
        }

        // Create Reservation record
        const reservation = await tx.reservation.create({
          data: {
            bookId: parsed.bookId,
            bookCopyId: targetCopy.id,
            studentId,
            status: "PENDING",
            expiresAt,
          },
        });

        // Record immutable audit entry
        await recordCopyAudit(
          tx,
          {
            bookCopyId: targetCopy.id,
            action: "RESERVED",
            actor,
            previousState: CopyStatus.AVAILABLE,
            newState: CopyStatus.RESERVED,
            notes: `Online reservation requested by student ${studentName} (${studentEmail}). Expires ${expiresAt.toISOString()}.`,
          }
        );

        return {
          statusCode: 201,
          data: reservation,
        };
      },
    });
  });

  // 6. Post-commit search cache & server cache synchronization
  await syncBookToSearchIndex(parsed.bookId);
  invalidateBookCache(parsed.bookId);
  invalidateUserReservationsCache(studentId);

  return result;
}

/**
 * Cancel an active pending student reservation with guarded holder release and audit logging.
 */
export async function cancelReservation(
  input: CancelReservationInput,
  actor: VerifiedActor
) {
  const parsed = CancelReservationSchema.parse(input);

  // 1. Resolve reservation record
  const reservation = await prisma.reservation.findUnique({
    where: { id: parsed.reservationId },
    include: { bookCopy: true },
  });

  if (!reservation) {
    throw new ServiceError("RESERVATION_NOT_FOUND", "Reservation record not found", 404);
  }

  // 2. Verify authorization (student must own reservation, assistant/admin can cancel any)
  if (actor.type === "USER") {
    if (actor.role === "STUDENT" && reservation.studentId !== actor.userId) {
      throw new ServiceError(
        "UNAUTHORIZED",
        "You are not authorized to cancel this reservation",
        403
      );
    }
  }

  if (reservation.status !== "PENDING") {
    throw new ServiceError(
      "INVALID_STATE",
      `Cannot cancel reservation with status ${reservation.status}`,
      409
    );
  }

  // 3. Atomic transaction with Idempotency and Guarded Holder Release
  const result = await prisma.$transaction(async (tx) => {
    return withIdempotency(tx, {
      key: parsed.idempotencyKey,
      route: "reservations:cancel",
      actor,
      payload: parsed,
      execute: async () => {
        // Conditionally update reservation status
        const updatedRes = await tx.reservation.updateMany({
          where: {
            id: parsed.reservationId,
            status: "PENDING",
          },
          data: { status: "CANCELLED" },
        });

        if (updatedRes.count === 0) {
          throw new ServiceError(
            "CONCURRENCY_CONFLICT",
            "Reservation was concurrently updated, fulfilled, or cancelled",
            409
          );
        }

        // Guarded release of physical copy if copy was RESERVED for this student
        if (reservation.bookCopyId) {
          const releasedCopy = await tx.bookCopy.updateMany({
            where: {
              id: reservation.bookCopyId,
              status: CopyStatus.RESERVED,
              currentHolderId: reservation.studentId,
              ...(parsed.expectedVersion !== undefined ? { version: parsed.expectedVersion } : {}),
            },
            data: {
              status: CopyStatus.AVAILABLE,
              currentHolderId: null,
              version: { increment: 1 },
            },
          });

          if (releasedCopy.count > 0) {
            // Append immutable audit log
            const actorDescription = actor.type === "USER" ? actor.email : actor.serviceName;
            await recordCopyAudit(
              tx,
              {
                bookCopyId: reservation.bookCopyId,
                action: "RESERVATION_CANCELLED",
                actor,
                previousState: CopyStatus.RESERVED,
                newState: CopyStatus.AVAILABLE,
                notes: `Reservation cancelled by ${actorDescription}. Physical copy restored to AVAILABLE inventory.`,
              }
            );
          }
        }

        return {
          statusCode: 200,
          data: { success: true, reservationId: parsed.reservationId },
        };
      },
    });
  });

  // 4. Post-commit cache invalidation
  await syncBookToSearchIndex(reservation.bookId);
  invalidateBookCache(reservation.bookId);
  invalidateUserReservationsCache(reservation.studentId);

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

  const now = new Date();

  return reservations.map((r) => {
    // Computed display status for UI: if still PENDING but passed expiration, display as EXPIRED
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

const getCachedStudentReservations = unstable_cache(
  async (uId: string) => fetchRawStudentReservations(uId),
  ["user-reservations-data"],
  {
    revalidate: CACHE_TTL.SHORT,
    tags: [CACHE_TAGS.CATALOG],
  }
);

/**
 * Fetch all reservations for a student.
 * Read-only implementation upholding the law against GET-triggered mutations.
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

  return getCachedStudentReservations(user.id);
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
    select: { id: true },
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

/**
 * Bounded maintenance / worker function to expire overdue pending reservations.
 * Upholds transactional audit logging with verified system actor.
 */
export async function expirePendingReservations(actor: VerifiedActor, limit = 50): Promise<number> {
  const now = new Date();

  const expiredReservations = await prisma.reservation.findMany({
    where: {
      status: "PENDING",
      expiresAt: { lte: now },
    },
    take: limit,
  });

  if (expiredReservations.length === 0) return 0;

  let expiredCount = 0;

  for (const expRes of expiredReservations) {
    try {
      await prisma.$transaction(async (tx) => {
        const updated = await tx.reservation.updateMany({
          where: { id: expRes.id, status: "PENDING" },
          data: { status: "EXPIRED" },
        });

        if (updated.count === 0) return;

        if (expRes.bookCopyId) {
          const released = await tx.bookCopy.updateMany({
            where: {
              id: expRes.bookCopyId,
              status: CopyStatus.RESERVED,
              currentHolderId: expRes.studentId,
            },
            data: { status: CopyStatus.AVAILABLE, currentHolderId: null, version: { increment: 1 } },
          });

          if (released.count > 0) {
            await recordCopyAudit(
              tx,
              {
                bookCopyId: expRes.bookCopyId,
                action: "RESERVATION_EXPIRED",
                actor,
                previousState: CopyStatus.RESERVED,
                newState: CopyStatus.AVAILABLE,
                notes: `Reservation expired automatically after hold window. Restored to available inventory.`,
              }
            );
          }
        }
        expiredCount++;
      });

      await syncBookToSearchIndex(expRes.bookId);
      invalidateBookCache(expRes.bookId);
      invalidateUserReservationsCache(expRes.studentId);
    } catch (err) {
      console.error(`[expirePendingReservations] Failed to expire reservation ${expRes.id}:`, err);
    }
  }

  return expiredCount;
}
