export default function AdminDashboardLoading() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 skeleton-shimmer rounded-2xl shrink-0" />
            <div className="h-8 w-64 skeleton-shimmer rounded-xl" />
          </div>
          <div className="h-4 w-96 skeleton-shimmer rounded-md" />
        </div>
        <div className="h-9 w-36 skeleton-shimmer rounded-full" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between h-56 space-y-6"
          >
            <div className="space-y-3">
              <div className="h-12 w-12 skeleton-shimmer rounded-2xl" />
              <div className="h-6 w-3/4 skeleton-shimmer rounded-lg" />
              <div className="h-4 w-full skeleton-shimmer rounded-md" />
              <div className="h-4 w-5/6 skeleton-shimmer rounded-md" />
            </div>
            <div className="h-9 w-full skeleton-shimmer rounded-full mt-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
