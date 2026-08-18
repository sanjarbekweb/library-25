"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  requestBookReservation,
  cancelReservation,
} from "@/lib/services/reservation-service";
import { ServiceError } from "@/lib/errors";

export interface ServerActionResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Server action to place an online reservation request for a book title.
 * Enforces server-side Clerk session verification (Invariant #3).
 */
export async function requestReservationAction(
  bookId: string,
  holdDays?: number,
  holdUntilDate?: string
): Promise<ServerActionResponse<{ reservationId: string }>> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        ok: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "You must be signed in to reserve a book.",
        },
      };
    }

    const reservation = await requestBookReservation(bookId, userId, holdDays, holdUntilDate);

    revalidatePath(`/books/${bookId}`);
    revalidatePath("/reservations");
    revalidatePath("/");

    return {
      ok: true,
      data: { reservationId: reservation.id },
    };
  } catch (error) {
    if (error instanceof ServiceError) {
      return {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }

    console.error("[Reservation Action Error]:", error);
    return {
      ok: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while placing reservation.",
      },
    };
  }
}

/**
 * Server action to cancel a pending reservation.
 * Enforces server-side Clerk session verification (Invariant #3).
 */
export async function cancelReservationAction(
  reservationId: string,
  bookId?: string
): Promise<ServerActionResponse<{ success: boolean }>> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        ok: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "You must be signed in to cancel a reservation.",
        },
      };
    }

    await cancelReservation(reservationId, userId);

    if (bookId) {
      revalidatePath(`/books/${bookId}`);
    }
    revalidatePath("/reservations");
    revalidatePath("/");

    return {
      ok: true,
      data: { success: true },
    };
  } catch (error) {
    if (error instanceof ServiceError) {
      return {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }

    console.error("[Cancel Action Error]:", error);
    return {
      ok: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while cancelling reservation.",
      },
    };
  }
}
