export function BookCardSkeleton() {
  return (
    <div className="flex flex-col h-full rounded-2xl bg-card overflow-hidden">
      {/* Cover Image */}
      <div className="relative aspect-[3/4] w-full skeleton-shimmer rounded-2xl" />

      {/* Title & Author */}
      <div className="pt-2.5 pb-1 px-0.5 space-y-1.5">
        <div className="h-4 w-4/5 skeleton-shimmer rounded-md" />
        <div className="h-3 w-1/2 skeleton-shimmer rounded-md" />
      </div>
    </div>
  );
}

export function TopDemandShowcaseSkeleton() {
  return (
    <section className="border-b border-border bg-canvas-warm dark:bg-canvas-dark py-6 sm:py-8">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        {/* Section Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 skeleton-shimmer rounded-md" />
          <div className="h-4 w-20 skeleton-shimmer rounded-md" />
        </div>

        {/* 4 Cards Grid Skeleton */}
        <div className="grid grid-cols-2 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CatalogFilterBarSkeleton() {
  return (
    <div className="space-y-4">
      {/* Top Controls: Search Input & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="h-11 w-full max-w-md skeleton-shimmer rounded-full" />
        <div className="h-11 w-40 skeleton-shimmer rounded-full shrink-0" />
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-hidden pb-2 pt-1">
        <div className="h-8 w-28 skeleton-shimmer rounded-full shrink-0" />
        <div className="h-8 w-24 skeleton-shimmer rounded-full shrink-0" />
        <div className="h-8 w-24 skeleton-shimmer rounded-full shrink-0" />
        <div className="h-8 w-28 skeleton-shimmer rounded-full shrink-0" />
        <div className="h-8 w-20 skeleton-shimmer rounded-full shrink-0" />
      </div>
    </div>
  );
}

export function CatalogSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}

