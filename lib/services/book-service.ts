import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { meiliClient, BOOKS_INDEX, BookSearchDocument } from "@/lib/search/client";
import { performFuzzySearch } from "@/lib/search/fuzzy";
import { CACHE_TAGS, CACHE_TTL } from "@/lib/cache/tags";
import {
  GetCatalogBooksSchema,
  BookIdParamSchema,
  GetCatalogBooksInput,
} from "@/lib/schemas/book-schema";

export interface CatalogBookItem {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  category: string;
  description: string | null;
  coverImageUrl: string | null;
  publicationYear: number | null;
  availableCopiesCount: number;
  totalCopiesCount: number;
  averageRating: number | null;
  reviewsCount: number;
  nextAvailableDate?: Date | string | null;
}

export type GetCatalogBooksParams = GetCatalogBooksInput;

export interface GetCatalogBooksResult {
  books: CatalogBookItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BookCopyStatusBreakdown {
  total: number;
  available: number;
  reserved: number;
  borrowed: number;
  maintenance: number;
  lost: number;
}

export interface BookFeedbackItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  studentName: string;
}

export interface BookDetails {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  category: string;
  description: string | null;
  coverImageUrl: string | null;
  publicationYear: number | null;
  createdAt: Date;
  copyBreakdown: BookCopyStatusBreakdown;
  averageRating: number | null;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  feedbacks: BookFeedbackItem[];
  nextAvailableDate: Date | null;
}

const getDefaultCatalogBooks = unstable_cache(
  async (limit: number = 12): Promise<GetCatalogBooksResult> => {
    const [total, books] = await Promise.all([
      prisma.book.count(),
      prisma.book.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          copies: {
            select: {
              id: true,
              status: true,
              loans: {
                where: { status: "ACTIVE" },
                select: { dueDate: true },
                orderBy: { dueDate: "asc" },
                take: 1,
              },
              reservations: {
                where: { status: "PENDING" },
                select: { expiresAt: true },
                orderBy: { expiresAt: "asc" },
                take: 1,
              },
            },
          },
          feedbacks: {
            where: { isModerated: false },
            select: { rating: true },
          },
        },
      }),
    ]);

    const mappedBooks: CatalogBookItem[] = books.map((book) => {
      const availableCopiesCount = book.copies.filter(
        (copy) => copy.status === "AVAILABLE"
      ).length;
      const totalCopiesCount = book.copies.length;
      const reviewsCount = book.feedbacks.length;
      const averageRating =
        reviewsCount > 0
          ? Number(
              (
                book.feedbacks.reduce((acc, f) => acc + f.rating, 0) /
                reviewsCount
              ).toFixed(1)
            )
          : null;

      let nextAvailableDate: Date | null = null;
      if (availableCopiesCount === 0) {
        const dates: Date[] = [];
        book.copies.forEach((c) => {
          if (c.loans[0]?.dueDate) dates.push(c.loans[0].dueDate);
          if (c.reservations[0]?.expiresAt) dates.push(c.reservations[0].expiresAt);
        });
        if (dates.length > 0) {
          dates.sort((a, b) => a.getTime() - b.getTime());
          nextAvailableDate = dates[0];
        }
      }

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
        averageRating,
        reviewsCount,
        nextAvailableDate,
      };
    });

    return {
      books: mappedBooks,
      total,
      page: 1,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },
  ["default-catalog-page-1"],
  { revalidate: CACHE_TTL.SHORT, tags: [CACHE_TAGS.CATALOG] }
);

/**
 * Service function to retrieve catalog books with pagination, sorting, and availability metrics.
 * Upholds Prisma Isolation invariant (lib/services/* only).
 * Validates inputs via Zod schema and enforces strict Prisma types.
 * Leverages Meilisearch primary search index when available.
 */
export async function getCatalogBooks(
  rawParams: GetCatalogBooksParams = {}
): Promise<GetCatalogBooksResult> {
  const params = GetCatalogBooksSchema.parse(rawParams);
  const { category, search, sort, page, limit } = params;

  if (
    (!category || category.toLowerCase() === "all") &&
    (!search || search.trim() === "") &&
    (sort === "newest" || !sort) &&
    page === 1
  ) {
    return getDefaultCatalogBooks(limit);
  }

  const where: Prisma.BookWhereInput = {};

  if (category && category.toLowerCase() !== "all") {
    where.category = { equals: category, mode: "insensitive" };
  }

  if (search && search.trim() !== "") {
    const query = search.trim();
    let meiliMatchedIds: string[] | null = null;

    try {
      const index = meiliClient.index<BookSearchDocument>(BOOKS_INDEX);
      const filterArray: string[] = [];
      if (category && category.toLowerCase() !== "all") {
        filterArray.push(`category = "${category}"`);
      }
      const meiliRes = await index.search(query, {
        filter: filterArray.length > 0 ? filterArray.join(" AND ") : undefined,
        limit: 100,
      });

      if (meiliRes.hits.length > 0) {
        meiliMatchedIds = meiliRes.hits.map((h) => h.id);
      }
    } catch {
      // Meilisearch offline, fall back to Postgres
    }

    if (meiliMatchedIds && meiliMatchedIds.length > 0) {
      where.id = { in: meiliMatchedIds };
    } else {
      try {
        const fuzzy = await performFuzzySearch(query, category, 100, 0);
        if (fuzzy.hits.length > 0) {
          where.id = { in: fuzzy.hits.map((h) => h.id) };
        } else {
          where.OR = [
            { title: { contains: query, mode: "insensitive" } },
            { author: { contains: query, mode: "insensitive" } },
            { isbn: { contains: query, mode: "insensitive" } },
          ];
        }
      } catch {
        where.OR = [
          { title: { contains: query, mode: "insensitive" } },
          { author: { contains: query, mode: "insensitive" } },
          { isbn: { contains: query, mode: "insensitive" } },
        ];
      }
    }
  }

  let orderBy: Prisma.BookOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "title-asc") {
    orderBy = { title: "asc" };
  } else if (sort === "title-desc") {
    orderBy = { title: "desc" };
  } else if (sort === "newest") {
    orderBy = { createdAt: "desc" };
  }

  const offset = (page - 1) * limit;

  // When sorting by rating, aggregate across all matching catalog entries before paginating
  if (sort === "rating") {
    const [total, allBooks] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        include: {
          copies: {
            select: {
              status: true,
            },
          },
          feedbacks: {
            where: { isModerated: false },
            select: {
              rating: true,
            },
          },
        },
      }),
    ]);

    const mappedBooks: CatalogBookItem[] = allBooks.map((book) => {
      const availableCopiesCount = book.copies.filter(
        (copy) => copy.status === "AVAILABLE"
      ).length;
      const totalCopiesCount = book.copies.length;
      const reviewsCount = book.feedbacks.length;
      const averageRating =
        reviewsCount > 0
          ? Number(
              (
                book.feedbacks.reduce((acc, f) => acc + f.rating, 0) /
                reviewsCount
              ).toFixed(1)
            )
          : null;

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
        averageRating,
        reviewsCount,
      };
    });

    mappedBooks.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
    const paginatedBooks = mappedBooks.slice(offset, offset + limit);

    return {
      books: paginatedBooks,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // Standard database-level pagination for title-asc, title-desc, and newest
  const [total, books] = await Promise.all([
    prisma.book.count({ where }),
    prisma.book.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      include: {
        copies: {
          select: {
            id: true,
            status: true,
            loans: {
              where: { status: "ACTIVE" },
              select: { dueDate: true },
              orderBy: { dueDate: "asc" },
              take: 1,
            },
            reservations: {
              where: { status: "PENDING" },
              select: { expiresAt: true },
              orderBy: { expiresAt: "asc" },
              take: 1,
            },
          },
        },
        feedbacks: {
          where: { isModerated: false },
          select: {
            rating: true,
          },
        },
      },
    }),
  ]);

  const mappedBooks: CatalogBookItem[] = books.map((book) => {
    const availableCopiesCount = book.copies.filter(
      (copy) => copy.status === "AVAILABLE"
    ).length;
    const totalCopiesCount = book.copies.length;
    const reviewsCount = book.feedbacks.length;
    const averageRating =
      reviewsCount > 0
        ? Number(
            (
              book.feedbacks.reduce((acc, f) => acc + f.rating, 0) /
              reviewsCount
            ).toFixed(1)
          )
        : null;

    let nextAvailableDate: Date | null = null;
    if (availableCopiesCount === 0) {
      const dates: Date[] = [];
      book.copies.forEach((c) => {
        if (c.loans[0]?.dueDate) dates.push(c.loans[0].dueDate);
        if (c.reservations[0]?.expiresAt) dates.push(c.reservations[0].expiresAt);
      });
      if (dates.length > 0) {
        dates.sort((a, b) => a.getTime() - b.getTime());
        nextAvailableDate = dates[0];
      }
    }

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
      averageRating,
      reviewsCount,
      nextAvailableDate,
    };
  });

  return {
    books: mappedBooks,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
/**
 * Internal raw fetcher for book details metadata, copy breakdown, and reviews.
 */
async function fetchRawBookDetails(id: string): Promise<BookDetails | null> {
  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      copies: {
        select: {
          id: true,
          status: true,
          condition: true,
        },
      },
      feedbacks: {
        where: { isModerated: false },
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!book) return null;

  const copyBreakdown: BookCopyStatusBreakdown = {
    total: book.copies.length,
    available: 0,
    reserved: 0,
    borrowed: 0,
    maintenance: 0,
    lost: 0,
  };

  book.copies.forEach((c) => {
    if (c.status === "AVAILABLE") copyBreakdown.available++;
    else if (c.status === "RESERVED") copyBreakdown.reserved++;
    else if (c.status === "BORROWED") copyBreakdown.borrowed++;
    else if (c.status === "MAINTENANCE") copyBreakdown.maintenance++;
    else if (c.status === "LOST") copyBreakdown.lost++;
  });

  const ratingDistribution: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  let totalRatingSum = 0;

  const feedbacks: BookFeedbackItem[] = book.feedbacks.map((f) => {
    if (f.rating >= 1 && f.rating <= 5) {
      ratingDistribution[f.rating] = (ratingDistribution[f.rating] || 0) + 1;
    }
    totalRatingSum += f.rating;

    return {
      id: f.id,
      rating: f.rating,
      comment: f.comment,
      createdAt: f.createdAt,
      studentName: `${f.student.firstName} ${f.student.lastName}`,
    };
  });

  const totalReviews = feedbacks.length;
  const averageRating =
    totalReviews > 0
      ? Number((totalRatingSum / totalReviews).toFixed(1))
      : null;

  let nextAvailableDate: Date | null = null;
  if (copyBreakdown.available > 0) {
    nextAvailableDate = new Date();
  } else {
    const [earliestLoan, earliestReservation] = await Promise.all([
      prisma.loan.findFirst({
        where: { bookCopy: { bookId: book.id }, status: "ACTIVE" },
        orderBy: { dueDate: "asc" },
        select: { dueDate: true },
      }),
      prisma.reservation.findFirst({
        where: { bookId: book.id, status: "PENDING" },
        orderBy: { expiresAt: "asc" },
        select: { expiresAt: true },
      }),
    ]);

    const dates: Date[] = [];
    if (earliestLoan?.dueDate) dates.push(earliestLoan.dueDate);
    if (earliestReservation?.expiresAt) dates.push(earliestReservation.expiresAt);

    if (dates.length > 0) {
      dates.sort((a, b) => a.getTime() - b.getTime());
      nextAvailableDate = dates[0];
    }
  }

  return {
    id: book.id,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    category: book.category,
    description: book.description,
    coverImageUrl: book.coverImageUrl,
    publicationYear: book.publicationYear,
    createdAt: book.createdAt,
    copyBreakdown,
    averageRating,
    totalReviews,
    ratingDistribution,
    feedbacks,
    nextAvailableDate,
  };
}

/**
 * Service function to retrieve detailed book metadata, per-copy availability breakdown, and verified reviews.
 * Cached with Next.js unstable_cache and tagged per book ID for instant loads & targeted invalidation.
 */
export async function getBookDetails(id: string): Promise<BookDetails | null> {
  const parsedId = BookIdParamSchema.safeParse(id);
  if (!parsedId.success) {
    return null;
  }

  const bookId = parsedId.data;
  const getCachedBook = unstable_cache(
    async (bId: string) => fetchRawBookDetails(bId),
    [`book-details-${bookId}`],
    {
      revalidate: CACHE_TTL.SHORT,
      tags: [CACHE_TAGS.BOOK(bookId)],
    }
  );

  return getCachedBook(bookId);
}

/**
 * Service function to retrieve distinct catalog categories.
 * Cached using Next.js unstable_cache with 300s TTL and 'catalog-categories' tag.
 */
export const getCategories = unstable_cache(
  async (): Promise<string[]> => {
    const categories = await prisma.book.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });

    return categories.map((c) => c.category);
  },
  [CACHE_TAGS.CATEGORIES],
  { revalidate: CACHE_TTL.LONG, tags: [CACHE_TAGS.CATEGORIES] }
);

/**
 * Service function to retrieve top demand and recommended books for catalog showcase.
 */
export const getTopDemandBooks = unstable_cache(
  async (limit: number = 5): Promise<CatalogBookItem[]> => {
    const books = await prisma.book.findMany({
      take: limit,
      include: {
        copies: { select: { status: true } },
        feedbacks: { select: { rating: true } },
        reservations: { select: { id: true } },
      },
      orderBy: [
        { feedbacks: { _count: "desc" } },
        { reservations: { _count: "desc" } },
        { createdAt: "desc" },
      ],
    });

    return books.map((b) => {
      const totalCopiesCount = b.copies.length;
      const availableCopiesCount = b.copies.filter(
        (c) => c.status === "AVAILABLE"
      ).length;
      const totalRating = b.feedbacks.reduce((acc, f) => acc + f.rating, 0);
      const reviewsCount = b.feedbacks.length;
      const averageRating =
        reviewsCount > 0 ? Number((totalRating / reviewsCount).toFixed(1)) : null;

      return {
        id: b.id,
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        category: b.category,
        description: b.description,
        coverImageUrl: b.coverImageUrl,
        publicationYear: b.publicationYear,
        availableCopiesCount,
        totalCopiesCount,
        averageRating,
        reviewsCount,
      };
    });
  },
  [CACHE_TAGS.TOP_DEMAND],
  { revalidate: CACHE_TTL.SHORT, tags: [CACHE_TAGS.TOP_DEMAND] }
);
