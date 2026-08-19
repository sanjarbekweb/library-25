"use client";

import Link from "next/link";
import Image from "next/image";
import { Flame, Star, BookOpen, ArrowRight, Clock } from "lucide-react";
import { CatalogBookItem } from "@/lib/services/book-service";
import { Button } from "@/components/ui/button";

interface TopDemandShowcaseProps {
  books: CatalogBookItem[];
}

export function TopDemandShowcase({ books }: TopDemandShowcaseProps) {
  if (!books || books.length === 0) return null;

  const handleScrollToCatalog = () => {
    const catalogElement = document.getElementById("catalog-browse");
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative border-b border-border bg-canvas-warm dark:bg-canvas-dark py-4 sm:py-5">
      {/* Dynamic Background Pattern Accent */}
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-4">
        {/* Compact Section Header Banner */}
        <div className="flex flex-row items-center justify-between gap-3 border-b border-border/50 pb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-yellow text-black text-[11px] font-bold tracking-tight shadow-xs">
              <Flame className="h-3.5 w-3.5 text-amber-600 fill-amber-500 animate-pulse" />
              <span>Top Demand Reads</span>
            </div>

            <h2 className="font-display font-extrabold text-base sm:text-lg text-foreground tracking-tight">
              Featured Library Books
            </h2>

            <span className="hidden md:inline-block text-xs text-muted-foreground">
              • Student favorites &amp; popular titles
            </span>
          </div>

          <div className="shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleScrollToCatalog}
              className="rounded-full font-semibold text-xs gap-1.5 border-border hover:bg-accent min-h-[34px] px-3.5 bg-background shadow-2xs cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5 text-brand-yellow" />
              <span>Browse Full Catalog</span>
            </Button>
          </div>
        </div>

        {/* Compact Top Demand Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {books.map((book, idx) => {
            const isAvailable = book.availableCopiesCount > 0;

            return (
              <div
                key={book.id}
                className="group relative bg-card border border-border hover:border-brand-yellow/60 hover:shadow-md transition-all duration-200 rounded-2xl p-3.5 flex flex-col justify-between space-y-2.5"
              >
                {/* Top Badge Overlay */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-block bg-accent text-foreground text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-border truncate max-w-[120px]">
                    {book.category}
                  </span>

                  {book.averageRating ? (
                    <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold px-1.5 py-0.5 rounded-full border border-amber-500/20">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{book.averageRating.toFixed(1)}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      New
                    </span>
                  )}
                </div>

                {/* Book Cover Container - Normal 3:4 aspect ratio */}
                <div className="relative aspect-[3/4] w-full rounded-xl bg-muted/60 overflow-hidden border border-border/50 shadow-2xs flex items-center justify-center">
                  {book.coverImageUrl ? (
                    <Image
                      src={book.coverImageUrl}
                      alt={`Cover image for top-demand book "${book.title}" by ${book.author}`}
                      fill
                      priority={idx < 2}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-center space-y-1.5 text-muted-foreground">
                      <BookOpen className="h-8 w-8 text-brand-yellow/80" />
                      <span className="text-[11px] font-medium line-clamp-2">
                        {book.title}
                      </span>
                    </div>
                  )}

                  {/* Hot Demand Ribbon */}
                  <div className="absolute top-1.5 left-1.5 bg-black/80 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-2xs">
                    <Flame className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
                    <span>Top Demand</span>
                  </div>
                </div>

                {/* Title & Author Info */}
                <div className="space-y-0.5 flex-1 flex flex-col justify-start">
                  <h3 className="font-display font-bold text-xs sm:text-sm text-foreground line-clamp-1 group-hover:text-brand-blue transition-colors leading-tight">
                    {book.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 font-medium">
                    by {book.author}
                  </p>
                </div>

                {/* Copy Availability Status & Action CTA */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1 text-foreground font-semibold bg-card px-2 py-0.5 rounded-full border-hairline text-[10px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
                        {book.availableCopiesCount} Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 text-[10px]">
                        <Clock className="h-2.5 w-2.5" />
                        On Hold
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
                      className="w-full rounded-full bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold text-[11px] gap-1 min-h-[34px] py-1 shadow-2xs"
                    >
                      <span>View Title {"&"} Reserve</span>
                      <ArrowRight className="h-3 w-3" />
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
