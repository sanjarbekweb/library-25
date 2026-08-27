import { getAdminFeedbacks } from "@/lib/services/feedback-service";
import { AdminFeedbackModeration } from "@/components/modules/feedback/admin-feedback-moderation";

export const metadata = {
  title: "Feedback & Review Moderation | libra25 Admin",
  description: "Moderate student reviews, ratings, and feedback across the library catalog.",
};

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const statusParam =
    resolvedParams.status === "published" || resolvedParams.status === "moderated"
      ? resolvedParams.status
      : "all";
  const searchParam = resolvedParams.search || "";
  const pageParam = Number(resolvedParams.page) || 1;

  const data = await getAdminFeedbacks({
    status: statusParam,
    search: searchParam,
    page: pageParam,
    limit: 20,
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <AdminFeedbackModeration
        initialData={data}
        currentStatus={statusParam}
        currentSearch={searchParam}
      />
    </div>
  );
}
