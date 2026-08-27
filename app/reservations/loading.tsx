import { AppShellLayout } from "@/components/shared/app-shell-layout";
import { Card } from "@/components/ui/card";

export default function StudentReservationsLoading() {
  return (
    <AppShellLayout>
      <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto animate-pulse">
        {/* Header Breadcrumb & Title Skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-28 rounded-md bg-muted/60" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
            <div className="space-y-1.5">
              <div className="h-7 w-60 rounded-xl bg-muted/80" />
              <div className="h-3.5 w-80 rounded-md bg-muted/50" />
            </div>
            <div className="h-7 w-28 rounded-full bg-muted/60" />
          </div>
        </div>

        {/* Desk Pickup Policy Banner Skeleton */}
        <div className="h-16 w-full rounded-2xl bg-brand-blue/10 border border-brand-blue/20" />

        {/* Active Holds Section Skeleton */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="h-5 w-44 rounded-lg bg-muted/80" />
            <div className="h-5 w-16 rounded-full bg-muted/60" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 w-full md:w-auto">
                  <div className="h-16 w-12 rounded-lg bg-muted/70 shrink-0" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-16 rounded-full bg-muted/60" />
                      <div className="h-4 w-24 rounded-md bg-muted/50" />
                    </div>
                    <div className="h-5 w-48 rounded-md bg-muted/80" />
                    <div className="h-3.5 w-32 rounded-md bg-muted/50" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-2 w-full md:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 md:border-l md:border-border md:pl-5 border-border/60">
                  <div className="h-6 w-36 rounded-full bg-muted/60" />
                  <div className="h-8 w-28 rounded-full bg-muted/70" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Past Holds History Skeleton */}
        <div className="space-y-4 pt-2">
          <div className="h-5 w-44 rounded-lg bg-muted/80" />
          <Card className="border-border bg-card shadow-xs rounded-2xl p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 w-full rounded-xl bg-muted/30" />
            ))}
          </Card>
        </div>
      </div>
    </AppShellLayout>
  );
}
