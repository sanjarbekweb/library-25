"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2, BookOpen, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BookSearchDocument } from "@/lib/search/client";
import { useLanguage } from "@/components/providers/language-provider";
import { ImageWithLoader } from "@/components/shared/image-with-loader";

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
  autoFocus?: boolean;
}

export function SearchHeader({
  className,
  placeholder,
  initialValue = "",
  onSearchSubmit,
  autoFocus = false,
}: SearchHeaderProps) {
  const { t } = useLanguage();
  const effectivePlaceholder = placeholder || t("searchPlaceholder");
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
      <form onSubmit={handleFormSubmit} className="relative group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand-blue group-focus-within:scale-110 transition-all duration-200" />
        <Input
          type="text"
          placeholder={effectivePlaceholder}
          aria-label="Search catalog with typo-tolerance"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          autoFocus={autoFocus}
          className="pl-10 pr-9 h-11 rounded-full border-border bg-card/90 shadow-xs font-medium focus-visible:border-brand-blue focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-brand-blue/15 transition-all duration-200"
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
      <AnimatePresence>
        {isOpen && debouncedQuery.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            data-lenis-prevent="true"
            data-lenis-prevent-touch="true"
            className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-border bg-card/98 backdrop-blur-md shadow-2xl max-h-[75vh] overflow-y-auto overscroll-contain p-2 space-y-1"
          >
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
                <Loader2 className="h-6 w-6 animate-spin text-brand-blue mx-auto" />
                <p className="text-xs text-muted-foreground font-mono">
                  Searching collection...
                </p>
              </div>
            ) : isError ? (
              <div className="p-4 text-center text-xs text-destructive flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>Failed to fetch search results</span>
              </div>
            ) : hits.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <AlertCircle className="h-6 w-6 text-muted-foreground/60 mx-auto" />
                <p className="text-xs font-semibold text-foreground">
                  No books found for &quot;{debouncedQuery}&quot;
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Try checking spelling or search by category name
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {hits.map((book) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center gap-3 p-2 rounded-xl hover:bg-accent/70 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-12 w-9 rounded-md bg-muted overflow-hidden shrink-0 border border-border/40">
                      <ImageWithLoader
                        src={book.coverImageUrl || ""}
                        alt={`Cover thumbnail for search result "${book.title}"`}
                        fill
                        className="object-cover group-hover:scale-[1.02] transition-transform"
                        sizes="36px"
                      />
                    </div>

                    {/* Book Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-foreground truncate group-hover:text-brand-blue transition-colors">
                          {book.title}
                        </h4>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-accent text-foreground border border-border shrink-0">
                          {book.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        by {book.author}
                      </p>
                    </div>

                    {/* Availability status dot */}
                    <div className="shrink-0">
                      {book.availableCopiesCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" />
                          Avail
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">
                          On Hold
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
                  href={`/catalog?search=${encodeURIComponent(debouncedQuery)}`}
                  onClick={() => setIsOpen(false)}
                  className="block py-1.5 text-xs font-semibold text-brand-blue hover:underline"
                >
                  {t("viewAllResults")}
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
