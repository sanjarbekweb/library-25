import { Navbar } from "@/components/shared/navbar";

export default function BookDetailLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Back Link Skeleton */}
        <div className="h-4 w-32 skeleton-shimmer rounded-md" />

        {/* Hero Card Skeleton */}
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center space-y-4">
            <div className="aspect-[3/4] w-full max-w-[260px] skeleton-shimmer rounded-2xl" />
            <div className="h-6 w-36 skeleton-shimmer rounded-full" />
          </div>

          <div className="md:col-span-8 lg:col-span-9 space-y-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="h-6 w-24 skeleton-shimmer rounded-full" />
                <div className="h-6 w-32 skeleton-shimmer rounded-full" />
              </div>
              <div className="h-10 w-3/4 skeleton-shimmer rounded-xl" />
              <div className="h-5 w-1/3 skeleton-shimmer rounded-lg" />
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full skeleton-shimmer rounded-md" />
                <div className="h-4 w-5/6 skeleton-shimmer rounded-md" />
                <div className="h-4 w-4/6 skeleton-shimmer rounded-md" />
              </div>
            </div>

            <div className="pt-4 border-t border-border flex gap-4">
              <div className="h-12 w-56 skeleton-shimmer rounded-full" />
              <div className="h-12 flex-1 skeleton-shimmer rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Inventory Skeleton */}
        <div className="space-y-3">
          <div className="h-6 w-48 skeleton-shimmer rounded-lg" />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 skeleton-shimmer rounded-2xl" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
