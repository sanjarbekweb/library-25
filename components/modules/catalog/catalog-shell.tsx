"use client";

import { CatalogFilterBar } from "./catalog-filter-bar";
import { BookCard } from "./book-card";
import { CatalogBookItem } from "@/lib/services/book-service";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import Link from "next/link";

interface CatalogShellProps {
  categories: string[];
  currentCategory: string;
  currentSearch: string;
  currentSort: string;
  page: number;
  totalPages: number;
  total: number;
  books: CatalogBookItem[];
}

export function CatalogShell({
  categories,
  currentCategory,
  currentSearch,
  currentSort,
  page,
  totalPages,
  total,
  books,
}: CatalogShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9] dark:bg-canvas-dark text-foreground">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-blue text-white font-bold">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="font-display font-extrabold text-base text-foreground">
              ShelfSync
            </span>
          </div>
          <span className="hidden sm:inline-block text-xs font-mono text-muted-foreground">
            {total} Book{total === 1 ? "" : "s"} in Collection
          </span>
        </div>
      </header>

      {/* Catalog Body Container */}
      <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Active Search Header Banner */}
        {currentSearch ? (
          <div className="rounded-3xl border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <h1 className="font-display font-extrabold text-xl sm:text-2xl text-foreground">
                Search Results for &ldquo;<span className="text-brand-blue">{currentSearch}</span>&rdquo;
              </h1>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                Found {total} title{total === 1 ? "" : "s"} matching your query
              </p>
            </div>
            <Link href="/">
              <button className="px-4 py-2 rounded-full border border-border text-xs font-semibold text-foreground hover:bg-accent transition-colors">
                Clear Search
              </button>
            </Link>
          </div>
        ) : null}

        {/* Interactive Filter & Sort Controls */}
        <CatalogFilterBar
          categories={categories}
          currentCategory={currentCategory}
          currentSearch={currentSearch}
          currentSort={currentSort}
        />

        {/* Books Grid */}
        {books.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card space-y-4 max-w-md mx-auto my-8">
            <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <h3 className="font-display font-bold text-lg text-foreground">
              No Matching Titles Found
            </h3>
            <p className="text-xs text-muted-foreground">
              We couldn&apos;t find any books matching your selected filters or search terms.
            </p>
            <Link href="/">
              <button className="px-4 py-2 rounded-full bg-brand-blue text-white text-xs font-bold shadow-xs">
                Reset Filters
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border pt-6">
            <div className="text-xs text-muted-foreground font-mono">
              Page {page} of {totalPages} ({total} total titles)
            </div>

            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link
                  href={{
                    pathname: "/",
                    query: {
                      ...(currentCategory !== "all" ? { category: currentCategory } : {}),
                      ...(currentSearch ? { search: currentSearch } : {}),
                      ...(currentSort !== "newest" ? { sort: currentSort } : {}),
                      page: (page - 1).toString(),
                    },
                  }}
                >
                  <button className="px-3 py-1.5 rounded-full border border-border bg-card text-xs font-semibold hover:bg-accent flex items-center gap-1">
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                </Link>
              ) : null}

              {page < totalPages ? (
                <Link
                  href={{
                    pathname: "/",
                    query: {
                      ...(currentCategory !== "all" ? { category: currentCategory } : {}),
                      ...(currentSearch ? { search: currentSearch } : {}),
                      ...(currentSort !== "newest" ? { sort: currentSort } : {}),
                      page: (page + 1).toString(),
                    },
                  }}
                >
                  <button className="px-3 py-1.5 rounded-full border border-border bg-card text-xs font-semibold hover:bg-accent flex items-center gap-1">
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
