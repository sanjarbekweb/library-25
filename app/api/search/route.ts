import { NextRequest, NextResponse } from "next/server";
import { SearchQuerySchema } from "@/lib/schemas/search-schema";
import { meiliClient, BOOKS_INDEX, BookSearchDocument } from "@/lib/search/client";
import { performFuzzySearch } from "@/lib/search/fuzzy";
import { getCatalogBooks } from "@/lib/services/book-service";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const rawParams = {
      q: url.searchParams.get("q") ?? "",
      category: url.searchParams.get("category") ?? undefined,
      limit: url.searchParams.get("limit") ?? 10,
      offset: url.searchParams.get("offset") ?? 0,
    };

    const parsed = SearchQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters provided",
            details: parsed.error.flatten(),
          },
        },
        { status: 422 }
      );
    }

    const { q, category, limit, offset } = parsed.data;

    // Build filter string for Meilisearch if category is specified
    const filterArray: string[] = [];
    if (category && category.toLowerCase() !== "all") {
      filterArray.push(`category = "${category}"`);
    }

    try {
      const index = meiliClient.index<BookSearchDocument>(BOOKS_INDEX);
      const meiliResponse = await index.search(q, {
        filter: filterArray.length > 0 ? filterArray.join(" AND ") : undefined,
        limit,
        offset,
      });

      return NextResponse.json({
        ok: true,
        data: {
          hits: meiliResponse.hits,
          totalHits: meiliResponse.estimatedTotalHits ?? meiliResponse.hits.length,
          query: meiliResponse.query,
          processingTimeMs: meiliResponse.processingTimeMs,
          source: "meilisearch",
        },
      });
    } catch (meiliError) {
      // Use in-process Fuse.js typo-tolerant search engine when Meilisearch binary is offline
      const fuzzyResult = await performFuzzySearch(q, category, limit, offset);

      return NextResponse.json({
        ok: true,
        data: {
          hits: fuzzyResult.hits,
          totalHits: fuzzyResult.totalHits,
          query: q,
          processingTimeMs: 0,
          source: "fuzzy_engine",
        },
      });
    }
  } catch (error) {
    console.error("[Search API Error]:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while executing search query",
        },
      },
      { status: 500 }
    );
  }
}
