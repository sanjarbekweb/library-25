import { Navbar } from "@/components/shared/navbar";
import { StudentLoansSkeleton } from "@/components/modules/history/history-skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <StudentLoansSkeleton />
      </main>
    </div>
  );
}
