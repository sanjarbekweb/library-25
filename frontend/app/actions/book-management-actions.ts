"use server";

/**
 * @deprecated Legacy Server Action superseded by Express REST API.
 * Use `@/hooks/api/useBooks` and `/api/v1/books` instead.
 */

import { revalidatePath } from "next/cache";
import {
  createBookWithCopies,
  addPhysicalCopy,
  updateBookMetadata,
  retireBookCopy,
} from "@/lib/services/book-management-service";
import {
  CreateBookSchema,
  AddBookCopySchema,
  UpdateBookMetadataSchema,
  RetireCopySchema,
  CreateBookInput,
  AddBookCopyInput,
  UpdateBookMetadataInput,
  RetireCopyInput,
} from "@/lib/schemas/book-management-schema";
import { getVerifiedHumanActor, assertAssistantOrAdmin } from "@/lib/auth/verified-actor";
import { ServiceError } from "@/lib/errors";

export async function createBookAction(input: CreateBookInput) {
  try {
    const actor = await getVerifiedHumanActor();
    assertAssistantOrAdmin(actor);

    const parsed = CreateBookSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid input data.",
      };
    }

    const result = await createBookWithCopies(actor, parsed.data);

    revalidatePath("/catalog");
    revalidatePath("/assistant/books");
    revalidatePath("/assistant");

    return {
      success: true,
      message: `Successfully created "${result.book.title}" with ${result.copiesCount} physical copy/copies.`,
      bookId: result.book.id,
    };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error("createBookAction Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create book title.",
    };
  }
}

export async function addBookCopyAction(input: AddBookCopyInput) {
  try {
    const actor = await getVerifiedHumanActor();
    assertAssistantOrAdmin(actor);

    const parsed = AddBookCopySchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid input data.",
      };
    }

    const result = await addPhysicalCopy(actor, parsed.data);

    revalidatePath("/catalog");
    revalidatePath("/assistant/books");
    revalidatePath(`/books/${input.bookId}`);

    return {
      success: true,
      message: `Added physical copy (${result.copy.barcode}) to "${result.bookTitle}".`,
      copyId: result.copy.id,
    };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error("addBookCopyAction Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add physical copy.",
    };
  }
}

export async function updateBookMetadataAction(input: UpdateBookMetadataInput) {
  try {
    const actor = await getVerifiedHumanActor();
    assertAssistantOrAdmin(actor);

    const parsed = UpdateBookMetadataSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid input data.",
      };
    }

    const result = await updateBookMetadata(actor, parsed.data);

    revalidatePath("/catalog");
    revalidatePath("/assistant/books");
    revalidatePath(`/books/${result.id}`);

    return {
      success: true,
      message: `Successfully updated metadata for "${result.title}".`,
      bookId: result.id,
    };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error("updateBookMetadataAction Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update book metadata.",
    };
  }
}

export async function retireBookCopyAction(input: RetireCopyInput) {
  try {
    const actor = await getVerifiedHumanActor();
    assertAssistantOrAdmin(actor);

    const parsed = RetireCopySchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid input data.",
      };
    }

    const result = await retireBookCopy(actor, parsed.data);

    revalidatePath("/catalog");
    revalidatePath("/assistant/books");
    revalidatePath("/assistant/desk");

    return {
      success: true,
      message: `Successfully retired copy (${result.barcode}) to ${result.status}.`,
      copyId: result.id,
    };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error("retireBookCopyAction Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to retire copy.",
    };
  }
}
