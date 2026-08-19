import Link from "next/link";
import Image from "next/image";
import { Star, BookOpen, Calendar } from "lucide-react";
import { CatalogBookItem } from "@/lib/services/book-service";
import { CopyAvailabilityBadge } from "./copy-availability-badge";

interface BookCardProps {
  book: CatalogBookItem;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link
      href={`/books/${book.id}`}
      aria-label={`View details for ${book.title}`}
      className="group flex flex-col h-full rounded-2xl border border-border bg-card overflow-hidden hover:border-foreground/20 hover:shadow-md transition-all duration-200"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full bg-muted overflow-hidden flex items-center justify-center">
        {book.coverImageUrl ? (
          <Image
            src={book.coverImageUrl}
            alt={`Book cover image for "${book.title}" by ${book.author}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center h-full w-full bg-gradient-to-br from-amber-500/10 via-brand-yellow/10 to-blue-500/10">
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-display font-semibold text-sm line-clamp-2 text-foreground/80">
              {book.title}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              {book.author}
            </span>
          </div>
        )}

        {/* Category Pill Tag Overlay */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-background/90 backdrop-blur text-foreground border border-border shadow-xs">
            {book.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 sm:p-4">
        {/* Availability Badge */}
        <div className="mb-2">
          <CopyAvailabilityBadge
            availableCount={book.availableCopiesCount}
            totalCount={book.totalCopiesCount}
            nextAvailableDate={book.nextAvailableDate}
            className="text-[10px] sm:text-xs px-2 py-0.5"
          />
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-xs sm:text-base text-foreground line-clamp-2 sm:line-clamp-1 group-hover:text-brand-blue transition-colors">
          {book.title}
        </h3>

        {/* Author & Year */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground mt-1 gap-1">
          <span className="line-clamp-1">{book.author}</span>
          {book.publicationYear && (
            <span className="hidden sm:flex items-center gap-1 font-mono text-[11px] shrink-0">
              <Calendar className="h-3 w-3" />
              {book.publicationYear}
            </span>
          )}
        </div>

        {/* Description snippet */}
        {book.description && (
          <p className="hidden sm:block text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
            {book.description}
          </p>
        )}

        {/* Footer Rating */}
        <div className="mt-auto pt-2.5 sm:pt-3 flex items-center justify-between border-t border-border/60 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span className="font-semibold text-foreground">
              {book.averageRating ? book.averageRating.toFixed(1) : "New"}
            </span>
            {book.reviewsCount > 0 && (
              <span className="text-muted-foreground font-mono text-[10px] sm:text-[11px]">
                ({book.reviewsCount})
              </span>
            )}
          </div>

          <span className="text-[10px] sm:text-[11px] font-medium text-brand-blue group-hover:underline shrink-0">
            Details &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
