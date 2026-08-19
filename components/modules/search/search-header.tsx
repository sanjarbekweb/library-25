"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2, BookOpen, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BookSearchDocument } from "@/lib/search/client";

interface SearchApiResponse {
  ok: boolean;
  data?: {
    hits: BookSearchDocument[];
    totalHits: number;
    query: string;
    processingTimeMs: number;
    source: "meilisearch" | "postgres_fallback";
  };
  error?: {
    code: string;
    message: string;
  };
}

interface SearchHeaderProps {
  className?: string;
  placeholder?: string;
  initialValue?: string;
  onSearchSubmit?: (query: string) => void;
}

export function SearchHeader({
  className,
  placeholder = "Search books by title, author, or ISBN (typo-tolerant)...",
  initialValue = "",
  onSearchSubmit,
}: SearchHeaderProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(initialValue);
    setDebouncedQuery(initialValue);
  }, [initialValue]);


  // Debounce query string change by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // TanStack React Query calling /api/search
  const { data, isLoading, isError } = useQuery<SearchApiResponse>({
    queryKey: ["search-catalog", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return { ok: true, data: { hits: [], totalHits: 0, query: "", processingTimeMs: 0, source: "meilisearch" } };
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=6`);
      if (!res.ok) throw new Error("Search request failed");
      return res.json();
    },
    enabled: debouncedQuery.length > 0,
  });

  const hits = data?.data?.hits ?? [];
  const totalHits = data?.data?.totalHits ?? 0;
  const source = data?.data?.source;

  const handleInputFocus = () => {
    if (searchTerm.trim().length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val.trim().length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(searchTerm);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setDebouncedQuery("");
    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit("");
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-xl", className)}>
      <form onSubmit={handleFormSubmit} className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          aria-label="Search catalog with typo-tolerance"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="pl-10 pr-9 h-11 rounded-full border-border bg-card shadow-2xs focus-visible:ring-brand-blue font-medium"
        />
        {searchTerm ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </form>

      {/* Instant Search Results Dropdown */}
      {isOpen && debouncedQuery.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-border bg-card/98 backdrop-blur-md shadow-2xl overflow-hidden p-2 space-y-1 animate-in fade-in-50 zoom-in-95">
          {/* Header metadata pill */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/60 text-[11px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-brand-yellow" />
              <span>
                {source === "meilisearch"
                  ? "Meilisearch Search Engine"
                  : "Typo-Tolerant Search Engine"}
              </span>
            </span>
            {isLoading ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin text-brand-blue" />
                Searching...
              </span>
            ) : (
              <span>{totalHits} match{totalHits === 1 ? "" : "es"}</span>
            )}
          </div>

          {/* Results list */}
          {isLoading ? (
            <div className="p-6 text-center space-y-2">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-brand-blue" />
              <p className="text-xs text-muted-foreground font-mono">
                Searching collection index...
              </p>
            </div>
          ) : isError ? (
            <div className="p-4 text-center text-xs text-destructive flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Failed to fetch search results</span>
            </div>
          ) : hits.length === 0 ? (
            <div className="p-6 text-center space-y-2">
              <BookOpen className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <p className="text-sm font-display font-medium text-foreground">
                No matching titles found
              </p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Try searching for keywords like title, author name, or category.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {hits.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/80 transition-colors group"
                >
                  {/* Thumbnail Cover */}
                  <div className="relative h-12 w-9 rounded-md bg-muted overflow-hidden shrink-0 border border-border shadow-2xs">
                    {book.coverImageUrl ? (
                      <Image
                        src={book.coverImageUrl}
                        alt={book.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="36px"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-brand-yellow/20 text-brand-yellow">
                        <BookOpen className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  {/* Book Metadata */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-display font-bold text-foreground truncate group-hover:text-brand-blue transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      by {book.author}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-accent text-foreground border border-border">
                      {book.category}
                    </span>
                    {book.availableCopiesCount > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-card text-foreground border-hairline shadow-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
                        {book.availableCopiesCount} Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        0 Available
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Footer View All link */}
          {!isLoading && hits.length > 0 && (
            <div className="pt-1 text-center border-t border-border/60">
              <Link
                href={`/?search=${encodeURIComponent(debouncedQuery)}`}
                onClick={() => setIsOpen(false)}
                className="block py-1.5 text-xs font-semibold text-brand-blue hover:underline"
              >
                View all results in main catalog &rarr;
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
