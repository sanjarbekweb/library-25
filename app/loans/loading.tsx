import { AppShellLayout } from "@/components/shared/app-shell-layout";
import { StudentLoansSkeleton } from "@/components/modules/history/history-skeleton";

export default function Loading() {
  return (
    <AppShellLayout>
      <StudentLoansSkeleton />
    </AppShellLayout>
  );
}
