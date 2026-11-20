import { Card } from "@/components/ui/card";

export function BookManagementSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1.5">
          <div className="h-7 w-64 rounded-xl bg-muted/80" />
          <div className="h-3.5 w-96 rounded-md bg-muted/50" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-32 rounded-full bg-muted/60" />
          <div className="h-9 w-40 rounded-full bg-brand-blue/30" />
        </div>
      </div>

      {/* Search & Category Filter Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="h-9 w-full sm:w-72 rounded-xl bg-muted/50" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 rounded-full bg-brand-blue/20" />
          <div className="h-8 w-24 rounded-full bg-muted/60" />
          <div className="h-8 w-24 rounded-full bg-muted/60" />
        </div>
      </div>

      {/* Inventory Table Skeleton */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="h-6 w-48 rounded bg-muted/60" />
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-border/40 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-14 rounded-lg bg-muted/70 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-48 rounded bg-muted/80" />
                  <div className="h-3 w-32 rounded bg-muted/50" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-6 w-24 rounded-full bg-brand-blue/15" />
                <div className="h-6 w-20 rounded-full bg-muted/60" />
                <div className="h-8 w-24 rounded-full bg-muted/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
