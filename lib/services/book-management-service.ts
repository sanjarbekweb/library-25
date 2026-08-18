import { prisma } from "@/lib/prisma";
import {
  CreateBookSchema,
  AddBookCopySchema,
  CreateBookInput,
  AddBookCopyInput,
} from "@/lib/schemas/book-management-schema";
import { syncBookToSearchIndex } from "@/lib/search/sync";
import { CopyStatus, LoanStatus, ReservationStatus } from "@prisma/client";

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
  }[];
}

/**
 * Fetch all catalog titles with full copy management inventory breakdown.
 */
export async function getManageableBooks(): Promise<ManageableBookItem[]> {
  const books = await prisma.book.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      copies: {
        orderBy: { barcode: "asc" },
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
  actorRole: string
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

    // 2. Generate initial physical copies
    const timestamp = Date.now().toString().slice(-6);
    const copyData = Array.from({ length: initialCopyCount }).map((_, idx) => {
      const barcode = `BC-${timestamp}-${idx + 1}`;
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

  // 3. Post-commit search index sync
  await syncBookToSearchIndex(result.book.id);

  return result;
}

/**
 * Add an additional physical copy to an existing book title.
 */
export async function addPhysicalCopy(
  input: AddBookCopyInput,
  actorIdentifier: string,
  actorRole: string
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

  const result = await prisma.$transaction(async (tx) => {
    const book = await tx.book.findUnique({
      where: { id: bookId },
      include: { copies: true },
    });

    if (!book) {
      throw new Error("Target book title not found.");
    }

    const generatedBarcode =
      barcode || `BC-${Date.now().toString().slice(-6)}-${book.copies.length + 1}`;

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

  return result;
}
