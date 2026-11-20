import { prisma } from "@/lib/prisma";
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
import { syncBookToSearchIndex } from "@/lib/search/sync";
import { invalidateBookCache, invalidateCategoriesCache } from "@/lib/cache/invalidation";
import { CopyStatus } from "@prisma/client";
import { VerifiedActor, assertAssistantOrAdmin, HumanActor } from "@/lib/auth/verified-actor";
import { recordCopyAudit, recordDomainAudit } from "@/lib/services/audit-service";
import { withIdempotency } from "@/lib/services/idempotency-service";
import { ServiceError } from "@/lib/errors";

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

async function resolveAssistantActor(actorOrId: VerifiedActor | string): Promise<HumanActor> {
  if (typeof actorOrId === "string") {
    const user = await prisma.user.findFirst({
      where: { OR: [{ id: actorOrId }, { clerkId: actorOrId }] },
    });
    if (!user || !user.isActive) {
      throw new ServiceError("USER_NOT_FOUND", "Actor user profile not found or inactive", 404);
    }
    const actor: HumanActor = {
      type: "USER",
      userId: user.id,
      clerkId: user.clerkId,
      role: user.role,
      email: user.email,
    };
    assertAssistantOrAdmin(actor);
    return actor;
  }
  assertAssistantOrAdmin(actorOrId);
  return actorOrId;
}

/**
 * Create a new Book title and generate initial physical copies in prisma.$transaction,
 * writing BookHistory logs, DomainAudit logs, and updating Meilisearch index.
 */
export async function createBookWithCopies(
  actorOrIdentifier: VerifiedActor | string,
  input: CreateBookInput,
  _legacyRole?: string
) {
  const validated = CreateBookSchema.parse(input);
  const actor = await resolveAssistantActor(actorOrIdentifier);

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
    idempotencyKey,
  } = validated;

  try {
    const result = await prisma.$transaction(async (tx) => {
      return withIdempotency(tx, {
        key: idempotencyKey,
        route: "books:createWithCopies",
        actor,
        payload: validated,
        execute: async () => {
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

          // Write DomainAudit for title creation
          await recordDomainAudit(tx, {
            entityType: "BOOK",
            entityId: book.id,
            action: "BOOK_CREATED",
            actor,
            beforeState: null,
            afterState: {
              title: book.title,
              author: book.author,
              isbn: book.isbn,
              category: book.category,
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

            // Write immutable audit trail entry via recordCopyAudit
            await recordCopyAudit(tx, {
              bookCopyId: copy.id,
              action: "CREATED",
              actor,
              previousState: null,
              newState: CopyStatus.AVAILABLE,
              notes: `Registered initial physical copy (${copy.barcode}) for new title: ${book.title}`,
            });

            createdCopies.push(copy);
          }

          return {
            statusCode: 201,
            data: { book, copiesCount: createdCopies.length },
          };
        },
      });
    });

    // 3. Post-commit search index & server cache sync
    await syncBookToSearchIndex(result.book.id);
    invalidateBookCache(result.book.id);
    invalidateCategoriesCache();

    return result;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      throw new ServiceError("DUPLICATE_ENTRY", `A book record or barcode with that ISBN/Code already exists in library catalog.`, 409);
    }
    throw error;
  }
}

/**
 * Add an additional physical copy to an existing book title.
 */
export async function addPhysicalCopy(
  actorOrIdentifier: VerifiedActor | string,
  input: AddBookCopyInput,
  _legacyRole?: string
) {
  const validated = AddBookCopySchema.parse(input);
  const actor = await resolveAssistantActor(actorOrIdentifier);
  const { bookId, barcode, condition, idempotencyKey } = validated;

  try {
    const result = await prisma.$transaction(async (tx) => {
      return withIdempotency(tx, {
        key: idempotencyKey,
        route: "books:addPhysicalCopy",
        actor,
        payload: validated,
        execute: async () => {
          const book = await tx.book.findUnique({
            where: { id: bookId },
            include: { copies: true },
          });

          if (!book) {
            throw new ServiceError("BOOK_NOT_FOUND", "Target book title not found.", 404);
          }

          const prefix = book.title.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase() || "BOOK";
          const generatedBarcode =
            barcode?.trim() || `BC-${prefix}-${Date.now().toString().slice(-4)}-${(book.copies.length + 1).toString().padStart(2, "0")}`;

          // Check unique barcode collision
          const existingCopy = await tx.bookCopy.findUnique({
            where: { barcode: generatedBarcode },
          });

          if (existingCopy) {
            throw new ServiceError("BARCODE_EXISTS", `Physical book copy with barcode "${generatedBarcode}" already exists in library inventory. Please enter a unique barcode.`, 409);
          }

          const copy = await tx.bookCopy.create({
            data: {
              bookId,
              barcode: generatedBarcode,
              condition,
              status: CopyStatus.AVAILABLE,
            },
          });

          await recordCopyAudit(tx, {
            bookCopyId: copy.id,
            action: "CREATED",
            actor,
            previousState: null,
            newState: CopyStatus.AVAILABLE,
            notes: `Added physical copy (${copy.barcode}, ${condition}) to book: ${book.title}`,
          });

          return {
            statusCode: 201,
            data: { copy, bookTitle: book.title },
          };
        },
      });
    });

    await syncBookToSearchIndex(bookId);
    invalidateBookCache(bookId);

    return result;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      throw new ServiceError("DUPLICATE_ENTRY", `A physical book copy with that barcode already exists in library inventory.`, 409);
    }
    throw error;
  }
}

/**
 * Update title-only metadata for an existing book with transactional domain audit.
 */
export async function updateBookMetadata(
  actorOrIdentifier: VerifiedActor | string,
  rawInput: UpdateBookMetadataInput
) {
  const validated = UpdateBookMetadataSchema.parse(rawInput);
  const actor = await resolveAssistantActor(actorOrIdentifier);
  const { bookId, idempotencyKey, ...updates } = validated;

  const result = await prisma.$transaction(async (tx) => {
    return withIdempotency(tx, {
      key: idempotencyKey,
      route: "books:updateMetadata",
      actor,
      payload: validated,
      execute: async () => {
        const existing = await tx.book.findUnique({
          where: { id: bookId },
        });

        if (!existing) {
          throw new ServiceError("BOOK_NOT_FOUND", "Book title not found", 404);
        }

        const updated = await tx.book.update({
          where: { id: bookId },
          data: updates,
        });

        await recordDomainAudit(tx, {
          entityType: "BOOK",
          entityId: updated.id,
          action: "METADATA_UPDATED",
          actor,
          beforeState: {
            title: existing.title,
            author: existing.author,
            isbn: existing.isbn,
            category: existing.category,
          },
          afterState: {
            title: updated.title,
            author: updated.author,
            isbn: updated.isbn,
            category: updated.category,
          },
        });

        return {
          statusCode: 200,
          data: updated,
        };
      },
    });
  });

  await syncBookToSearchIndex(result.id);
  invalidateBookCache(result.id);
  invalidateCategoriesCache();

  return result;
}

/**
 * Retires or transfers a physical book copy to maintenance/lost status with copy audit.
 */
export async function retireBookCopy(
  actorOrIdentifier: VerifiedActor | string,
  rawInput: RetireCopyInput
) {
  const validated = RetireCopySchema.parse(rawInput);
  const actor = await resolveAssistantActor(actorOrIdentifier);
  const { copyId, reason, notes, idempotencyKey } = validated;

  const result = await prisma.$transaction(async (tx) => {
    return withIdempotency(tx, {
      key: idempotencyKey,
      route: "books:retireCopy",
      actor,
      payload: validated,
      execute: async () => {
        const copy = await tx.bookCopy.findFirst({
          where: { OR: [{ id: copyId }, { barcode: copyId }] },
          include: { book: { select: { id: true, title: true } } },
        });

        if (!copy) {
          throw new ServiceError("COPY_NOT_FOUND", "Physical book copy not found", 404);
        }

        if (copy.status === CopyStatus.BORROWED || copy.status === CopyStatus.RESERVED) {
          throw new ServiceError(
            "COPY_IN_CIRCULATION",
            `Cannot retire copy ${copy.barcode} while it is actively ${copy.status.toLowerCase()}. Complete checkout/return first.`,
            409
          );
        }

        const targetStatus = reason === "LOST" ? CopyStatus.LOST : CopyStatus.MAINTENANCE;

        const updatedCopy = await tx.bookCopy.update({
          where: { id: copy.id },
          data: {
            status: targetStatus,
            condition: reason === "DAMAGED" ? "DAMAGED" : copy.condition,
            currentHolderId: null,
            version: { increment: 1 },
          },
        });

        await recordCopyAudit(tx, {
          bookCopyId: copy.id,
          action: "STATUS_CHANGE",
          actor,
          previousState: copy.status,
          newState: targetStatus,
          notes: notes || `Copy retired to ${targetStatus} status (Reason: ${reason})`,
        });

        return {
          statusCode: 200,
          data: { copy: updatedCopy, bookId: copy.book.id },
        };
      },
    });
  });

  await syncBookToSearchIndex(result.bookId);
  invalidateBookCache(result.bookId);

  return result.copy;
}
