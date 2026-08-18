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
      className="group flex flex-col h-full rounded-2xl border border-border bg-card overflow-hidden hover:border-foreground/20 hover:shadow-md transition-all duration-200"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full bg-muted overflow-hidden flex items-center justify-center">
        {book.coverImageUrl ? (
          <Image
            src={book.coverImageUrl}
            alt={book.title}
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
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-background/90 backdrop-blur text-foreground border border-border shadow-xs">
            {book.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Availability Badge */}
        <div className="mb-2">
          <CopyAvailabilityBadge
            availableCount={book.availableCopiesCount}
            totalCount={book.totalCopiesCount}
          />
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-base text-foreground line-clamp-1 group-hover:text-brand-blue transition-colors">
          {book.title}
        </h3>

        {/* Author & Year */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
          <span className="line-clamp-1">{book.author}</span>
          {book.publicationYear && (
            <span className="flex items-center gap-1 font-mono text-[11px] shrink-0">
              <Calendar className="h-3 w-3" />
              {book.publicationYear}
            </span>
          )}
        </div>

        {/* Description snippet */}
        {book.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
            {book.description}
          </p>
        )}

        {/* Footer Rating */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/60 text-xs">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-foreground">
              {book.averageRating ? book.averageRating.toFixed(1) : "New"}
            </span>
            {book.reviewsCount > 0 && (
              <span className="text-muted-foreground font-mono text-[11px]">
                ({book.reviewsCount})
              </span>
            )}
          </div>

          <span className="text-[11px] font-medium text-brand-blue group-hover:underline">
            View Details &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
