export function BookCardSkeleton() {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-border bg-card overflow-hidden">
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full skeleton-shimmer">
        {/* Category Pill Tag Overlay Skeleton */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <div className="h-5 sm:h-6 w-16 sm:w-20 skeleton-shimmer rounded-full border border-border/40" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 sm:p-4">
        {/* Availability Badge Skeleton */}
        <div className="mb-2">
          <div className="h-5 sm:h-6 w-24 sm:w-28 skeleton-shimmer rounded-full" />
        </div>

        {/* Title Skeleton */}
        <div className="h-4 sm:h-5 w-4/5 skeleton-shimmer rounded-md" />

        {/* Author & Year Skeleton */}
        <div className="flex items-center justify-between mt-1 gap-1">
          <div className="h-3 sm:h-3.5 w-24 skeleton-shimmer rounded-md" />
          <div className="hidden sm:block h-3.5 w-10 skeleton-shimmer rounded-md" />
        </div>

        {/* Description snippet Skeleton (hidden on mobile, 2 lines on sm) */}
        <div className="hidden sm:flex flex-col gap-1.5 mt-2">
          <div className="h-3 w-full skeleton-shimmer rounded-md" />
          <div className="h-3 w-4/5 skeleton-shimmer rounded-md" />
        </div>

        {/* Footer Rating & Link Skeleton */}
        <div className="mt-auto pt-2.5 sm:pt-3 flex items-center justify-between border-t border-border/60">
          <div className="h-3.5 w-16 skeleton-shimmer rounded-md" />
          <div className="h-3.5 w-14 skeleton-shimmer rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function TopDemandCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-3.5 flex flex-col justify-between space-y-2.5">
      {/* Top Badge Overlay */}
      <div className="flex items-center justify-between gap-2">
        <div className="h-5 w-20 skeleton-shimmer rounded-full" />
        <div className="h-5 w-12 skeleton-shimmer rounded-full" />
      </div>

      {/* Book Cover Container - Normal 3:4 aspect ratio */}
      <div className="relative aspect-[3/4] w-full rounded-xl skeleton-shimmer border border-border/50">
        <div className="absolute top-1.5 left-1.5 h-4 w-20 skeleton-shimmer rounded-md" />
      </div>

      {/* Title & Author Info */}
      <div className="space-y-1 flex-1 flex flex-col justify-start">
        <div className="h-4 w-4/5 skeleton-shimmer rounded-md" />
        <div className="h-3 w-1/2 skeleton-shimmer rounded-md" />
      </div>

      {/* Copy Availability Status & Action CTA */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 skeleton-shimmer rounded-full" />
          <div className="h-3 w-10 skeleton-shimmer rounded-md" />
        </div>
        <div className="h-8 w-full skeleton-shimmer rounded-full" />
      </div>
    </div>
  );
}

export function TopDemandShowcaseSkeleton() {
  return (
    <section className="relative border-b border-border bg-canvas-warm dark:bg-canvas-dark py-4 sm:py-5">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        {/* Compact Section Header Banner Skeleton */}
        <div className="flex flex-row items-center justify-between gap-3 border-b border-border/50 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-5 w-32 skeleton-shimmer rounded-full" />
            <div className="h-6 w-44 skeleton-shimmer rounded-md" />
          </div>
          <div className="shrink-0">
            <div className="h-8 w-36 skeleton-shimmer rounded-full" />
          </div>
        </div>

        {/* 5 Cards Grid Skeleton */}
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <TopDemandCardSkeleton key={i} />
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
        <div className="h-4 w-20 skeleton-shimmer rounded-md shrink-0 hidden md:block" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}
