import { AppShellLayout } from "@/components/shared/app-shell-layout";

export default function StudentReservationsLoading() {
  return (
    <AppShellLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header Breadcrumb & Title Skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-32 skeleton-shimmer rounded-md" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
            <div className="space-y-2">
              <div className="h-8 w-64 skeleton-shimmer rounded-xl" />
              <div className="h-4 w-80 skeleton-shimmer rounded-md" />
            </div>
            <div className="h-7 w-28 skeleton-shimmer rounded-full" />
          </div>
        </div>

        {/* Instructions Callout Skeleton */}
        <div className="h-20 w-full skeleton-shimmer rounded-3xl" />

        {/* Active Holds Section Skeleton */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="h-6 w-40 skeleton-shimmer rounded-lg" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="h-16 w-12 skeleton-shimmer rounded-lg shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-16 skeleton-shimmer rounded-full" />
                    <div className="h-5 w-48 skeleton-shimmer rounded-md" />
                    <div className="h-3 w-28 skeleton-shimmer rounded-md" />
                  </div>
                </div>
                <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto shrink-0">
                  <div className="h-7 w-44 skeleton-shimmer rounded-full" />
                  <div className="h-8 w-32 skeleton-shimmer rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShellLayout>
  );
}
