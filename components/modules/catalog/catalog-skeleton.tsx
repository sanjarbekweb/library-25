export function BookCardSkeleton() {
  return (
    <div className="flex flex-col h-full rounded-2xl p-2 space-y-2">
      {/* Cover Image */}
      <div className="relative aspect-[3/4] w-full skeleton-shimmer rounded-xl shadow-xs" />

      {/* Title & Author */}
      <div className="pt-1 space-y-1.5">
        <div className="h-3.5 w-4/5 skeleton-shimmer rounded-md" />
        <div className="h-2.5 w-1/2 skeleton-shimmer rounded-md" />
      </div>
    </div>
  );
}

export function BookbaseCatalogSkeleton() {
  return (
    <div className="space-y-6">
      {/* Recommended Section Skeleton */}
      <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 skeleton-shimmer rounded-md" />
          <div className="h-3.5 w-16 skeleton-shimmer rounded-md" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Categories Section Skeleton */}
      <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
        <div className="h-5 w-28 skeleton-shimmer rounded-md" />

        {/* Category Pill Shimmers */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-8 w-14 rounded-xl skeleton-shimmer bg-brand-blue/30" />
          <div className="h-8 w-20 rounded-xl skeleton-shimmer" />
          <div className="h-8 w-24 rounded-xl skeleton-shimmer" />
          <div className="h-8 w-18 rounded-xl skeleton-shimmer" />
          <div className="h-8 w-22 rounded-xl skeleton-shimmer" />
        </div>

        {/* Catalog Grid Skeleton */}
        <div className="grid grid-cols-2 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function CatalogSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}
