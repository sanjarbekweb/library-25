import Fuse, { IFuseOptions } from "fuse.js";
import { prisma } from "@/lib/prisma";

export interface BookFuzzyDocument {
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
}

const fuseOptions: IFuseOptions<BookFuzzyDocument> = {
  keys: [
    { name: "title", weight: 0.5 },
    { name: "author", weight: 0.3 },
    { name: "category", weight: 0.1 },
    { name: "isbn", weight: 0.1 },
  ],
  threshold: 0.45, // Typo-tolerant threshold allowing 1-2 character misspellings
  ignoreLocation: true,
  minMatchCharLength: 2,
};

/**
 * Execute in-process typo-tolerant fuzzy search over catalog books using Fuse.js.
 * Requires 0 external binaries, daemons, or background services.
 */
export async function performFuzzySearch(
  query: string,
  category?: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ hits: BookFuzzyDocument[]; totalHits: number }> {
  // Fetch all books with live copy availability
  const books = await prisma.book.findMany({
    include: {
      copies: {
        select: {
          status: true,
        },
      },
    },
  });

  let docs: BookFuzzyDocument[] = books.map((book) => {
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

  // Filter by category if specified
  if (category && category.toLowerCase() !== "all") {
    docs = docs.filter(
      (d) => d.category.toLowerCase() === category.toLowerCase()
    );
  }

  const cleanQuery = query.trim();
  if (!cleanQuery) {
    const totalHits = docs.length;
    const hits = docs.slice(offset, offset + limit);
    return { hits, totalHits };
  }

  // Create Fuse index and search
  const fuse = new Fuse(docs, fuseOptions);
  const results = fuse.search(cleanQuery);

  const matchedDocs = results.map((res) => res.item);
  const totalHits = matchedDocs.length;
  const hits = matchedDocs.slice(offset, offset + limit);

  return { hits, totalHits };
}
