import { Card, CardContent } from "@/components/ui/card";

export function AnalyticsSkeleton() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted/60 rounded-xl" />
          <div className="h-4 w-96 bg-muted/40 rounded-lg" />
        </div>
        <div className="h-9 w-44 bg-muted/60 rounded-full" />
      </div>

      {/* 4 KPI Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border bg-card shadow-sm rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-muted/60 rounded-lg" />
              <div className="h-9 w-9 bg-muted/50 rounded-xl" />
            </div>
            <div className="h-8 w-20 bg-muted/80 rounded-xl" />
            <div className="h-3 w-36 bg-muted/40 rounded-md" />
          </Card>
        ))}
      </div>

      {/* Main Visual Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Volume Chart Skeleton (2 cols) */}
        <Card className="lg:col-span-2 border-border bg-card shadow-sm rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-6 w-48 bg-muted/70 rounded-lg" />
              <div className="h-3 w-64 bg-muted/40 rounded-md" />
            </div>
            <div className="h-4 w-24 bg-muted/50 rounded-full" />
          </div>
          <div className="h-64 bg-muted/30 rounded-xl flex items-end justify-between p-4 gap-3">
            {[40, 65, 30, 85, 60, 95].map((h, idx) => (
              <div key={idx} className="w-full bg-muted/50 rounded-t-lg" style={{ height: `${h}%` }} />
            ))}
          </div>
        </Card>

        {/* Category Breakdown Skeleton (1 col) */}
        <Card className="border-border bg-card shadow-sm rounded-2xl p-6 space-y-5">
          <div className="space-y-1">
            <div className="h-6 w-40 bg-muted/70 rounded-lg" />
            <div className="h-3 w-48 bg-muted/40 rounded-md" />
          </div>
          <div className="space-y-4 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-muted/60 rounded-md" />
                  <div className="h-4 w-12 bg-muted/50 rounded-md" />
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
        <Card className="border-border bg-card shadow-sm rounded-2xl p-6 space-y-4">
          <div className="h-5 w-44 bg-muted/70 rounded-lg" />
          <div className="h-32 bg-muted/30 rounded-xl" />
        </Card>

        {/* Copy Health Skeleton */}
        <Card className="border-border bg-card shadow-sm rounded-2xl p-6 space-y-4">
          <div className="h-5 w-44 bg-muted/70 rounded-lg" />
          <div className="h-32 bg-muted/30 rounded-xl" />
        </Card>

        {/* Readers Cohort Skeleton */}
        <Card className="border-border bg-card shadow-sm rounded-2xl p-6 space-y-4 md:col-span-2 lg:col-span-1">
          <div className="h-5 w-44 bg-muted/70 rounded-lg" />
          <div className="space-y-3 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-border/50 pb-2">
                <div className="h-4 w-32 bg-muted/60 rounded-md" />
                <div className="h-4 w-16 bg-muted/50 rounded-md" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
