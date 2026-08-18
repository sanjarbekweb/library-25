"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  submitBookFeedback,
  submitDirectBookReview,
  toggleFeedbackModeration,
  deleteFeedback,
} from "@/lib/services/feedback-service";
import {
  SubmitFeedbackInput,
  CreateDirectBookReviewInput,
  ModerateFeedbackInput,
  DeleteFeedbackInput,
} from "@/lib/schemas/feedback-schema";
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
 * Server Action for students to submit rating & written review on a returned loan.
 * Enforces server-side Clerk session verification (Invariant #3).
 */
export async function submitBookFeedbackAction(
  input: SubmitFeedbackInput
): Promise<ServerActionResponse<{ id: string; bookId: string }>> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        ok: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "You must be signed in to submit book feedback.",
        },
      };
    }

    const result = await submitBookFeedback(input, userId);

    revalidatePath(`/books/${result.bookId}`);
    revalidatePath("/loans");
    revalidatePath("/");
    revalidatePath("/admin/feedback");

    return {
      ok: true,
      data: { id: result.id, bookId: result.bookId },
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

    console.error("[Submit Feedback Action Error]:", error);
    return {
      ok: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while submitting review.",
      },
    };
  }
}

/**
 * Server Action for authenticated students to submit direct star rating & review for any book.
 */
export async function submitDirectBookReviewAction(
  input: CreateDirectBookReviewInput
): Promise<ServerActionResponse<{ id: string; bookId: string }>> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        ok: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "You must be signed in to rate and review books.",
        },
      };
    }

    const result = await submitDirectBookReview(input, userId);

    revalidatePath(`/books/${input.bookId}`);
    revalidatePath("/catalog");
    revalidatePath("/admin/feedback");

    return {
      ok: true,
      data: { id: result.id, bookId: result.bookId },
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

    console.error("[Submit Direct Review Action Error]:", error);
    return {
      ok: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while saving your review.",
      },
    };
  }
}

/**
 * Server Action for administrators to moderate (hide/publish) student reviews.
 * Enforces ADMIN role guard.
 */
export async function moderateFeedbackAction(
  input: ModerateFeedbackInput
): Promise<ServerActionResponse<{ id: string; isModerated: boolean }>> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return {
        ok: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication required.",
        },
      };
    }

    const role = sessionClaims?.metadata?.role;
    if (role !== "ADMIN") {
      return {
        ok: false,
        error: {
          code: "FORBIDDEN",
          message: "Administrative privileges required to moderate reviews.",
        },
      };
    }

    const result = await toggleFeedbackModeration(input);

    revalidatePath(`/books/${result.bookId}`);
    revalidatePath("/admin/feedback");
    revalidatePath("/");

    return {
      ok: true,
      data: { id: result.id, isModerated: result.isModerated },
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

    console.error("[Moderate Feedback Action Error]:", error);
    return {
      ok: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while moderating feedback.",
      },
    };
  }
}

/**
 * Server Action for administrators to delete a review.
 * Enforces ADMIN role guard.
 */
export async function deleteFeedbackAction(
  input: DeleteFeedbackInput
): Promise<ServerActionResponse<{ success: boolean }>> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return {
        ok: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication required.",
        },
      };
    }

    const role = sessionClaims?.metadata?.role;
    if (role !== "ADMIN") {
      return {
        ok: false,
        error: {
          code: "FORBIDDEN",
          message: "Administrative privileges required to delete reviews.",
        },
      };
    }

    const result = await deleteFeedback(input);

    revalidatePath(`/books/${result.bookId}`);
    revalidatePath("/admin/feedback");
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

    console.error("[Delete Feedback Action Error]:", error);
    return {
      ok: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while deleting feedback.",
      },
    };
  }
}
