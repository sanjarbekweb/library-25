import Link from "next/link";
import { Suspense } from "react";
import { BookOpen, Sparkles, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { getCatalogBooks, getCategories, getTopDemandBooks } from "@/lib/services/book-service";
import { syncCurrentAuthenticatedUser } from "@/lib/services/user-service";
import { Navbar } from "@/components/shared/navbar";
import { BookCard } from "@/components/modules/catalog/book-card";
import { CatalogFilterBar } from "@/components/modules/catalog/catalog-filter-bar";
import { CatalogSkeleton } from "@/components/modules/catalog/catalog-skeleton";
import { CatalogScrollRestoration } from "@/components/modules/catalog/catalog-scroll-restoration";
import { TopDemandShowcase } from "@/components/modules/catalog/top-demand-showcase";
import { Button } from "@/components/ui/button";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "School Library Catalog Exploration",
  description:
    "Explore physical book titles, live copy inventory availability, categories, and verified student reviews in the ShelfSync catalog.",
};

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const category = params.category || "all";
  const search = params.search || "";
  const sort = (params.sort || "newest") as
    | "title-asc"
    | "title-desc"
    | "newest"
    | "rating";

  const [, categories, catalogData, topDemandBooks] = await Promise.all([
    syncCurrentAuthenticatedUser(),
    getCategories(),
    getCatalogBooks({ category, search, sort, page, limit: 12 }),
    getTopDemandBooks(5),
  ]);

  const { books, total, totalPages } = catalogData;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CatalogScrollRestoration />
      <Navbar />

      {/* Top Demand Showcase Banner (or Compact Search Banner) */}
      {search ? (
        <section className="border-b border-border bg-canvas-warm dark:bg-canvas-dark py-6">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-xl sm:text-2xl text-foreground">
                Search Results for {"\""}<span className="text-brand-blue">{search}</span>{"\""}
              </h1>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                Found {total} title{total === 1 ? "" : "s"} in collection
              </p>
            </div>
            <Link href="/catalog">
              <Button variant="outline" size="sm" className="rounded-full text-xs min-h-[40px] px-4">
                Clear Search
              </Button>
            </Link>
          </div>
        </section>
      ) : (
        <TopDemandShowcase books={topDemandBooks} />
      )}

      {/* Main Catalog View */}
      <main id="catalog-browse" className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <h2 className="sr-only">Catalog Filters & Book Listings</h2>

        {/* Interactive Filter & Sort Bar */}
        <CatalogFilterBar
          categories={categories}
          currentCategory={category}
          currentSearch={search}
          currentSort={sort}
        />

        {/* Books Grid with Suspense */}
        <Suspense fallback={<CatalogSkeleton count={12} />}>
          {books.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card space-y-4 max-w-lg mx-auto my-8">
              <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-lg text-foreground">
                  No Matching Titles Found
                </h3>
                <p className="text-sm text-muted-foreground">
                  We couldn&apos;t find any books matching your selected filters or search terms.
                </p>
              </div>
              <Link href="/catalog">
                <Button variant="outline" size="sm" className="rounded-full mt-2">
                  Clear All Filters
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              {books.map((book, idx) => (
                <BookCard key={book.id} book={book} priority={idx < 4} />
              ))}
            </div>
          )}
        </Suspense>

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
                    pathname: "/catalog",
                    query: {
                      ...(category !== "all" ? { category } : {}),
                      ...(search ? { search } : {}),
                      ...(sort !== "newest" ? { sort } : {}),
                      page: (page - 1).toString(),
                    },
                  }}
                >
                  <Button variant="outline" size="sm" className="rounded-full gap-1">
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled className="rounded-full gap-1">
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
              )}

              {page < totalPages ? (
                <Link
                  href={{
                    pathname: "/catalog",
                    query: {
                      ...(category !== "all" ? { category } : {}),
                      ...(search ? { search } : {}),
                      ...(sort !== "newest" ? { sort } : {}),
                      page: (page + 1).toString(),
                    },
                  }}
                >
                  <Button variant="outline" size="sm" className="rounded-full gap-1">
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled className="rounded-full gap-1">
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline bg-card py-6 text-center text-xs text-muted-foreground">
        <div className="container max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-brand-yellow" />
            <span className="font-bold text-foreground">ShelfSync Library</span>
          </div>
          <span>&copy; {new Date().getFullYear()} ShelfSync. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
