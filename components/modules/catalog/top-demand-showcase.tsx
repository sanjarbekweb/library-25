import Link from "next/link";
import Image from "next/image";
import { Flame, Star, BookOpen, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { CatalogBookItem } from "@/lib/services/book-service";
import { Button } from "@/components/ui/button";

interface TopDemandShowcaseProps {
  books: CatalogBookItem[];
}

export function TopDemandShowcase({ books }: TopDemandShowcaseProps) {
  if (!books || books.length === 0) return null;

  return (
    <section className="relative border-b border-border bg-canvas-warm dark:bg-canvas-dark py-10 md:py-14">
      {/* Dynamic Background Pattern Accent */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-8">
        {/* Section Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-yellow text-black text-xs font-bold tracking-tight shadow-xs">
              <Flame className="h-4 w-4 text-amber-600 fill-amber-500 animate-pulse" />
              <span>Top Demand {"&"} Recommended Reads</span>
            </div>

            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-foreground tracking-tight">
              Featured Library Books
            </h2>

            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Discover popular titles, student favorites, and highly requested physical copies available in our school collection.
            </p>
          </div>

          <div className="shrink-0">
            <Link href="#catalog-browse">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full font-semibold text-xs gap-2 border-border hover:bg-accent min-h-[40px] px-5 bg-background shadow-xs"
              >
                <BookOpen className="h-4 w-4 text-brand-yellow" />
                <span>Browse Full Catalog</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Top Demand Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {books.map((book, idx) => {
            const isAvailable = book.availableCopiesCount > 0;

            return (
              <div
                key={book.id}
                className="group relative bg-card border border-border hover:border-brand-yellow/60 hover:shadow-xl transition-all duration-300 rounded-3xl p-5 flex flex-col justify-between space-y-4"
              >
                {/* Top Badge Overlay */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-block bg-accent text-foreground text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-border truncate max-w-[140px]">
                    {book.category}
                  </span>

                  {book.averageRating ? (
                    <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{book.averageRating.toFixed(1)}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      New Arrival
                    </span>
                  )}
                </div>

                {/* Book Cover Container with guaranteed explicit height */}
                <div className="relative h-56 sm:h-64 w-full rounded-2xl bg-muted/60 overflow-hidden border border-border/50 shadow-xs flex items-center justify-center group-hover:shadow-md transition-shadow">
                  {book.coverImageUrl ? (
                    <Image
                      src={book.coverImageUrl}
                      alt={`Cover image for top-demand book "${book.title}" by ${book.author}`}
                      fill
                      priority={idx < 2}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center space-y-2 text-muted-foreground">
                      <BookOpen className="h-10 w-10 text-brand-yellow/80" />
                      <span className="text-[11px] font-medium line-clamp-2">
                        {book.title}
                      </span>
                    </div>
                  )}

                  {/* Hot Demand Ribbon */}
                  <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                    <Flame className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span>Top Demand</span>
                  </div>
                </div>

                {/* Title & Author Info */}
                <div className="space-y-1.5 flex-1 flex flex-col justify-start">
                  <h3 className="font-display font-bold text-base text-foreground line-clamp-2 group-hover:text-brand-blue transition-colors leading-tight">
                    {book.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 font-medium">
                    by {book.author}
                  </p>
                </div>

                {/* Copy Availability Status & Action CTA */}
                <div className="space-y-3 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between text-xs font-mono">
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1.5 text-foreground font-semibold bg-card px-2.5 py-0.5 rounded-full border-hairline shadow-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
                        {book.availableCopiesCount} Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        <Clock className="h-3 w-3" />
                        On Hold / Borrowed
                      </span>
                    )}

                    <span className="text-[10px] text-muted-foreground">
                      {book.totalCopiesCount} Cop{book.totalCopiesCount === 1 ? "y" : "ies"}
                    </span>
                  </div>

                  <Link
                    href={`/books/${book.id}`}
                    className="block"
                    aria-label={`View details and reserve ${book.title}`}
                  >
                    <Button
                      size="sm"
                      className="w-full rounded-full bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold text-xs gap-1.5 min-h-[40px] shadow-xs"
                    >
                      <span>View Title {"&"} Reserve</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
