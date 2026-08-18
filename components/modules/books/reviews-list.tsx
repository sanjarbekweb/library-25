"use client";

import { useState } from "react";
import {
  Star,
  MessageSquareQuote,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { BookFeedbackItem } from "@/lib/services/book-service";
import { SubmitFeedbackModal } from "@/components/modules/feedback/submit-feedback-modal";
import { submitDirectBookReviewAction } from "@/app/actions/feedback-actions";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface ReviewsListProps {
  feedbacks: BookFeedbackItem[];
  averageRating: number | null;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  eligibleLoanId?: string | null;
  bookId?: string;
  bookTitle?: string;
  bookAuthor?: string;
  isSignedIn?: boolean;
}

export function ReviewsList({
  feedbacks,
  averageRating,
  totalReviews,
  ratingDistribution,
  eligibleLoanId,
  bookId = "",
  bookTitle = "this book",
  bookAuthor = "",
  isSignedIn = false,
}: ReviewsListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);
  const [directRating, setDirectRating] = useState(5);
  const [directComment, setDirectComment] = useState("");
  const [isSubmittingDirect, setIsSubmittingDirect] = useState(false);
  const [directError, setDirectError] = useState<string | null>(null);
  const [directSuccess, setDirectSuccess] = useState<string | null>(null);

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDirect(true);
    setDirectError(null);

    const res = await submitDirectBookReviewAction({
      bookId,
      rating: directRating,
      comment: directComment ? directComment : null,
    });

    setIsSubmittingDirect(false);

    if (!res.ok) {
      setDirectError(res.error?.message || "Failed to submit review.");
      return;
    }

    setDirectSuccess("Your review and rating have been posted!");
    setTimeout(() => {
      setIsDirectModalOpen(false);
      setDirectSuccess(null);
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Verified Student Review Prompt Banner */}
      {eligibleLoanId && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/60 dark:bg-amber-950/40 dark:border-amber-800 p-5 text-amber-900 dark:text-amber-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-display font-bold text-base flex items-center gap-2">
              <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
              You completed a loan for this title!
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300">
              Share your reading experience and help other students discover
              great books.
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="rounded-full bg-amber-500 text-white hover:bg-amber-600 font-semibold text-xs gap-1.5 shrink-0"
          >
            <Star className="h-4 w-4 fill-current" />
            Write Verified Review
          </Button>
        </div>
      )}

      {/* Overview and Distribution Header */}
      <div className="rounded-2xl border border-border bg-card p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Rating Score */}
        <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-border">
          <span className="font-display text-5xl font-extrabold text-foreground">
            {averageRating ? averageRating.toFixed(1) : "N/A"}
          </span>
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  averageRating && star <= Math.round(averageRating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            Based on {totalReviews} student{" "}
            {totalReviews === 1 ? "review" : "reviews"}
          </span>
        </div>

        {/* Rating Bars Breakdown */}
        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((ratingKey) => {
            const count = ratingDistribution[ratingKey] || 0;
            const percentage =
              totalReviews > 0
                ? Math.round((count / totalReviews) * 100)
                : 0;

            return (
              <div
                key={ratingKey}
                className="flex items-center gap-3 text-xs"
              >
                <span className="w-12 font-medium flex items-center gap-1 text-muted-foreground">
                  {ratingKey}{" "}
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right font-mono text-muted-foreground">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Reviews Stream Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
            <MessageSquareQuote className="h-5 w-5 text-brand-blue" />
            Community Reviews ({totalReviews})
          </h3>

          {isSignedIn && !eligibleLoanId && (
            <Button
              onClick={() => setIsDirectModalOpen(true)}
              size="sm"
              variant="outline"
              className="rounded-full text-xs font-semibold gap-1.5 border-border hover:bg-accent"
            >
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>Write a Review</span>
            </Button>
          )}
        </div>

        {feedbacks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card/50">
            <p className="text-sm text-muted-foreground">
              No student reviews submitted for this book yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Be the first student to rate and leave a written review for this
              title.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-card p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {item.studentName}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      Student Reader
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3.5 w-3.5 ${
                        star <= item.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>

                {item.comment && (
                  <p className="text-sm text-foreground/90 leading-relaxed pt-1">
                    {"\u201C"}
                    {item.comment}
                    {"\u201D"}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Loan Review Modal */}
      {eligibleLoanId && (
        <SubmitFeedbackModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          loanId={eligibleLoanId}
          bookTitle={bookTitle}
          bookAuthor={bookAuthor}
        />
      )}

      {/* Direct Book Review Modal */}
      {isDirectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  Rate and Review Book
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Share your 5-star rating for{" "}
                  <strong className="text-foreground">{bookTitle}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDirectModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold p-1.5 rounded-full min-w-[32px] min-h-[32px] flex items-center justify-center"
                aria-label="Close review modal"
              >
                ✕
              </button>
            </div>

            {directError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{directError}</span>
              </div>
            )}

            {directSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{directSuccess}</span>
              </div>
            )}

            <form onSubmit={handleDirectSubmit} className="space-y-4">
              {/* Star Rating Picker */}
              <div className="space-y-2 text-center">
                <label className="text-xs font-semibold text-foreground">
                  Select Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center justify-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setDirectRating(star)}
                      className="p-1.5 hover:scale-110 transition-transform min-w-[40px] min-h-[40px] flex items-center justify-center"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= directRating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold block pt-1">
                  {directRating} out of 5 Stars
                </span>
              </div>

              {/* Review Comment */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Written Comment (Optional)
                </label>
                <textarea
                  rows={4}
                  maxLength={1000}
                  placeholder="Tell other readers what you thought about the plot, themes, or writing style..."
                  value={directComment}
                  onChange={(e) => setDirectComment(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background p-3 text-xs focus:ring-1 focus:ring-ring resize-none"
                />
                <div className="text-right text-[10px] text-muted-foreground font-mono">
                  {directComment.length}/1000
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDirectModalOpen(false)}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingDirect}
                  className="rounded-full bg-brand-blue text-white hover:bg-brand-blue/90 text-xs font-semibold gap-2"
                >
                  {isSubmittingDirect ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Star className="h-4 w-4 fill-current" />
                  )}
                  <span>Post Review</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
