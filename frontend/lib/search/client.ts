import { Meilisearch } from "meilisearch";

export const BOOKS_INDEX = "books";

export interface BookSearchDocument {
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

const meilisearchHost =
  process.env.MEILISEARCH_HOST || "http://localhost:7700";
const meilisearchApiKey =
  process.env.MEILISEARCH_MASTER_KEY || "shelfsync_meili_master_key_dev";

/**
 * Singleton Meilisearch client instance for server-side search operations.
 * Upholds Search Credential Security invariant (#4).
 */
export const meiliClient = new Meilisearch({
  host: meilisearchHost,
  apiKey: meilisearchApiKey,
});

/**
 * Configure the `books` index searchable attributes, filterable attributes, and ranking rules.
 */
export async function configureBooksIndex(): Promise<void> {
  try {
    const index = meiliClient.index<BookSearchDocument>(BOOKS_INDEX);

    await index.updateSettings({
      searchableAttributes: ["title", "author", "category", "isbn", "description"],
      filterableAttributes: ["category", "availableCopiesCount"],
      sortableAttributes: ["title", "publicationYear"],
      rankingRules: [
        "words",
        "typo",
        "proximity",
        "attribute",
        "exactness",
      ],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: {
          oneTypo: 4,
          twoTypos: 8,
        },
      },
    });
  } catch (error) {
    console.warn(
      "[Meilisearch] Index configuration skipped or failed (service may be offline):",
      error instanceof Error ? error.message : error
    );
  }
}
