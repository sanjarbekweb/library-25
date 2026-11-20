export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-muted/80 shrink-0" />
            <div className="h-7 w-64 rounded-xl bg-muted/80" />
          </div>
          <div className="h-3.5 w-96 rounded-md bg-muted/50" />
        </div>
        <div className="h-9 w-36 rounded-full bg-muted/60" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between h-56 space-y-4 shadow-sm"
          >
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-muted/70" />
              <div className="h-6 w-3/4 rounded-lg bg-muted/80" />
              <div className="h-3.5 w-full rounded-md bg-muted/50" />
              <div className="h-3.5 w-5/6 rounded-md bg-muted/40" />
            </div>
            <div className="h-9 w-full rounded-full bg-muted/60 mt-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
