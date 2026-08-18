"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StudentLoansSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 skeleton-shimmer rounded-xl" />
          <div className="h-4 w-96 skeleton-shimmer rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-32 skeleton-shimmer rounded-full" />
          <div className="h-9 w-36 skeleton-shimmer rounded-full" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border bg-card shadow-sm rounded-2xl p-4 space-y-3">
            <div className="h-3 w-24 skeleton-shimmer rounded" />
            <div className="h-8 w-16 skeleton-shimmer rounded-lg" />
            <div className="h-3 w-28 skeleton-shimmer rounded" />
          </Card>
        ))}
      </div>

      {/* Active Loans Cards Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 skeleton-shimmer rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="border-border bg-card shadow-sm rounded-2xl p-5 flex gap-4">
              <div className="w-20 h-28 skeleton-shimmer rounded-xl shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-20 skeleton-shimmer rounded-full" />
                  <div className="h-4 w-16 skeleton-shimmer rounded" />
                </div>
                <div className="h-5 w-40 skeleton-shimmer rounded" />
                <div className="h-4 w-24 skeleton-shimmer rounded" />
                <div className="pt-2 flex justify-between items-center">
                  <div className="h-4 w-28 skeleton-shimmer rounded" />
                  <div className="h-6 w-24 skeleton-shimmer rounded-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* History Table Skeleton */}
      <div className="space-y-4 pt-4">
        <div className="h-6 w-48 skeleton-shimmer rounded-lg" />
        <Card className="border-border bg-card shadow-sm rounded-2xl p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 w-full skeleton-shimmer rounded-xl" />
          ))}
        </Card>
      </div>
    </div>
  );
}

export function CopyTraceabilitySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Search Header Skeleton */}
      <Card className="border-border bg-card shadow-sm rounded-2xl p-6 space-y-4">
        <div className="h-6 w-64 skeleton-shimmer rounded-lg" />
        <div className="h-4 w-96 skeleton-shimmer rounded" />
        <div className="flex gap-3 pt-2">
          <div className="h-10 flex-1 skeleton-shimmer rounded-xl" />
          <div className="h-10 w-32 skeleton-shimmer rounded-full" />
        </div>
      </Card>

      {/* Details Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card className="border-border bg-card shadow-sm rounded-2xl p-5 space-y-4">
            <div className="h-5 w-40 skeleton-shimmer rounded" />
            <div className="h-4 w-full skeleton-shimmer rounded" />
            <div className="h-4 w-full skeleton-shimmer rounded" />
            <div className="h-12 w-full skeleton-shimmer rounded-xl" />
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="border-border bg-card shadow-sm rounded-2xl p-6 space-y-4">
            <div className="h-6 w-48 skeleton-shimmer rounded" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 w-full skeleton-shimmer rounded-xl" />
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
