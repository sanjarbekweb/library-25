import { Metadata } from "next";
import { getCollectionAnalytics } from "@/lib/services/analytics-service";
import { AnalyticsDashboard } from "@/components/modules/analytics/analytics-dashboard";

export const metadata: Metadata = {
  title: "Circulation & Collection Analytics | ShelfSync Admin",
  description:
    "Real-time library analytics, monthly circulation trends, category growth, overdue ratios, and reader cohort telemetry.",
};

export default async function AdminAnalyticsPage() {
  const initialData = await getCollectionAnalytics("90d");

  return <AnalyticsDashboard initialData={initialData} />;
}
