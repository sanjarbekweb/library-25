"use client";

import Link from "next/link";
import { Star, BookOpen } from "lucide-react";
import { CatalogBookItem } from "@/lib/services/book-service";
import { ImageWithLoader } from "@/components/shared/image-with-loader";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";

interface FeaturedBookPanelProps {
  book: CatalogBookItem | null;
}

export function FeaturedBookPanel({ book }: FeaturedBookPanelProps) {
  const { t } = useLanguage();

  if (!book) {
    return (
      <aside className="hidden xl:flex w-80 flex-col items-center justify-center p-6 bg-[#0B192C] text-white shrink-0 border-l border-white/10 text-center">
        <BookOpen className="h-10 w-10 text-white/30 mb-3" />
        <p className="text-sm font-semibold text-white/80">{t("selectAnyBook")}</p>
        <p className="text-xs text-white/50 mt-1">{t("clickBookToInspect")}</p>
      </aside>
    );
  }

  const ratingValue = book.averageRating ? book.averageRating.toFixed(1) : "4.8";
  const reviewsCount = book.reviewsCount || 110;
  const simulatedPages = book.isbn ? (parseInt(book.isbn.slice(-3), 10) || 320) : 320;

  return (
    <aside className="hidden xl:flex w-80 flex-col justify-between p-6 bg-[#0B192C] text-white shrink-0 border-l border-white/10 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-5">
        {/* 3D Elevated White Card for Cover */}
        <div className="relative mx-auto aspect-[3/4] w-48 rounded-2xl bg-white p-2.5 shadow-2xl shadow-black/50 overflow-hidden group">
          <div className="relative h-full w-full rounded-xl overflow-hidden bg-slate-100">
            <ImageWithLoader
              src={book.coverImageUrl || ""}
              alt={`Featured book cover for "${book.title}"`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="192px"
              priority
            />
          </div>
        </div>

        {/* Title & Author (Preserved as dynamic domain metadata) */}
        <div className="text-center space-y-1">
          <h3 className="font-display font-bold text-lg text-white line-clamp-2 leading-tight">
            {book.title}
          </h3>
          <p className="text-xs text-slate-400 font-medium">{book.author}</p>
        </div>

        {/* Star Rating */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="h-3.5 w-3.5 fill-brand-blue text-brand-blue" />
          ))}
          <span className="text-xs font-bold text-white ml-1">{ratingValue}</span>
        </div>

        {/* Book Spec Telemetry Counters */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 text-center">
          <div className="space-y-0.5">
            <span className="text-sm font-bold text-white block">{simulatedPages}</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">{t("pages")}</span>
          </div>
          <div className="space-y-0.5 border-x border-white/10">
            <span className="text-sm font-bold text-white block">{book.availableCopiesCount * 30 + 120}</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Score</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-sm font-bold text-white block">{reviewsCount}</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">{t("reviews")}</span>
          </div>
        </div>

        {/* Description / Synopsis Snippet */}
        <div className="space-y-1 text-center">
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-4 italic">
            {book.description ||
              `A compelling exploration of ${book.category.toLowerCase()} literature by ${book.author}, offering fresh insights, structured narrative, and essential reading.`}
          </p>
        </div>
      </div>

      {/* Action CTA Button */}
      <div className="pt-4">
        <Link href={`/books/${book.id}`} className="block w-full">
          <Button className="w-full h-11 rounded-2xl bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold text-xs shadow-lg shadow-brand-blue/30 gap-2 transition-all cursor-pointer">
            <BookOpen className="h-4 w-4" />
            <span>{t("viewTitle")}</span>
          </Button>
        </Link>
      </div>
    </aside>
  );
}
