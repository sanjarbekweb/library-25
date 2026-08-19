"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { SearchHeader } from "@/components/modules/search/search-header";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const [isPending, startTransition] = useTransition();

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

  return (
    <div className="space-y-4">
      {/* Top Controls: Search Input & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Typo-Tolerant Search Header with Instant Dropdown */}
        <div id="catalog-search-bar" className="flex-1 max-w-md">
          <SearchHeader
            initialValue={currentSearch}
            onSearchSubmit={(val) => updateFilters({ search: val || null })}
            placeholder="Search by title, author, or ISBN (typo-tolerant)..."
          />
        </div>

        {/* Sort Select Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="catalog-sort-select" className="sr-only">
            Sort by
          </label>
          <ArrowUpDown className="h-4 w-4 text-muted-foreground hidden sm:inline" />
          <select
            id="catalog-sort-select"
            aria-label="Sort catalog titles"
            value={currentSort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="h-11 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="rating">Highest Rated</option>
            <option value="title-asc">Title: A to Z</option>
            <option value="title-desc">Title: Z to A</option>
          </select>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 mr-1 hidden md:inline">
          Categories:
        </span>
        <button
          onClick={() => updateFilters({ category: "all" })}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border",
            currentCategory === "all" || !currentCategory
              ? "bg-foreground text-background border-foreground shadow-2xs"
              : "bg-card text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
          )}
        >
          All Categories
        </button>

        {categories.map((cat) => {
          const isSelected =
            currentCategory?.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              onClick={() => updateFilters({ category: cat })}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border",
                isSelected
                  ? "bg-foreground text-background border-foreground shadow-2xs"
                  : "bg-card text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {isPending && (
        <div className="h-1 w-full bg-brand-yellow/30 overflow-hidden rounded-full">
          <div className="h-full bg-brand-yellow w-1/3 animate-pulse" />
        </div>
      )}
    </div>
  );
}
