"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Barcode,
  Building2,
} from "lucide-react";
import { BookDetails } from "@/lib/services/book-service";
import { ReserveButton } from "./reserve-button";
import { CopyAvailabilityBadge } from "@/components/modules/catalog/copy-availability-badge";
import { ReviewsList } from "./reviews-list";
import { ImageWithLoader } from "@/components/shared/image-with-loader";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";

interface BookDetailViewProps {
  book: BookDetails;
  isSignedIn?: boolean;
  existingReservationId?: string | null;
  eligibleLoanIdForFeedback?: string | null;
}

export function BookDetailView({
  book,
  isSignedIn = false,
  existingReservationId,
  eligibleLoanIdForFeedback,
}: BookDetailViewProps) {
  const { t, language } = useLanguage();
  const isAvailable = book.copyBreakdown.available > 0;

  const authorPrefix = language === "uz" ? "Muallif:" : language === "ru" ? "Автор:" : "By";
  const deskPickupNote = language === "uz"
    ? "Kutubxona ish vaqtida ijara stolidan olib ketish mumkin."
    : language === "ru"
    ? "Самовывоз на стойке выдачи в рабочие часы библиотеки."
    : "In-person pickup available at Circulation Desk during library hours.";

  const nextScheduleTitle = language === "uz"
    ? "Kutilayotgan qaytarish va keyingi mavjudlik jadvali"
    : language === "ru"
    ? "Ожидаемый возврат и график доступности"
    : "Expected Return & Next Availability Schedule";

  return (
    <div className="space-y-8 pb-12">
      {/* Back to Catalog */}
      <div>
        <Link href="/catalog">
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full w-9 h-9 border border-border hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer shadow-2xs"
            title={t("backToCatalog")}
            aria-label={t("backToCatalog")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Main Hero Card */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 md:p-8">
          {/* Left Column: Cover Showcase */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center">
            <div className="relative aspect-[3/4] w-full max-w-[260px] rounded-2xl bg-muted overflow-hidden border border-border shadow-md">
              <ImageWithLoader
                src={book.coverImageUrl || ""}
                alt={`Cover image of "${book.title}" by ${book.author}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover"
              />
            </div>

            {/* Quick Status Pill under image */}
            <div className="mt-4 w-full max-w-[260px] flex justify-center">
              <CopyAvailabilityBadge
                availableCount={book.copyBreakdown.available}
                totalCount={book.copyBreakdown.total}
                className="py-1 px-3 text-xs"
              />
            </div>
          </div>

          {/* Right Column: Metadata & Actions */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category Badge & ISBN */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                  {book.category}
                </span>
                {book.isbn && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground px-2.5 py-0.5 rounded-full bg-muted border border-border">
                    <Barcode className="h-3.5 w-3.5" />
                    ISBN: {book.isbn}
                  </span>
                )}
                {book.publicationYear && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground px-2.5 py-0.5 rounded-full bg-muted border border-border">
                    <Calendar className="h-3.5 w-3.5" />
                    {book.publicationYear}
                  </span>
                )}
              </div>

              {/* Title & Author */}
              <div>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-foreground tracking-tight">
                  {book.title}
                </h1>
                <p className="text-base sm:text-lg font-medium text-muted-foreground mt-1">
                  {authorPrefix} <span className="text-foreground">{book.author}</span>
                </p>
              </div>

              {book.description ? (
                <div className="prose prose-sm dark:prose-invert text-muted-foreground leading-relaxed pt-2">
                  {book.description}
                </div>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  {t("noReviewsYet")}
                </p>
              )}

              {/* Next Availability Schedule Banner */}
              {!isAvailable && book.nextAvailableDate && (
                <div className="p-4 rounded-2xl border border-brand-blue/30 bg-brand-blue/5 text-foreground text-xs sm:text-sm flex items-center gap-3 shadow-2xs">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-white font-bold shadow-xs">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold font-display text-foreground">
                      {nextScheduleTitle}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(book.nextAvailableDate), "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <ReserveButton
                bookId={book.id}
                bookTitle={book.title}
                availableCopiesCount={book.copyBreakdown.available}
                existingReservationId={existingReservationId}
                isSignedIn={isSignedIn}
              />

              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium px-3 py-2 rounded-xl bg-muted/50 border border-border/50">
                <Building2 className="h-4 w-4 text-brand-blue shrink-0" />
                <span>{deskPickupNote}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Inventory Status Bar */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl border border-border bg-card shadow-2xs text-xs">
        <span className="font-semibold text-foreground px-2 py-1">{t("inventorySummary")}:</span>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-muted text-foreground">
          <span className="text-muted-foreground">{t("totalCopies")}:</span>
          <span className="font-bold">{book.copyBreakdown.total}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
          <span className="font-medium">{t("availableCopies")}:</span>
          <span className="font-bold">{book.copyBreakdown.available}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-muted text-muted-foreground">
          <span>{t("reservedCopies")}:</span>
          <span className="font-semibold text-foreground">{book.copyBreakdown.reserved}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-muted text-muted-foreground">
          <span>{t("borrowedCopies")}:</span>
          <span className="font-semibold text-foreground">{book.copyBreakdown.borrowed}</span>
        </div>
        {book.copyBreakdown.maintenance > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-muted text-muted-foreground">
            <span>{t("maintenanceCopies")}:</span>
            <span className="font-semibold text-foreground">{book.copyBreakdown.maintenance}</span>
          </div>
        )}
      </div>

      {/* Verified Student Reviews */}
      <ReviewsList
        feedbacks={book.feedbacks}
        averageRating={book.averageRating}
        totalReviews={book.totalReviews}
        ratingDistribution={book.ratingDistribution}
        eligibleLoanId={eligibleLoanIdForFeedback}
        bookId={book.id}
        bookTitle={book.title}
        bookAuthor={book.author}
        isSignedIn={isSignedIn}
      />
    </div>
  );
}
