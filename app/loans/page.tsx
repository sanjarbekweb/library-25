import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserLoansAndHistory } from "@/lib/services/history-service";
import { StudentLoansView } from "@/components/modules/history/student-loans-view";
import { Navbar } from "@/components/shared/navbar";

export const metadata: Metadata = {
  title: "My Loans & Borrowing History | ShelfSync",
  description:
    "View your active library book checkouts, return due date countdowns, overdue alerts, and historical reading records.",
};

export default async function StudentLoansPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/loans");
  }

  const overview = await getUserLoansAndHistory(userId);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <StudentLoansView overview={overview} />
      </main>
    </div>
  );
}
