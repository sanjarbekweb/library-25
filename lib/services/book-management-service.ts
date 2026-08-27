import { prisma } from "@/lib/prisma";
import {
  CreateBookSchema,
  AddBookCopySchema,
  CreateBookInput,
  AddBookCopyInput,
} from "@/lib/schemas/book-management-schema";
import { syncBookToSearchIndex } from "@/lib/search/sync";
import { invalidateBookCache, invalidateCategoriesCache } from "@/lib/cache/invalidation";
import { CopyStatus } from "@prisma/client";

export interface ManageableBookItem {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  category: string;
  description: string | null;
  coverImageUrl: string | null;
  publicationYear: number | null;
  createdAt: Date;
  totalCopies: number;
  availableCopies: number;
  reservedCopies: number;
  borrowedCopies: number;
  copies: {
    id: string;
    barcode: string;
    condition: string;
    status: CopyStatus;
    currentHolderId: string | null;
    currentHolderName: string | null;
  }[];
}

/**
 * Fetch all catalog titles with full copy management inventory breakdown.
 */
export async function getManageableBooks(): Promise<ManageableBookItem[]> {
  const books = await prisma.book.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      author: true,
      isbn: true,
      category: true,
      description: true,
      coverImageUrl: true,
      publicationYear: true,
      createdAt: true,
      copies: {
        orderBy: { barcode: "asc" },
        select: {
          id: true,
          barcode: true,
          condition: true,
          status: true,
          currentHolderId: true,
          currentHolder: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return books.map((b) => {
    const totalCopies = b.copies.length;
    const availableCopies = b.copies.filter(
      (c) => c.status === CopyStatus.AVAILABLE
    ).length;
    const reservedCopies = b.copies.filter(
      (c) => c.status === CopyStatus.RESERVED
    ).length;
    const borrowedCopies = b.copies.filter(
      (c) => c.status === CopyStatus.BORROWED
    ).length;

    return {
      id: b.id,
      title: b.title,
      author: b.author,
      isbn: b.isbn,
      category: b.category,
      description: b.description,
      coverImageUrl: b.coverImageUrl,
      publicationYear: b.publicationYear,
      createdAt: b.createdAt,
      totalCopies,
      availableCopies,
      reservedCopies,
      borrowedCopies,
      copies: b.copies.map((c) => ({
        id: c.id,
        barcode: c.barcode,
        condition: c.condition,
        status: c.status,
        currentHolderId: c.currentHolderId,
        currentHolderName: c.currentHolder
          ? `${c.currentHolder.firstName} ${c.currentHolder.lastName}`
          : null,
      })),
    };
  });
}

/**
 * Create a new Book title and generate initial physical copies in prisma.$transaction,
 * writing BookHistory logs and updating Meilisearch index.
 */
export async function createBookWithCopies(
  input: CreateBookInput,
  actorIdentifier: string,
  _actorRole?: string
) {
  const validated = CreateBookSchema.parse(input);

  const actor = await prisma.user.findFirst({
    where: {
      OR: [{ id: actorIdentifier }, { clerkId: actorIdentifier }],
    },
  });

  if (!actor) {
    throw new Error("Actor user record not found in database.");
  }

  const {
    title,
    author,
    isbn,
    category,
    description,
    coverImageUrl,
    publicationYear,
    initialCopyCount,
    initialCopyCondition,
  } = validated;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Book record
      const book = await tx.book.create({
        data: {
          title,
          author,
          isbn: isbn || null,
          category,
          description: description || null,
          coverImageUrl: coverImageUrl || null,
          publicationYear: publicationYear || null,
        },
      });

      // 2. Generate initial physical copies with clean human-readable barcodes
      const prefix = title.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase() || "BOOK";
      const timestamp = Date.now().toString().slice(-4);
      const copyData = Array.from({ length: initialCopyCount }).map((_, idx) => {
        const barcode = `BC-${prefix}-${timestamp}-${(idx + 1).toString().padStart(2, "0")}`;
        return {
          bookId: book.id,
          barcode,
          condition: initialCopyCondition,
          status: CopyStatus.AVAILABLE,
        };
      });

      const createdCopies = [];
      for (const copyInput of copyData) {
        const copy = await tx.bookCopy.create({
          data: copyInput,
        });

        // Write immutable audit trail entry
        await tx.bookHistory.create({
          data: {
            bookCopyId: copy.id,
            action: "CREATED",
            actorId: actor.id,
            previousState: null,
            newState: CopyStatus.AVAILABLE,
            notes: `Registered initial physical copy (${copy.barcode}) for new title: ${book.title}`,
          },
        });

        createdCopies.push(copy);
      }

      return { book, copiesCount: createdCopies.length };
    });

    // 3. Post-commit search index & server cache sync
    await syncBookToSearchIndex(result.book.id);
    invalidateBookCache(result.book.id);
    invalidateCategoriesCache();

    return result;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      throw new Error(`A book record or barcode with that ISBN/Code already exists in library catalog.`);
    }
    throw error;
  }
}

/**
 * Add an additional physical copy to an existing book title.
 */
export async function addPhysicalCopy(
  input: AddBookCopyInput,
  actorIdentifier: string,
  _actorRole?: string
) {
  const validated = AddBookCopySchema.parse(input);
  const { bookId, barcode, condition } = validated;

  const actor = await prisma.user.findFirst({
    where: {
      OR: [{ id: actorIdentifier }, { clerkId: actorIdentifier }],
    },
  });

  if (!actor) {
    throw new Error("Actor user record not found in database.");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({
        where: { id: bookId },
        include: { copies: true },
      });

      if (!book) {
        throw new Error("Target book title not found.");
      }

      const prefix = book.title.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase() || "BOOK";
      const generatedBarcode =
        barcode?.trim() || `BC-${prefix}-${Date.now().toString().slice(-4)}-${(book.copies.length + 1).toString().padStart(2, "0")}`;

      // Check unique barcode collision
      const existingCopy = await tx.bookCopy.findUnique({
        where: { barcode: generatedBarcode },
      });

      if (existingCopy) {
        throw new Error(`Physical book copy with barcode "${generatedBarcode}" already exists in library inventory. Please enter a unique barcode.`);
      }

      const copy = await tx.bookCopy.create({
        data: {
          bookId,
          barcode: generatedBarcode,
          condition,
          status: CopyStatus.AVAILABLE,
        },
      });

      await tx.bookHistory.create({
        data: {
          bookCopyId: copy.id,
          action: "CREATED",
          actorId: actor.id,
          previousState: null,
          newState: CopyStatus.AVAILABLE,
          notes: `Added physical copy (${copy.barcode}, ${condition}) to book: ${book.title}`,
        },
      });

      return { copy, bookTitle: book.title };
    });

    await syncBookToSearchIndex(bookId);
    invalidateBookCache(bookId);

    return result;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      throw new Error(`A physical book copy with that barcode already exists in library inventory.`);
    }
    throw error;
  }
}
