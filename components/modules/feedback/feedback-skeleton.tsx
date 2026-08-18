export function FeedbackSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-xl bg-muted" />
        <div className="h-4 w-96 rounded-lg bg-muted/60" />
      </div>

      {/* Overview Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="h-8 w-16 rounded-lg bg-muted" />
            <div className="h-3 w-32 rounded bg-muted/50" />
          </div>
        ))}
      </div>

      {/* Filter Bar Skeleton */}
      <div className="h-14 rounded-2xl bg-card border border-border p-4 flex items-center justify-between">
        <div className="h-8 w-48 rounded-xl bg-muted" />
        <div className="h-8 w-64 rounded-xl bg-muted" />
      </div>

      {/* Reviews Cards Stream Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 w-32 rounded-full bg-muted" />
              <div className="h-3 w-24 rounded bg-muted/60" />
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-16 rounded-lg bg-muted shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-48 rounded bg-muted" />
                <div className="h-3 w-32 rounded bg-muted/60" />
                <div className="h-3 w-40 rounded bg-muted/40" />
              </div>
            </div>
            <div className="pt-2 space-y-2 border-t border-border/40">
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="h-12 rounded-xl bg-muted/30" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
