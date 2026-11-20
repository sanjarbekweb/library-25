import { prisma } from "@/lib/prisma";
import {
  meiliClient,
  BOOKS_INDEX,
  configureBooksIndex,
  BookSearchDocument,
} from "./client";

/**
 * Synchronize a single catalog Book and its live copy availability status to Meilisearch index.
 * Upholds Search Cache Synchronization invariant (#6).
 * Safe against offline search binary during local dev.
 */
export async function syncBookToSearchIndex(bookId: string): Promise<boolean> {
  try {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        copies: {
          select: {
            status: true,
          },
        },
      },
    });

    const index = meiliClient.index<BookSearchDocument>(BOOKS_INDEX);

    if (!book) {
      try {
        await index.deleteDocument(bookId);
      } catch {
        // Document might not exist in index, ignore 404
      }
      return true;
    }

    const availableCopiesCount = book.copies.filter(
      (copy) => copy.status === "AVAILABLE"
    ).length;
    const totalCopiesCount = book.copies.length;

    const doc: BookSearchDocument = {
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      description: book.description,
      coverImageUrl: book.coverImageUrl,
      publicationYear: book.publicationYear,
      availableCopiesCount,
      totalCopiesCount,
    };

    await index.addDocuments([doc]);
    return true;
  } catch (error) {
    console.warn(
      `[Meilisearch Sync] Could not sync book ${bookId} to search index:`,
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

/**
 * Perform a full synchronization of all catalog Books to the Meilisearch search index.
 */
export async function syncAllBooksToSearchIndex(): Promise<{
  synced: number;
  success: boolean;
}> {
  try {
    await configureBooksIndex();

    const books = await prisma.book.findMany({
      include: {
        copies: {
          select: {
            status: true,
          },
        },
      },
    });

    const documents: BookSearchDocument[] = books.map((book) => {
      const availableCopiesCount = book.copies.filter(
        (copy) => copy.status === "AVAILABLE"
      ).length;
      const totalCopiesCount = book.copies.length;

      return {
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        category: book.category,
        description: book.description,
        coverImageUrl: book.coverImageUrl,
        publicationYear: book.publicationYear,
        availableCopiesCount,
        totalCopiesCount,
      };
    });

    if (documents.length > 0) {
      const index = meiliClient.index<BookSearchDocument>(BOOKS_INDEX);
      await index.addDocuments(documents);
    }

    return { synced: documents.length, success: true };
  } catch (error) {
    console.warn(
      "[Meilisearch Bulk Sync] Failed bulk sync to search index:",
      error instanceof Error ? error.message : error
    );
    return { synced: 0, success: false };
  }
}
