import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export type AnalyticsTimeframe = '30d' | '90d' | '6m' | '1y' | 'all';

export interface OverviewKPIs {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  borrowedCopies: number;
  reservedCopies: number;
  maintenanceCopies: number;
  activeLoansCount: number;
  overdueLoansCount: number;
  totalLoansCount: number;
  overdueRatio: number;
  utilizationRate: number;
  activeReadersCount: number;
  averageCatalogRating: number;
  totalFeedbacksCount: number;
}

export interface MonthlyBorrowVolume {
  month: string;
  label: string;
  borrows: number;
  returns: number;
}

export interface CategoryMetric {
  category: string;
  bookCount: number;
  copyCount: number;
  borrowCount: number;
  percentage: number;
}

export interface OverdueTelemetry {
  activeCount: number;
  returnedCount: number;
  overdueCount: number;
  overdue1to7Days: number;
  overdue8to14Days: number;
  overdue15PlusDays: number;
}

export interface CopyConditionMetric {
  condition: 'MINT' | 'GOOD' | 'FAIR' | 'DAMAGED';
  count: number;
  percentage: number;
}

export interface TopBorrowedBook {
  id: string;
  title: string;
  author: string;
  category: string;
  coverImageUrl: string | null;
  loanCount: number;
  totalCopies: number;
  availableCopies: number;
}

export interface TopReaderCohort {
  id: string;
  name: string;
  email: string;
  totalLoans: number;
  activeLoans: number;
}

export interface AnalyticsData {
  kpis: OverviewKPIs;
  monthlyVolume: MonthlyBorrowVolume[];
  categoryDistribution: CategoryMetric[];
  overdueTelemetry: OverdueTelemetry;
  copyConditions: CopyConditionMetric[];
  topBooks: TopBorrowedBook[];
  topReaders: TopReaderCohort[];
  timeframe: AnalyticsTimeframe;
  generatedAt: string;
}

export async function fetchAnalyticsDataApi(
  timeframe: AnalyticsTimeframe = '90d',
  token: string | null
): Promise<AnalyticsData> {
  const url = `${API_URL}/analytics?timeframe=${encodeURIComponent(timeframe)}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || 'Failed to fetch analytics data');
  }
  return json.data;
}

export function useAnalyticsData(timeframe: AnalyticsTimeframe = '90d') {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['admin', 'analytics', timeframe],
    queryFn: async () => {
      const token = await getToken();
      return fetchAnalyticsDataApi(timeframe, token);
    },
  });
}
