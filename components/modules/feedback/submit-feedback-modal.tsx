"use client";

import { useState } from "react";
import { Star, Loader2, MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { submitBookFeedbackAction } from "@/app/actions/feedback-actions";

import { toast } from "react-toastify";

interface SubmitFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  bookTitle: string;
  bookAuthor: string;
  onSuccess?: () => void;
}

export function SubmitFeedbackModal({
  isOpen,
  onClose,
  loanId,
  bookTitle,
  bookAuthor,
  onSuccess,
}: SubmitFeedbackModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const activeRating = hoverRating !== null ? hoverRating : rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await submitBookFeedbackAction({
      loanId,
      rating,
      comment,
    });

    setIsSubmitting(false);

    if (res.ok) {
      setIsSuccess(true);
      toast.success("Review submitted! Thank you for sharing your feedback.");
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setIsSuccess(false);
        setComment("");
        setRating(5);
        onClose();
      }, 1400);
    } else {
      const errMsg = res.error?.message || "Failed to submit review. Please try again.";
      setErrorMessage(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border-border">
        <DialogHeader className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-1">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          </div>
          <DialogTitle className="font-display font-bold text-xl text-foreground">
            Rate &amp; Review Book
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sharing verified feedback for <span className="font-semibold text-foreground">&ldquo;{bookTitle}&rdquo;</span> by {bookAuthor}.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 animate-bounce">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="font-display font-bold text-lg text-foreground">
              Review Submitted!
            </h4>
            <p className="text-xs text-muted-foreground">
              Thank you for sharing your reading experience with the library community.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            {errorMessage && (
              <div className="rounded-2xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Star Rating Selector */}
            <div className="space-y-2 text-center bg-muted/30 p-4 rounded-2xl border border-border/50">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Your Overall Rating
              </label>
              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1.5 focus:outline-none rounded-xl transition-transform hover:scale-125 focus-visible:ring-2 focus-visible:ring-brand-blue"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= activeRating
                          ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                          : "fill-muted/40 text-muted-foreground/40"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono font-medium text-foreground block">
                {activeRating === 5 && "⭐ 5 - Exceptional read, highly recommended!"}
                {activeRating === 4 && "⭐ 4 - Great book, thoroughly enjoyed it"}
                {activeRating === 3 && "⭐ 3 - Good book with interesting points"}
                {activeRating === 2 && "⭐ 2 - Okay, but had noticeable flaws"}
                {activeRating === 1 && "⭐ 1 - Poor, would not recommend"}
              </span>
            </div>

            {/* Written Comment Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="review-comment"
                  className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-brand-blue" />
                  Written Review (Optional)
                </label>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {comment.length}/1000
                </span>
              </div>
              <textarea
                id="review-comment"
                rows={4}
                maxLength={1000}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like or dislike about this book? Was it easy to understand?"
                className="w-full rounded-2xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/50 resize-none transition-all"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-brand-blue text-white hover:bg-brand-blue/90 font-medium text-xs gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Verified Review</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
