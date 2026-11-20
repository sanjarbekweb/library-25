import { auth } from "@clerk/nextjs/server";
import { fetchAdminFeedbacksApi, AdminFeedbackResult } from "@/hooks/api/useFeedback";
import { AdminFeedbackModeration } from "@/components/modules/feedback/admin-feedback-moderation";

export const dynamic = "force-dynamic";

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

  const { getToken } = await auth();
  const token = await getToken();

  let initialData: AdminFeedbackResult = {
    feedbacks: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 1 },
    stats: { totalCount: 0, moderatedCount: 0, publishedCount: 0, averageRating: null },
  };

  try {
    initialData = await fetchAdminFeedbacksApi(
      {
        status: statusParam,
        search: searchParam,
        page: pageParam,
        limit: 20,
      },
      token
    );
  } catch (error) {
    console.error("Failed to fetch admin feedback:", error);
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <AdminFeedbackModeration
        initialData={initialData}
        currentStatus={statusParam}
        currentSearch={searchParam}
      />
    </div>
  );
}
