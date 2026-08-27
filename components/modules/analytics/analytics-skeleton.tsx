import { Card } from "@/components/ui/card";

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1.5">
          <div className="h-7 w-64 rounded-xl bg-muted/80" />
          <div className="h-3.5 w-96 rounded-md bg-muted/50" />
        </div>
        <div className="h-8 w-36 rounded-full bg-muted/60" />
      </div>

      {/* 4 KPI Metric Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border bg-card shadow-sm rounded-2xl p-3.5 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 rounded bg-muted/60" />
              <div className="h-4 w-4 rounded bg-muted/50" />
            </div>
            <div className="h-7 w-16 rounded-lg bg-muted/80" />
            <div className="h-2.5 w-28 rounded bg-muted/40" />
          </Card>
        ))}
      </div>

      {/* Main Visual Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Volume Chart Skeleton (2 cols) */}
        <Card className="lg:col-span-2 border-border bg-card shadow-sm rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-5 w-48 rounded-lg bg-muted/80" />
              <div className="h-3 w-64 rounded-md bg-muted/50" />
            </div>
            <div className="h-6 w-24 rounded-full bg-brand-blue/20" />
          </div>
          <div className="h-44 bg-muted/20 rounded-2xl flex items-end justify-between p-4 gap-3">
            {[40, 65, 30, 85, 60, 95].map((h, idx) => (
              <div key={idx} className="w-full bg-muted/50 rounded-t-lg" style={{ height: `${h}%` }} />
            ))}
          </div>
        </Card>

        {/* Category Breakdown Skeleton (1 col) */}
        <Card className="border-border bg-card shadow-sm rounded-3xl p-6 space-y-5">
          <div className="space-y-1">
            <div className="h-5 w-40 rounded-lg bg-muted/80" />
            <div className="h-3 w-48 rounded-md bg-muted/50" />
          </div>
          <div className="space-y-3.5 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3.5 w-24 rounded bg-muted/60" />
                  <div className="h-3.5 w-10 rounded bg-muted/50" />
                </div>
                <div className="h-2 w-full bg-muted/30 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Lower Row Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Overdue Telemetry Skeleton */}
        <Card className="border-border bg-card shadow-sm rounded-3xl p-6 space-y-4">
          <div className="h-5 w-44 rounded-lg bg-muted/80" />
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="h-16 rounded-xl bg-muted/30" />
            <div className="h-16 rounded-xl bg-muted/30" />
            <div className="h-16 rounded-xl bg-muted/30" />
          </div>
        </Card>

        {/* Copy Health Skeleton */}
        <Card className="border-border bg-card shadow-sm rounded-3xl p-6 space-y-4">
          <div className="h-5 w-44 rounded-lg bg-muted/80" />
          <div className="space-y-2 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-full rounded-xl bg-muted/30" />
            ))}
          </div>
        </Card>

        {/* Readers Cohort Skeleton */}
        <Card className="border-border bg-card shadow-sm rounded-3xl p-6 space-y-4 md:col-span-2 lg:col-span-1">
          <div className="h-5 w-44 rounded-lg bg-muted/80" />
          <div className="space-y-3 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-border/50 pb-2">
                <div className="h-3.5 w-32 rounded bg-muted/60" />
                <div className="h-3.5 w-16 rounded bg-muted/50" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Borrowed Books Table Skeleton */}
      <Card className="border-border bg-card shadow-sm rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <div className="h-5 w-48 rounded bg-muted/80" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-11 rounded bg-muted/70 shrink-0" />
                <div className="space-y-1">
                  <div className="h-4 w-44 rounded bg-muted/80" />
                  <div className="h-3 w-28 rounded bg-muted/50" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-5 w-16 rounded-full bg-muted/60" />
                <div className="h-6 w-24 rounded-full bg-brand-blue/15" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
