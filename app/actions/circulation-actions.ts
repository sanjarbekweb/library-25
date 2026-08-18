"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  checkoutBookCopy,
  checkinBookCopy,
  lookupStudents,
  lookupBookCopies,
  StudentSearchResult,
  CopySearchResult,
} from "@/lib/services/circulation-service";
import {
  CheckoutInput,
  CheckinInput,
} from "@/lib/schemas/circulation-schema";
import { getUserByClerkId } from "@/lib/services/user-service";
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
 * Helper to assert that user is authenticated and has assistant/admin role.
 */
async function assertAssistantAuth() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    throw new ServiceError(
      "UNAUTHENTICATED",
      "You must be signed in to perform circulation desk operations.",
      401
    );
  }

  let role = sessionClaims?.metadata?.role;
  if (!role) {
    const dbUser = await getUserByClerkId(userId);
    role = dbUser?.role;
  }

  if (role !== "ASSISTANT" && role !== "ADMIN") {
    throw new ServiceError(
      "UNAUTHORIZED",
      "Access restricted to assistants and administrators.",
      403
    );
  }

  return { userId, role };
}

/**
 * Server action to execute physical book checkout.
 */
export async function checkoutCopyAction(
  input: CheckoutInput
): Promise<ServerActionResponse<{ loanId: string; copyBarcode: string; bookTitle: string; studentName: string; dueDate: Date }>> {
  try {
    const { userId } = await assertAssistantAuth();

    const result = await checkoutBookCopy(input, userId);

    revalidatePath("/assistant");
    revalidatePath("/assistant/desk");
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

    console.error("[Checkout Action Error]:", error);
    return {
      ok: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred during checkout.",
      },
    };
  }
}

/**
 * Server action to execute physical book check-in.
 */
export async function checkinCopyAction(
  input: CheckinInput
): Promise<
  ServerActionResponse<{
    loanId: string;
    copyBarcode: string;
    bookTitle: string;
    studentName: string;
    returnedAt: Date;
    newStatus: string;
    newCondition: string;
  }>
> {
  try {
    const { userId } = await assertAssistantAuth();

    const result = await checkinBookCopy(input, userId);

    revalidatePath("/assistant");
    revalidatePath("/assistant/desk");
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

    console.error("[Check-in Action Error]:", error);
    return {
      ok: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred during check-in.",
      },
    };
  }
}

/**
 * Server action to search student accounts for circulation desk.
 */
export async function searchStudentsAction(
  query: string
): Promise<ServerActionResponse<StudentSearchResult[]>> {
  try {
    await assertAssistantAuth();
    const students = await lookupStudents(query);
    return { ok: true, data: students };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { ok: false, error: { code: error.code, message: error.message } };
    }
    return {
      ok: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to search students" },
    };
  }
}

/**
 * Server action to search book copies for barcode scan / search input.
 */
export async function searchCopiesAction(
  query: string
): Promise<ServerActionResponse<CopySearchResult[]>> {
  try {
    await assertAssistantAuth();
    const copies = await lookupBookCopies(query);
    return { ok: true, data: copies };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { ok: false, error: { code: error.code, message: error.message } };
    }
    return {
      ok: false,
      error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to search copies" },
    };
  }
}
