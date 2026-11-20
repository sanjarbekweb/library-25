"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CatalogBookItem } from "@/lib/services/book-service";
import { ImageWithLoader } from "@/components/shared/image-with-loader";

interface BookCardProps {
  book: CatalogBookItem;
  priority?: boolean;
}

export function BookCard({ book, priority = false }: BookCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.015 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="h-full"
    >
      <Link
        href={`/books/${book.id}`}
        aria-label={`View details for ${book.title}`}
        className="group flex flex-col h-full rounded-2xl bg-card hover:shadow-md transition-all duration-300 transform-gpu"
      >
        {/* Cover Image */}
        <div className="relative aspect-[3/4] w-full bg-muted rounded-2xl overflow-hidden">
          <ImageWithLoader
            src={book.coverImageUrl || ""}
            alt={`${book.title} by ${book.author}`}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        </div>

        {/* Title & Author */}
        <div className="pt-2.5 pb-2 px-1 space-y-0.5">
          <h3 className="font-display font-bold text-sm text-foreground line-clamp-1 group-hover:text-brand-blue transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {book.author}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

