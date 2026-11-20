"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { SearchHeader } from "@/components/modules/search/search-header";
import {
  ArrowUpDown,
  SlidersHorizontal,
  Check,
  X,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";

interface CatalogFilterBarProps {
  categories: string[];
  currentCategory?: string;
  currentSearch?: string;
  currentSort?: string;
}

export function CatalogFilterBar({
  categories,
  currentCategory = "all",
  currentSearch = "",
  currentSort = "newest",
}: CatalogFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [categorySearchQuery, setCategorySearchQuery] = useState("");

  const createQueryString = useCallback(
    (paramsToUpdate: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(paramsToUpdate).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      // Reset page on search or category filter change
      if (paramsToUpdate.page === undefined) {
        params.delete("page");
      }
      return params.toString();
    },
    [searchParams]
  );

  const updateFilters = (updates: Record<string, string | null>) => {
    const queryString = createQueryString(updates);
    startTransition(() => {
      router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, {
        scroll: false,
      });
    });
  };

  const isCategoryFiltered = Boolean(
    currentCategory && currentCategory !== "all"
  );

  // Filter categories inside dropdown if user searches
  const filteredCategoryList = categories.filter((cat) =>
    cat.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  const activeCategoryDisplayName = isCategoryFiltered
    ? categories.find(
        (c) => c.toLowerCase() === currentCategory.toLowerCase()
      ) || currentCategory
    : t("allCategories");

  return (
    <div className="space-y-3">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Typo-Tolerant Search Header */}
        <div id="catalog-search-bar" className="flex-1 max-w-xl">
          <SearchHeader
            initialValue={currentSearch}
            onSearchSubmit={(val) => updateFilters({ search: val || null })}
            placeholder={t("searchCatalogTypo")}
          />
        </div>

        {/* Filter and Sort Cluster */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Aesthetic Theme / Category Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-11 rounded-full px-4 text-xs font-semibold gap-2 border bg-card transition-all duration-200 cursor-pointer shadow-2xs hover:border-foreground/30",
                  isCategoryFiltered
                    ? "border-brand-blue/50 bg-brand-blue/10 text-brand-blue dark:text-blue-400 font-bold ring-2 ring-brand-blue/15"
                    : "border-border text-foreground hover:bg-accent"
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-[180px]">
                  {isCategoryFiltered ? activeCategoryDisplayName : t("filterTheme")}
                </span>
                {isCategoryFiltered && (
                  <span className="flex h-2 w-2 rounded-full bg-brand-blue shrink-0 animate-pulse" />
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-64 max-h-80 overflow-y-auto rounded-2xl p-1.5 shadow-xl border-border bg-card/95 backdrop-blur-md space-y-1"
            >
              <div className="px-2 py-1.5 flex items-center justify-between text-xs font-semibold text-muted-foreground border-b border-border/60">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-brand-yellow" />
                  <span>{t("filterTheme")}</span>
                </span>
                {isCategoryFiltered && (
                  <button
                    onClick={() => updateFilters({ category: "all" })}
                    className="text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {t("reset")}
                  </button>
                )}
              </div>

              {/* Quick Search inside Categories list if more than 5 */}
              {categories.length > 5 && (
                <div className="px-1 pt-1 pb-1">
                  <input
                    type="text"
                    placeholder={t("searchThemes")}
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-blue"
                  />
                </div>
              )}

              {/* All Categories Option */}
              <DropdownMenuItem
                onClick={() => {
                  setCategorySearchQuery("");
                  updateFilters({ category: "all" });
                }}
                className={cn(
                  "flex items-center justify-between text-xs py-2 px-2.5 rounded-xl cursor-pointer font-medium transition-colors",
                  !isCategoryFiltered
                    ? "bg-foreground text-background font-semibold"
                    : "text-foreground hover:bg-accent"
                )}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  <span>{t("allCategories")}</span>
                </div>
                {!isCategoryFiltered && <Check className="h-3.5 w-3.5 shrink-0" />}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-border/60 my-1" />

              {/* Category list */}
              {filteredCategoryList.length === 0 ? (
                <div className="p-3 text-center text-xs text-muted-foreground">
                  No themes match &quot;{categorySearchQuery}&quot;
                </div>
              ) : (
                filteredCategoryList.map((cat) => {
                  const isSelected =
                    currentCategory?.toLowerCase() === cat.toLowerCase();
                  return (
                    <DropdownMenuItem
                      key={cat}
                      onClick={() => {
                        setCategorySearchQuery("");
                        updateFilters({ category: cat });
                      }}
                      className={cn(
                        "flex items-center justify-between text-xs py-2 px-2.5 rounded-xl cursor-pointer font-medium transition-colors",
                        isSelected
                          ? "bg-foreground text-background font-semibold"
                          : "text-foreground hover:bg-accent"
                      )}
                    >
                      <span className="truncate">{cat}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </DropdownMenuItem>
                  );
                })
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Select Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="catalog-sort-select" className="sr-only">
              Sort by
            </label>
            <div className="relative flex items-center">
              <ArrowUpDown className="absolute left-3.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <select
                id="catalog-sort-select"
                aria-label="Sort catalog titles"
                value={currentSort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="h-11 rounded-full border border-border bg-card pl-9 pr-8 text-xs font-semibold text-foreground focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/15 transition-all duration-200 cursor-pointer hover:border-foreground/30 shadow-2xs appearance-none"
              >
                <option value="newest">{t("newest")}</option>
                <option value="rating">{t("ratingHigh")}</option>
                <option value="title-asc">{t("titleAsc")}</option>
                <option value="title-desc">{t("titleDesc")}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Active Theme Filter Chip (Visible when a theme is selected) */}
      {isCategoryFiltered && (
        <div className="flex items-center gap-2 flex-wrap pt-0.5">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            Active Filter:
          </span>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-blue dark:text-blue-400 text-xs font-semibold shadow-2xs animate-in fade-in-50 zoom-in-95">
            <span>Theme: {activeCategoryDisplayName}</span>
            <button
              onClick={() => updateFilters({ category: "all" })}
              aria-label="Remove theme filter"
              className="p-0.5 rounded-full hover:bg-brand-blue/20 text-brand-blue dark:text-blue-400 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <button
            onClick={() => updateFilters({ category: "all" })}
            className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors ml-1"
          >
            Clear theme filter
          </button>
        </div>
      )}

      {isPending && (
        <div className="h-1 w-full bg-brand-yellow/30 overflow-hidden rounded-full">
          <div className="h-full bg-brand-yellow w-1/3 animate-pulse" />
        </div>
      )}
    </div>
  );
}
