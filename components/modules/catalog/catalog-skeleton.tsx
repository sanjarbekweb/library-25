export function CatalogSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 min-[390px]:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col h-full rounded-2xl border border-border bg-card overflow-hidden"
        >
          {/* Aspect 3/4 image placeholder matching BookCard */}
          <div className="aspect-[3/4] w-full skeleton-shimmer" />

          {/* Content area matching BookCard padding & dimensions */}
          <div className="flex flex-col flex-1 p-4 space-y-3">
            <div className="h-4 w-24 skeleton-shimmer rounded-full" />
            <div className="h-5 w-3/4 skeleton-shimmer rounded-lg" />
            <div className="h-3 w-1/2 skeleton-shimmer rounded-md" />
            <div className="h-8 w-full skeleton-shimmer rounded-lg mt-1" />
            <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/60">
              <div className="h-3 w-16 skeleton-shimmer rounded-md" />
              <div className="h-3 w-20 skeleton-shimmer rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
