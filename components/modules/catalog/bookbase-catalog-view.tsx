"use client";

import Link from "next/link";
import { ChevronRight, AlertCircle, ChevronLeft } from "lucide-react";
import { CatalogBookItem } from "@/lib/services/book-service";
import { AppShellLayout } from "@/components/shared/app-shell-layout";
import { ImageWithLoader } from "@/components/shared/image-with-loader";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

interface BookbaseCatalogViewProps {
  recommendedBooks: CatalogBookItem[];
  categoryBooks: CatalogBookItem[];
  categories: string[];
  currentCategory: string;
  currentSearch: string;
  currentSort: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export function BookbaseCatalogView({
  recommendedBooks,
  categoryBooks,
  categories,
  currentCategory,
  currentSearch,
  currentPage,
  totalPages,
  totalCount,
}: BookbaseCatalogViewProps) {
  const { t, language } = useLanguage();

  const recommendedLabel = language === "uz" ? "Tavsiya etilganlar" : language === "ru" ? "Рекомендуем" : "Recommended";
  const seeAllLabel = language === "uz" ? "Barchasi" : language === "ru" ? "Все" : "See All";
  const categoriesLabel = language === "uz" ? "Turkumlar" : language === "ru" ? "Категории" : "Categories";
  const searchResultsLabel = language === "uz" ? `"${currentSearch}" bo'yicha natijalar` : language === "ru" ? `Результаты поиска для "${currentSearch}"` : `Search Results for "${currentSearch}"`;
  const clearFilterLabel = language === "uz" ? "Filterni tozalash" : language === "ru" ? "Сбросить поиск" : "Clear Search Filter";
  const allPillLabel = language === "uz" ? "Barchasi" : language === "ru" ? "Все" : "All";
  const prevLabel = language === "uz" ? "Oldingi" : language === "ru" ? "Назад" : "Prev";
  const nextLabel = language === "uz" ? "Keyingi" : language === "ru" ? "Вперед" : "Next";

  return (
    <AppShellLayout>
      <div className="space-y-6">
        {/* SECTION 1: RECOMMENDED BOOKS WIDGET */}
        {!currentSearch && recommendedBooks.length > 0 && (
          <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-foreground">
                {recommendedLabel}
              </h2>
              <Link
                href="/catalog?category=all"
                className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-0.5"
              >
                <span>{seeAllLabel}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Recommended Row / Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendedBooks.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="group cursor-pointer rounded-2xl p-2 transition-all duration-200 hover:bg-accent/40 block"
                >
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-muted shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
                    <ImageWithLoader
                      src={book.coverImageUrl || ""}
                      alt={`Cover image for ${book.title}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    />
                  </div>
                  <div className="pt-2.5 space-y-0.5">
                    <h4 className="font-display font-bold text-xs text-foreground line-clamp-1 group-hover:text-brand-blue transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {book.author}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: CATEGORIES & CATALOG GRID WIDGET */}
        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-display font-bold text-lg text-foreground">
              {currentSearch ? searchResultsLabel : categoriesLabel}
            </h2>

            {currentSearch && (
              <Link href="/catalog">
                <Button variant="outline" size="sm" className="rounded-full text-xs">
                  {clearFilterLabel}
                </Button>
              </Link>
            )}
          </div>

          {/* Category Filter Pills */}
          {!currentSearch && (
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/catalog?category=all"
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200",
                  currentCategory === "all" || !currentCategory
                    ? "bg-brand-blue text-white shadow-sm shadow-brand-blue/20"
                    : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {allPillLabel}
              </Link>

              {categories.map((cat) => {
                const isActive = currentCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <Link
                    key={cat}
                    href={`/catalog?category=${encodeURIComponent(cat)}`}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200",
                      isActive
                        ? "bg-brand-blue text-white shadow-sm shadow-brand-blue/20"
                        : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {cat}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Books Grid */}
          {categoryBooks.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground/60" />
              <h3 className="font-display font-bold text-base text-foreground">{t("noBooksFound")}</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {t("noBooksFoundSubtitle")}
              </p>
              <Link href="/catalog">
                <Button variant="outline" size="sm" className="rounded-full text-xs mt-2">
                  {t("allCategories")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {categoryBooks.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="group cursor-pointer rounded-2xl p-2 transition-all duration-200 hover:bg-accent/40 block"
                >
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-muted shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
                    <ImageWithLoader
                      src={book.coverImageUrl || ""}
                      alt={`Cover image for ${book.title}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    />
                  </div>
                  <div className="pt-2 space-y-0.5">
                    <h4 className="font-display font-bold text-xs text-foreground line-clamp-1 group-hover:text-brand-blue transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {book.author}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground">{currentPage}</span> /{" "}
                <span className="font-semibold text-foreground">{totalPages}</span> ({totalCount} {language === "uz" ? "ta kitob" : language === "ru" ? "книг" : "books"})
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  asChild={currentPage > 1}
                  className="rounded-full text-xs h-8 px-3 gap-1"
                >
                  {currentPage > 1 ? (
                    <Link
                      href={`/catalog?page=${currentPage - 1}${
                        currentCategory !== "all" ? `&category=${encodeURIComponent(currentCategory)}` : ""
                      }${currentSearch ? `&search=${encodeURIComponent(currentSearch)}` : ""}`}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>{prevLabel}</span>
                    </Link>
                  ) : (
                    <span>
                      <ChevronLeft className="h-3.5 w-3.5 mr-1 inline" />
                      {prevLabel}
                    </span>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  asChild={currentPage < totalPages}
                  className="rounded-full text-xs h-8 px-3 gap-1"
                >
                  {currentPage < totalPages ? (
                    <Link
                      href={`/catalog?page=${currentPage + 1}${
                        currentCategory !== "all" ? `&category=${encodeURIComponent(currentCategory)}` : ""
                      }${currentSearch ? `&search=${encodeURIComponent(currentSearch)}` : ""}`}
                    >
                      <span>{nextLabel}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <span>
                      {nextLabel}
                      <ChevronRight className="h-3.5 w-3.5 ml-1 inline" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShellLayout>
  );
}
