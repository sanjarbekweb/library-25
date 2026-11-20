import { AppShellLayout } from "@/components/shared/app-shell-layout";
import { Card } from "@/components/ui/card";

export default function BookDetailLoading() {
  return (
    <AppShellLayout>
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-pulse">
        {/* Back Button Skeleton */}
        <div>
          <div className="h-9 w-9 rounded-full bg-muted/70 border border-border" />
        </div>

        {/* Hero Card Skeleton */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 p-4 sm:p-6 md:p-8">
            {/* Left Column: Cover Showcase */}
            <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center space-y-4">
              <div className="aspect-[3/4] w-full max-w-[260px] rounded-2xl bg-muted/70 shadow-md" />
              <div className="h-6 w-36 rounded-full bg-muted/60" />
            </div>

            {/* Right Column: Metadata & Actions */}
            <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="h-6 w-24 rounded-full bg-brand-blue/20" />
                  <div className="h-6 w-32 rounded-full bg-muted/60" />
                  <div className="h-6 w-20 rounded-full bg-muted/60" />
                </div>

                <div className="space-y-2">
                  <div className="h-9 w-3/4 rounded-xl bg-muted/80" />
                  <div className="h-5 w-1/3 rounded-md bg-muted/50" />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="h-4 w-full rounded bg-muted/50" />
                  <div className="h-4 w-5/6 rounded bg-muted/50" />
                  <div className="h-4 w-2/3 rounded bg-muted/40" />
                </div>
              </div>

              {/* Action Bar Skeleton */}
              <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="h-11 w-44 rounded-full bg-brand-blue/30" />
                <div className="h-9 w-64 rounded-xl bg-muted/50 border border-border/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Compact Inventory Status Bar Skeleton */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 sm:p-3 rounded-2xl border border-border bg-card shadow-2xs">
          <div className="h-4 w-28 rounded bg-muted/60" />
          <div className="h-6 w-24 rounded-full bg-muted/60" />
          <div className="h-6 w-28 rounded-full bg-brand-blue/20" />
          <div className="h-6 w-24 rounded-full bg-muted/50" />
          <div className="h-6 w-24 rounded-full bg-muted/50" />
        </div>

        {/* Reviews Section Skeleton */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="h-6 w-48 rounded-lg bg-muted/80" />
            <div className="h-8 w-36 rounded-full bg-muted/60" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-border bg-card shadow-xs rounded-2xl p-6 space-y-4">
              <div className="h-12 w-24 rounded-xl bg-muted/80" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-3 w-full rounded bg-muted/40" />
                ))}
              </div>
            </Card>

            <div className="lg:col-span-2 space-y-3">
              {[1, 2].map((i) => (
                <Card key={i} className="border-border bg-card shadow-xs rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-muted/60" />
                      <div className="h-4 w-32 rounded bg-muted/70" />
                    </div>
                    <div className="h-4 w-20 rounded bg-muted/50" />
                  </div>
                  <div className="h-4 w-full rounded bg-muted/50" />
                  <div className="h-4 w-3/4 rounded bg-muted/40" />
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShellLayout>
  );
}
