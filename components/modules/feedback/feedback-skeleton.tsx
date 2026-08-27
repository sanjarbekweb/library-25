export function FeedbackSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-muted/70 border border-border" />
          <div className="h-7 w-56 rounded-xl bg-muted/80" />
        </div>
      </div>

      {/* 4 Overview KPI Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 rounded bg-muted/60" />
              <div className="h-4 w-4 rounded bg-muted/50" />
            </div>
            <div className="h-7 w-12 rounded-lg bg-muted/80" />
            <div className="h-2.5 w-28 rounded bg-muted/40" />
          </div>
        ))}
      </div>

      {/* Filter Bar Skeleton */}
      <div className="rounded-2xl bg-card border border-border p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shadow-sm">
        <div className="h-8 w-60 rounded-xl bg-muted/50" />
        <div className="h-9 w-full sm:w-64 rounded-xl bg-muted/50" />
      </div>

      {/* Reviews Cards Stream Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs"
          >
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted/70 shrink-0" />
                <div className="space-y-1">
                  <div className="h-4 w-36 rounded bg-muted/80" />
                  <div className="h-3 w-28 rounded bg-muted/50" />
                </div>
                <div className="h-5 w-20 rounded-full bg-muted/50 ml-auto md:ml-0" />
              </div>
              <div className="h-4 w-5/6 rounded bg-muted/60" />
              <div className="h-3.5 w-48 rounded bg-muted/40" />
            </div>

            <div className="flex flex-row md:flex-col items-center justify-end gap-2 w-full md:w-auto shrink-0 md:border-l md:border-border md:pl-5 pt-3 md:pt-0 border-t md:border-t-0 border-border/60">
              <div className="h-8 flex-1 sm:flex-none w-28 rounded-xl bg-brand-blue/20" />
              <div className="h-8 flex-1 sm:flex-none w-20 rounded-xl bg-destructive/15" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
