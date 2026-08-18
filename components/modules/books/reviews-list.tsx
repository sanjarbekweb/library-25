import { Star, MessageSquareQuote, CheckCircle2 } from "lucide-react";
import { BookFeedbackItem } from "@/lib/services/book-service";
import { formatDistanceToNow } from "date-fns";

interface ReviewsListProps {
  feedbacks: BookFeedbackItem[];
  averageRating: number | null;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export function ReviewsList({
  feedbacks,
  averageRating,
  totalReviews,
  ratingDistribution,
}: ReviewsListProps) {
  return (
    <div className="space-y-6">
      {/* Overview & Distribution Header */}
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
            Based on {totalReviews} verified student loan{totalReviews === 1 ? "" : "s"}
          </span>
        </div>

        {/* Rating Bars Breakdown */}
        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((ratingKey) => {
            const count = ratingDistribution[ratingKey] || 0;
            const percentage =
              totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

            return (
              <div key={ratingKey} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-medium flex items-center gap-1 text-muted-foreground">
                  {ratingKey} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
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

      {/* Verified Reviews Stream */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
          <MessageSquareQuote className="h-5 w-5 text-brand-blue" />
          Verified Student Reviews ({totalReviews})
        </h3>

        {feedbacks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card/50">
            <p className="text-sm text-muted-foreground">
              No verified student reviews submitted for this book yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Reviews can be left after completing a physical loan checkout.
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
                      Verified Loan
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                {/* Rating Stars */}
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

                {/* Written Comment */}
                {item.comment && (
                  <p className="text-sm text-foreground/90 leading-relaxed pt-1">
                    &ldquo;{item.comment}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
