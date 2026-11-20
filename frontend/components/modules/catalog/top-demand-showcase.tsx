"use client";

import Link from "next/link";
import { CatalogBookItem } from "@/lib/services/book-service";
import { useLanguage } from "@/components/providers/language-provider";
import { BookCard } from "./book-card";

interface TopDemandShowcaseProps {
  books: CatalogBookItem[];
}

export function TopDemandShowcase({ books }: TopDemandShowcaseProps) {
  const { t } = useLanguage();

  if (!books || books.length === 0) return null;

  return (
    <section className="border-b border-border bg-canvas-warm dark:bg-canvas-dark py-6 sm:py-8">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display font-extrabold text-lg sm:text-xl text-foreground tracking-tight">
            {t("featuredBooks")}
          </h2>
          <Link
            href="/catalog"
            className="text-sm font-semibold text-brand-blue hover:underline transition-colors shrink-0"
          >
            {t("browseCatalog")} &rsaquo;
          </Link>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {books.map((book, idx) => (
            <BookCard key={book.id} book={book} priority={idx < 2} />
          ))}
        </div>
      </div>
    </section>
  );
}

