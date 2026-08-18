import Link from "next/link";
import { Suspense } from "react";
import { BookOpen, Sparkles, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { getCatalogBooks, getCategories } from "@/lib/services/book-service";
import { syncCurrentAuthenticatedUser } from "@/lib/services/user-service";
import { Navbar } from "@/components/shared/navbar";
import { BookCard } from "@/components/modules/catalog/book-card";
import { CatalogFilterBar } from "@/components/modules/catalog/catalog-filter-bar";
import { CatalogSkeleton } from "@/components/modules/catalog/catalog-skeleton";
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

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const category = params.category || "all";
  const search = params.search || "";
  const sort = (params.sort || "newest") as
    | "title-asc"
    | "title-desc"
    | "newest"
    | "rating";

  const [, categories, catalogData] = await Promise.all([
    syncCurrentAuthenticatedUser(),
    getCategories(),
    getCatalogBooks({ category, search, sort, page, limit: 12 }),
  ]);

  const { books, total, totalPages } = catalogData;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Header Canvas or Compact Search Banner */}
      {search ? (
        <section className="border-b border-border bg-canvas-warm dark:bg-canvas-dark py-6">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-xl sm:text-2xl text-foreground">
                Search Results for &ldquo;<span className="text-brand-blue">{search}</span>&rdquo;
              </h1>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                Found {total} title{total === 1 ? "" : "s"} in collection
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="rounded-full text-xs">
                Clear Search
              </Button>
            </Link>
          </div>
        </section>
      ) : (
        <section className="relative border-b border-border bg-canvas-warm dark:bg-canvas-dark py-12 md:py-16 bg-grid-pattern">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow text-black text-xs font-bold tracking-tight shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>School Library Catalog</span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-tight text-foreground max-w-3xl mx-auto">
              Discover &amp; Reserve Physical Books with <span className="underline decoration-brand-yellow decoration-4 underline-offset-4">Real-Time Inventory</span>
            </h1>

            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Browse our school library catalog, filter by subject categories, view live physical copy status, and hold books for in-person pickup.
            </p>

            <div className="pt-2 flex items-center justify-center gap-4 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {total} Book{total === 1 ? "" : "s"} In Collection
              </span>
              <span>&bull;</span>
              <span>{categories.length} Categories</span>
            </div>
          </div>
        </section>
      )}

      {/* Main Catalog View */}
      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
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
              <Link href="/">
                <Button variant="outline" size="sm" className="rounded-full mt-2">
                  Clear All Filters
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
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
                    pathname: "/",
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
                    pathname: "/",
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
      <footer className="border-t border-border bg-card py-6 text-center text-xs text-muted-foreground">
        <div className="container max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-brand-yellow" />
            <span className="font-bold text-foreground">ShelfSync Platform</span>
          </div>
          <span>&copy; {new Date().getFullYear()} School Library System. Spec-Driven Architecture.</span>
        </div>
      </footer>
    </div>
  );
}
