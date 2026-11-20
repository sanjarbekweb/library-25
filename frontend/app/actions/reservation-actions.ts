"use server";

/**
 * @deprecated Legacy Server Action superseded by Express REST API.
 * Use `@/hooks/api/useReservations` and `/api/v1/reservations` instead.
 */

import { revalidatePath } from "next/cache";
import {
  requestBookReservation,
  cancelReservation,
} from "@/lib/services/reservation-service";
import { ServiceError } from "@/lib/errors";
import { getVerifiedHumanActor } from "@/lib/auth/verified-actor";
import { CreateReservationInput, CancelReservationInput } from "@/lib/schemas/reservation-schema";

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
 * Enforces server-side Clerk session verification with database user authority.
 * Supports idempotency key and optimistic version concurrency.
 */
export async function requestReservationAction(
  bookIdOrInput: string | CreateReservationInput,
  holdDays?: number,
  holdUntilDate?: string,
  idempotencyKey?: string
): Promise<ServerActionResponse<{ reservationId: string }>> {
  try {
    const actor = await getVerifiedHumanActor();

    const input: CreateReservationInput =
      typeof bookIdOrInput === "string"
        ? {
            bookId: bookIdOrInput,
            holdDays,
            holdUntilDate,
            idempotencyKey,
          }
        : bookIdOrInput;

    const reservation = await requestBookReservation(input, actor);

    revalidatePath(`/books/${input.bookId}`);
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
 * Enforces server-side Clerk session verification with database user authority.
 */
export async function cancelReservationAction(
  reservationIdOrInput: string | CancelReservationInput,
  bookId?: string,
  idempotencyKey?: string
): Promise<ServerActionResponse<{ success: boolean; reservationId: string }>> {
  try {
    const actor = await getVerifiedHumanActor();

    const input: CancelReservationInput =
      typeof reservationIdOrInput === "string"
        ? {
            reservationId: reservationIdOrInput,
            idempotencyKey,
          }
        : reservationIdOrInput;

    const result = await cancelReservation(input, actor);

    if (bookId) {
      revalidatePath(`/books/${bookId}`);
    }
    revalidatePath("/reservations");
    revalidatePath("/");

    return {
      ok: true,
      data: result,
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
