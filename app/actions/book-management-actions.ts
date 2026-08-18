"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/services/user-service";
import {
  createBookWithCopies,
  addPhysicalCopy,
} from "@/lib/services/book-management-service";
import {
  CreateBookSchema,
  AddBookCopySchema,
  CreateBookInput,
  AddBookCopyInput,
} from "@/lib/schemas/book-management-schema";

export async function createBookAction(input: CreateBookInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Authentication required." };
    }

    const dbUser = await getUserByClerkId(userId);
    if (!dbUser) {
      return { success: false, error: "User profile not found in system database." };
    }

    const role = dbUser.role || "STUDENT";
    if (role !== "ASSISTANT" && role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized. Assistant or Admin credentials required.",
      };
    }

    const parsed = CreateBookSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid input data.",
      };
    }

    const result = await createBookWithCopies(parsed.data, dbUser.id, role);

    revalidatePath("/catalog");
    revalidatePath("/assistant/books");
    revalidatePath("/assistant");

    return {
      success: true,
      message: `Successfully created "${result.book.title}" with ${result.copiesCount} physical copy/copies.`,
      bookId: result.book.id,
    };
  } catch (error) {
    console.error("createBookAction Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create book title.",
    };
  }
}

export async function addBookCopyAction(input: AddBookCopyInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Authentication required." };
    }

    const dbUser = await getUserByClerkId(userId);
    if (!dbUser) {
      return { success: false, error: "User profile not found in system database." };
    }

    const role = dbUser.role || "STUDENT";
    if (role !== "ASSISTANT" && role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized. Assistant or Admin credentials required.",
      };
    }

    const parsed = AddBookCopySchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid input data.",
      };
    }

    const result = await addPhysicalCopy(parsed.data, dbUser.id, role);

    revalidatePath("/catalog");
    revalidatePath("/assistant/books");
    revalidatePath(`/books/${input.bookId}`);

    return {
      success: true,
      message: `Added physical copy (${result.copy.barcode}) to "${result.bookTitle}".`,
      copyId: result.copy.id,
    };
  } catch (error) {
    console.error("addBookCopyAction Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add physical copy.",
    };
  }
}
