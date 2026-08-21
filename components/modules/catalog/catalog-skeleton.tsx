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

export function FeaturedBookPanelSkeleton() {
  return (
    <aside className="hidden xl:flex w-80 flex-col justify-between p-6 bg-[#0B192C] shrink-0 border-l border-white/10 sticky top-16 h-[calc(100vh-4rem)]">
      <div className="space-y-5">
        {/* 3D Elevated White Card for Cover */}
        <div className="mx-auto aspect-[3/4] w-48 rounded-2xl bg-white p-2.5 shadow-2xl shadow-black/50">
          <div className="h-full w-full rounded-xl skeleton-shimmer bg-slate-200" />
        </div>

        {/* Title & Author */}
        <div className="space-y-2 text-center">
          <div className="h-4 w-3/4 mx-auto skeleton-shimmer rounded-md bg-white/20" />
          <div className="h-3 w-1/2 mx-auto skeleton-shimmer rounded-md bg-white/10" />
        </div>

        {/* Star Rating */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <div className="h-3.5 w-24 skeleton-shimmer rounded-full bg-white/15" />
        </div>

        {/* Book Spec Telemetry Counters */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 text-center">
          <div className="h-7 skeleton-shimmer rounded-md bg-white/10" />
          <div className="h-7 skeleton-shimmer rounded-md bg-white/10" />
          <div className="h-7 skeleton-shimmer rounded-md bg-white/10" />
        </div>

        {/* Description Snippet */}
        <div className="space-y-1.5">
          <div className="h-2.5 w-full skeleton-shimmer rounded-md bg-white/10" />
          <div className="h-2.5 w-5/6 mx-auto skeleton-shimmer rounded-md bg-white/10" />
          <div className="h-2.5 w-4/6 mx-auto skeleton-shimmer rounded-md bg-white/10" />
        </div>
      </div>

      {/* Button Shimmer */}
      <div className="pt-4">
        <div className="h-11 w-full rounded-2xl skeleton-shimmer bg-brand-blue/50" />
      </div>
    </aside>
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
        <div className="grid grid-cols-2 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function CatalogSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}
