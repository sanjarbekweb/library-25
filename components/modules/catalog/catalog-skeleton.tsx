export function BookCardSkeleton() {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-border bg-card p-2.5 sm:p-3 shadow-2xs space-y-2.5 animate-pulse">
      {/* Cover Image Placeholder */}
      <div className="relative aspect-[3/4] w-full rounded-xl bg-muted/70 overflow-hidden shadow-2xs" />

      {/* Book Metadata */}
      <div className="pt-1 flex flex-col flex-1 justify-between gap-2">
        <div className="space-y-1.5">
          <div className="h-4 w-4/5 rounded-md bg-muted/80" />
          <div className="h-3 w-1/2 rounded-md bg-muted/60" />
        </div>

        {/* Availability Pill */}
        <div className="pt-1 border-t border-border/50">
          <div className="h-5 w-20 rounded-full bg-muted/70" />
        </div>
      </div>
    </div>
  );
}

export function BookbaseCatalogSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto animate-pulse">
      {/* Search & Header Section Skeleton */}
      <div className="space-y-4">
        {/* Title & Tagline */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="space-y-1.5">
            <div className="h-7 w-48 rounded-xl bg-muted/80" />
            <div className="h-3.5 w-72 rounded-md bg-muted/50" />
          </div>
          <div className="h-8 w-28 rounded-full bg-muted/60" />
        </div>

        {/* Search Bar Input */}
        <div className="h-11 w-full rounded-2xl bg-card border border-border" />

        {/* Horizontal Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1.5 sm:pb-0 sm:flex-wrap">
          <div className="h-8 w-16 rounded-full bg-brand-blue/20 shrink-0" />
          <div className="h-8 w-24 rounded-full bg-muted/70 shrink-0" />
          <div className="h-8 w-28 rounded-full bg-muted/70 shrink-0" />
          <div className="h-8 w-20 rounded-full bg-muted/70 shrink-0" />
          <div className="h-8 w-24 rounded-full bg-muted/70 shrink-0" />
          <div className="h-8 w-32 rounded-full bg-muted/70 shrink-0" />
          <div className="h-8 w-20 rounded-full bg-muted/70 shrink-0" />
        </div>
      </div>

      {/* Responsive Book Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>

      {/* Pagination Controls Skeleton */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
        <div className="h-4 w-36 rounded-md bg-muted/50" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 rounded-full bg-muted/60" />
          <div className="h-9 w-20 rounded-full bg-muted/60" />
        </div>
      </div>
    </div>
  );
}

export function CatalogSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}
