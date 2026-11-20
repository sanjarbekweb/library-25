export function UserSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1.5">
          <div className="h-7 w-64 rounded-xl bg-muted/80" />
          <div className="h-3.5 w-96 rounded-md bg-muted/50" />
        </div>
        <div className="h-9 w-36 rounded-full bg-brand-blue/30" />
      </div>

      {/* 5 Stats Cards Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 rounded bg-muted/60" />
              <div className="h-4 w-4 rounded bg-muted/40" />
            </div>
            <div className="h-7 w-12 rounded-lg bg-muted/80" />
            <div className="h-2.5 w-24 rounded bg-muted/40" />
          </div>
        ))}
      </div>

      {/* Search & Filter Controls Skeleton */}
      <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4 shadow-sm">
        <div className="h-9 w-full sm:w-80 rounded-xl bg-muted/50" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 rounded-full bg-brand-blue/20" />
          <div className="h-8 w-24 rounded-full bg-muted/60" />
          <div className="h-8 w-24 rounded-full bg-muted/60" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="h-5 w-44 rounded bg-muted/60" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-2.5 border-b border-border/40 last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted/70 shrink-0" />
                <div className="space-y-1">
                  <div className="h-4 w-36 rounded bg-muted/80" />
                  <div className="h-3 w-48 rounded bg-muted/50" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-6 w-20 rounded-full bg-brand-blue/15" />
                <div className="h-6 w-16 rounded-full bg-muted/60" />
                <div className="h-8 w-20 rounded-full bg-muted/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
