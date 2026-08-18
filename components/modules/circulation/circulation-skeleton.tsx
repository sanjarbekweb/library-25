import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CirculationDeskSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted rounded-lg skeleton-shimmer" />
          <div className="h-4 w-96 bg-muted rounded-md skeleton-shimmer" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 bg-muted rounded-full skeleton-shimmer" />
          <div className="h-10 w-36 bg-muted rounded-full skeleton-shimmer" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="rounded-2xl border border-border shadow-sm">
            <CardHeader className="p-4 pb-2">
              <div className="h-4 w-24 bg-muted rounded skeleton-shimmer" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-8 w-16 bg-muted rounded-lg mt-1 skeleton-shimmer" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs Console Skeleton */}
      <div className="space-y-6">
        <div className="flex border-b border-border gap-4 pb-2">
          <div className="h-9 w-32 bg-muted rounded-full skeleton-shimmer" />
          <div className="h-9 w-32 bg-muted rounded-full skeleton-shimmer" />
          <div className="h-9 w-40 bg-muted rounded-full skeleton-shimmer" />
          <div className="h-9 w-36 bg-muted rounded-full skeleton-shimmer" />
        </div>

        <Card className="rounded-2xl border border-border">
          <CardContent className="p-6 space-y-4">
            <div className="h-6 w-48 bg-muted rounded skeleton-shimmer" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-12 bg-muted rounded-xl skeleton-shimmer" />
              <div className="h-12 bg-muted rounded-xl skeleton-shimmer" />
            </div>
            <div className="h-12 w-full bg-muted rounded-xl skeleton-shimmer mt-4" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
