export function UserSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-xl bg-muted" />
          <div className="h-4 w-96 rounded-lg bg-muted/60" />
        </div>
        <div className="h-9 w-36 rounded-full bg-muted" />
      </div>

      {/* Stats Cards Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="h-8 w-14 rounded-lg bg-muted" />
            <div className="h-3 w-28 rounded bg-muted/50" />
          </div>
        ))}
      </div>

      {/* Search & Filter Controls Skeleton */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        <div className="h-10 w-full sm:w-80 rounded-xl bg-muted" />
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-9 w-28 rounded-full bg-muted" />
          <div className="h-9 w-28 rounded-full bg-muted" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-border/40 last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
                <div className="space-y-1">
                  <div className="h-4 w-36 rounded bg-muted" />
                  <div className="h-3 w-48 rounded bg-muted/60" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-6 w-24 rounded-full bg-muted" />
                <div className="h-6 w-20 rounded-full bg-muted" />
                <div className="h-8 w-24 rounded-full bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
