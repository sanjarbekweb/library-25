import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { fetchAnalyticsDataApi } from "@/hooks/api/useAnalytics";
import { AnalyticsDashboard } from "@/components/modules/analytics/analytics-dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Circulation & Collection Analytics | libra25 Admin",
  description:
    "Real-time library analytics, monthly circulation trends, category growth, overdue ratios, and reader cohort telemetry.",
};

export default async function AdminAnalyticsPage() {
  const { getToken } = await auth();
  const token = await getToken();

  let initialData;
  try {
    initialData = await fetchAnalyticsDataApi("90d", token);
  } catch (error) {
    console.error("Failed to load analytics data:", error);
    initialData = {
      kpis: {
        totalBooks: 0,
        totalCopies: 0,
        availableCopies: 0,
        borrowedCopies: 0,
        reservedCopies: 0,
        maintenanceCopies: 0,
        activeLoansCount: 0,
        overdueLoansCount: 0,
        totalLoansCount: 0,
        overdueRatio: 0,
        utilizationRate: 0,
        activeReadersCount: 0,
        averageCatalogRating: 0,
        totalFeedbacksCount: 0,
      },
      monthlyVolume: [],
      categoryDistribution: [],
      overdueTelemetry: {
        activeCount: 0,
        returnedCount: 0,
        overdueCount: 0,
        overdue1to7Days: 0,
        overdue8to14Days: 0,
        overdue15PlusDays: 0,
      },
      copyConditions: [],
      topBooks: [],
      topReaders: [],
      timeframe: "90d" as const,
      generatedAt: new Date().toISOString(),
    };
  }

  return <AnalyticsDashboard initialData={initialData} />;
}
