import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchMyLoansApi } from "@/hooks/api/useHistory";
import { StudentLoansView } from "@/components/modules/history/student-loans-view";
import { AppShellLayout } from "@/components/shared/app-shell-layout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Loans & Borrowing History | libra25",
  description:
    "View your active library book checkouts, return due date countdowns, overdue alerts, and historical reading records.",
};

export default async function StudentLoansPage() {
  const { userId, getToken } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/loans");
  }

  const token = await getToken();
  const overview = await fetchMyLoansApi(token);

  return (
    <AppShellLayout>
      <StudentLoansView overview={overview} />
    </AppShellLayout>
  );
}
