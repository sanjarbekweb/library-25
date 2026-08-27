import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserLoansAndHistory } from "@/lib/services/history-service";
import { StudentLoansView } from "@/components/modules/history/student-loans-view";
import { AppShellLayout } from "@/components/shared/app-shell-layout";

export const metadata: Metadata = {
  title: "My Loans & Borrowing History | libra25",
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
    <AppShellLayout>
      <StudentLoansView overview={overview} />
    </AppShellLayout>
  );
}
