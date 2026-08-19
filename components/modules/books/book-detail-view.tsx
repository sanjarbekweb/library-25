import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Barcode,
  Layers,
  BookmarkCheck,
  Building2,
  Clock,
} from "lucide-react";
import { BookDetails } from "@/lib/services/book-service";
import { ReserveButton } from "./reserve-button";
import { CopyAvailabilityBadge } from "@/components/modules/catalog/copy-availability-badge";
import { ReviewsList } from "./reviews-list";
import { Button } from "@/components/ui/button";

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
  const isAvailable = book.copyBreakdown.available > 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Back to Catalog */}
      <div>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Catalog
        </Link>
      </div>

      {/* Main Hero Card */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 md:p-8">
          {/* Left Column: Cover Showcase */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center">
            <div className="relative aspect-[3/4] w-full max-w-[260px] rounded-2xl bg-muted overflow-hidden border border-border shadow-md">
              {book.coverImageUrl ? (
                <Image
                  src={book.coverImageUrl}
                  alt={`Cover image of "${book.title}" by ${book.author}`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center h-full w-full bg-gradient-to-br from-amber-500/10 via-brand-yellow/10 to-blue-500/10">
                  <BookOpen className="h-16 w-16 text-muted-foreground/40 mb-4" />
                  <span className="font-display font-semibold text-base text-foreground/80">
                    {book.title}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {book.author}
                  </span>
                </div>
              )}
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
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground px-2.5 py-0.5 rounded-full bg-muted border border-border">
                    <Barcode className="h-3.5 w-3.5" />
                    ISBN: {book.isbn}
                  </span>
                )}
                {book.publicationYear && (
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground px-2.5 py-0.5 rounded-full bg-muted border border-border">
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
                  By <span className="text-foreground">{book.author}</span>
                </p>
              </div>

              {book.description ? (
                <div className="prose prose-sm dark:prose-invert text-muted-foreground leading-relaxed pt-2">
                  {book.description}
                </div>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  No synopsis available for this title.
                </p>
              )}

              {/* Next Availability Schedule Banner */}
              {!isAvailable && book.nextAvailableDate && (
                <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50/70 text-amber-950 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200 text-xs sm:text-sm flex items-center gap-3 shadow-xs">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white font-bold shadow-xs">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold font-display text-amber-950 dark:text-amber-200">
                      Expected Return & Next Availability Schedule
                    </p>
                    <p className="text-xs text-amber-900/80 dark:text-amber-300 mt-0.5 font-mono">
                      Earliest physical copy is scheduled to be available on <strong>{format(new Date(book.nextAvailableDate), "EEEE, MMMM d, yyyy")}</strong>
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
                <span>
                  In-person pickup available at Circulation Desk during library hours.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copy Inventory Telemetry Breakdown Grid */}
      <div className="space-y-3">
        <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
          <Layers className="h-5 w-5 text-brand-yellow" />
          Physical Inventory & Copy Telemetry
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4 flex flex-col items-center text-center">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Copies
            </span>
            <span className="font-mono text-2xl font-bold text-foreground mt-1">
              {book.copyBreakdown.total}
            </span>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-col items-center text-center">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Available
            </span>
            <span className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {book.copyBreakdown.available}
            </span>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col items-center text-center">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Reserved
            </span>
            <span className="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {book.copyBreakdown.reserved}
            </span>
          </div>

          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 flex flex-col items-center text-center">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              On Loan
            </span>
            <span className="font-mono text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {book.copyBreakdown.borrowed}
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 flex flex-col items-center text-center col-span-2 sm:col-span-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Maintenance
            </span>
            <span className="font-mono text-2xl font-bold text-foreground mt-1">
              {book.copyBreakdown.maintenance}
            </span>
          </div>
        </div>
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
