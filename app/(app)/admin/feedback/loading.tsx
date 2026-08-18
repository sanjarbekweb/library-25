import { FeedbackSkeleton } from "@/components/modules/feedback/feedback-skeleton";

export default function AdminFeedbackLoading() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <FeedbackSkeleton />
    </div>
  );
}
