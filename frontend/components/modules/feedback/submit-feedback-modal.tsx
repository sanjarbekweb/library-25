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
import { useAuth } from "@clerk/nextjs";
import { submitFeedbackApi } from "@/hooks/api/useFeedback";
import { toast } from "react-toastify";

interface SubmitFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId?: string;
  loanId?: string;
  bookTitle: string;
  bookAuthor: string;
  onSuccess?: () => void;
}

export function SubmitFeedbackModal({
  isOpen,
  onClose,
  bookId,
  loanId,
  bookTitle,
  bookAuthor,
  onSuccess,
}: SubmitFeedbackModalProps) {
  const { getToken } = useAuth();
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

    try {
      const token = await getToken();
      await submitFeedbackApi(
        {
          bookId: bookId || "",
          loanId: loanId || undefined,
          rating,
          comment: comment.trim() || undefined,
        },
        token
      );

      setIsSuccess(true);
      toast.success("Review submitted! Thank you for sharing your feedback.");
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setIsSuccess(false);
        setComment("");
        setRating(5);
        onClose();
      }, 1400);
    } catch (err: any) {
      const errMsg = err.message || "Failed to submit review. Please try again.";
      setErrorMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border-border">
        <DialogHeader className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-blue/15 text-brand-blue border border-brand-blue/20 mb-1">
            <Star className="h-5 w-5 fill-brand-blue text-brand-blue" />
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
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20 animate-bounce">
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
          <form onSubmit={handleSubmit} className="space-y-5 py-2">
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Star Rating Control */}
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Your Rating
              </span>
              <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Book Rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={rating === star}
                    aria-label={`${star} star${star === 1 ? "" : "s"}`}
                    className="p-1 rounded-lg hover:scale-115 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue transition-transform"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        star <= activeRating
                          ? "fill-brand-yellow text-brand-yellow"
                          : "text-muted-foreground/30 hover:text-muted-foreground/60"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-medium text-foreground">
                {activeRating === 1 && "1 - Poor"}
                {activeRating === 2 && "2 - Fair"}
                {activeRating === 3 && "3 - Good"}
                {activeRating === 4 && "4 - Very Good"}
                {activeRating === 5 && "5 - Excellent"}
              </span>
            </div>

            {/* Written Review */}
            <div className="space-y-1.5">
              <label htmlFor="review-comment" className="text-xs font-medium text-foreground">
                Written Review (Optional)
              </label>
              <textarea
                id="review-comment"
                rows={3}
                className="w-full rounded-2xl border border-input bg-background/50 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:border-brand-blue transition-all"
                placeholder="What did you learn from this book? Who would you recommend it to?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
              />
              <div className="flex justify-end">
                <span className="text-[10px] text-muted-foreground font-mono">
                  {comment.length}/500
                </span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-brand-blue text-white hover:bg-brand-blue/90 text-xs gap-1.5 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
