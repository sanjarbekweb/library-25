"use client";

import { Card } from "@/components/ui/card";

export function StudentLoansSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1.5">
          <div className="h-7 w-56 rounded-xl bg-muted/80" />
          <div className="h-3.5 w-72 rounded-md bg-muted/50" />
        </div>
        <div className="h-9 w-36 rounded-full bg-muted/70" />
      </div>

      {/* 4 Overview KPI Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border bg-card shadow-sm rounded-2xl p-3.5 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 rounded bg-muted/60" />
              <div className="h-4 w-4 rounded bg-muted/50" />
            </div>
            <div className="h-7 w-12 rounded-lg bg-muted/80" />
            <div className="h-2.5 w-28 rounded bg-muted/40" />
          </Card>
        ))}
      </div>

      {/* Active Borrowing Cards Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="h-6 w-48 rounded-lg bg-muted/80" />
          <div className="h-5 w-20 rounded-full bg-muted/60" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="border-border bg-card shadow-xs rounded-2xl p-4 sm:p-5 flex gap-4">
              <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-muted/70 shrink-0" />
              <div className="flex-1 space-y-2.5 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="h-4 w-16 rounded-full bg-muted/60" />
                  <div className="h-5 w-24 rounded-full bg-muted/70" />
                </div>
                <div className="h-5 w-3/4 rounded-md bg-muted/80" />
                <div className="h-3.5 w-1/2 rounded-md bg-muted/50" />
                <div className="pt-2 flex justify-between items-center border-t border-border/50">
                  <div className="h-3 w-28 rounded bg-muted/40" />
                  <div className="h-8 w-24 rounded-full bg-muted/60" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Loan History Table Skeleton */}
      <div className="space-y-4 pt-2">
        <div className="h-6 w-48 rounded-lg bg-muted/80" />
        <Card className="border-border bg-card shadow-xs rounded-2xl overflow-hidden">
          <div className="p-4 space-y-3">
            <div className="h-10 w-full rounded-xl bg-muted/40" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 w-full rounded-xl bg-muted/20" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function CopyTraceabilitySkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto animate-pulse">
      {/* Search Header Skeleton */}
      <Card className="border-border bg-card shadow-sm rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="space-y-1.5">
          <div className="h-6 w-64 rounded-lg bg-muted/80" />
          <div className="h-3.5 w-96 rounded-md bg-muted/50" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <div className="h-10 flex-1 rounded-xl bg-muted/50" />
          <div className="h-10 w-36 rounded-full bg-muted/70" />
        </div>
      </Card>

      {/* Details Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card className="border-border bg-card shadow-sm rounded-2xl p-5 space-y-4">
            <div className="h-5 w-40 rounded-md bg-muted/80" />
            <div className="h-4 w-full rounded bg-muted/50" />
            <div className="h-4 w-full rounded bg-muted/50" />
            <div className="h-12 w-full rounded-xl bg-muted/40" />
          </Card>

          <Card className="border-border bg-card shadow-sm rounded-2xl p-5 space-y-4">
            <div className="h-5 w-48 rounded-md bg-muted/80" />
            <div className="h-14 w-full rounded-xl bg-muted/40" />
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-border bg-card shadow-sm rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="h-6 w-56 rounded-md bg-muted/80" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 w-full rounded-xl bg-muted/30" />
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
