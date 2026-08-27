import { Card, CardContent } from "@/components/ui/card";

export function CirculationDeskSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1.5">
          <div className="h-7 w-64 rounded-xl bg-muted/80" />
          <div className="h-3.5 w-96 rounded-md bg-muted/50" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-32 rounded-full bg-muted/60" />
          <div className="h-9 w-36 rounded-full bg-brand-blue/30" />
        </div>
      </div>

      {/* 4 Compact Metric Cards Bar Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-border bg-card shadow-2xs"
          >
            <div className="h-3.5 w-24 rounded bg-muted/60" />
            <div className="h-6 w-8 rounded bg-muted/80" />
          </div>
        ))}
      </div>

      {/* Navigation Tabs Bar Skeleton */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0 sm:flex-wrap border-b border-border">
        <div className="h-10 w-36 rounded-full bg-brand-blue/20 shrink-0" />
        <div className="h-10 w-36 rounded-full bg-muted/60 shrink-0" />
        <div className="h-10 w-32 rounded-full bg-muted/60 shrink-0" />
        <div className="h-10 w-36 rounded-full bg-muted/60 shrink-0" />
        <div className="h-10 w-44 rounded-full bg-muted/60 shrink-0" />
      </div>

      {/* Main Tab Active Console Card Skeleton */}
      <Card className="rounded-2xl border border-border bg-card shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="space-y-1">
            <div className="h-5 w-48 rounded-lg bg-muted/80" />
            <div className="h-3.5 w-80 rounded-md bg-muted/50" />
          </div>
          <div className="h-7 w-28 rounded-full bg-muted/60" />
        </div>

        {/* Dual Form Selector Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="h-3 w-32 rounded bg-muted/60" />
            <div className="h-11 w-full rounded-xl bg-muted/40" />
          </div>
          <div className="space-y-3">
            <div className="h-3 w-36 rounded bg-muted/60" />
            <div className="h-11 w-full rounded-xl bg-muted/40" />
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <div className="h-11 w-48 rounded-full bg-brand-blue/30" />
        </div>
      </Card>
    </div>
  );
}
