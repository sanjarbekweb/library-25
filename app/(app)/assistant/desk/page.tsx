import { Suspense } from "react";
import { getCirculationDeskData } from "@/lib/services/circulation-service";
import { CirculationDesk } from "@/components/modules/circulation/circulation-desk";
import { CirculationDeskSkeleton } from "@/components/modules/circulation/circulation-skeleton";

export const metadata = {
  title: "Circulation Desk Console | ShelfSync",
  description: "Rapid sub-10s checkout and check-in desk for library assistants.",
};

async function DeskContent() {
  const { summary, pendingReservations, activeLoans } =
    await getCirculationDeskData();

  return (
    <CirculationDesk
      initialSummary={summary}
      initialReservations={pendingReservations}
      initialActiveLoans={activeLoans}
    />
  );
}

export default function AssistantDeskAliasPage() {
  return (
    <main className="container max-w-7xl mx-auto px-4 py-8">
      <Suspense fallback={<CirculationDeskSkeleton />}>
        <DeskContent />
      </Suspense>
    </main>
  );
}
