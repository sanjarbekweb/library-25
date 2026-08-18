import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AnalyticsTimeframe } from "@/lib/schemas/analytics-schema";
import { subDays, subMonths, subYears, startOfMonth, format, isAfter, isBefore } from "date-fns";

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
  overdueRatio: number; // percentage
  utilizationRate: number; // percentage
  activeReadersCount: number;
  averageCatalogRating: number;
  totalFeedbacksCount: number;
}

export interface MonthlyBorrowVolume {
  month: string; // YYYY-MM
  label: string; // e.g. "Jan 2026"
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
  condition: "MINT" | "GOOD" | "FAIR" | "DAMAGED";
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

/**
 * Calculates start date threshold for a given timeframe filter.
 */
function getStartDateForTimeframe(timeframe: AnalyticsTimeframe): Date {
  const now = new Date();
  switch (timeframe) {
    case "30d":
      return subDays(now, 30);
    case "90d":
      return subDays(now, 90);
    case "6m":
      return subMonths(now, 6);
    case "1y":
      return subYears(now, 1);
    case "all":
    default:
      return new Date(0); // Epoch start
  }
}

/**
 * Core business domain service for fetching library aggregate analytics.
 * Statically cached via Next.js unstable_cache (60s TTL).
 */
export const getCollectionAnalytics = unstable_cache(
  async (timeframe: AnalyticsTimeframe = "90d"): Promise<AnalyticsData> => {
  const now = new Date();
  const startDate = getStartDateForTimeframe(timeframe);

  // 1. Fetch overview statistics in parallel
  const [
    totalBooks,
    totalCopies,
    availableCopies,
    borrowedCopies,
    reservedCopies,
    maintenanceCopies,
    activeLoansCount,
    allOverdueLoansCount,
    totalLoansCount,
    feedbackAggregate,
    copyConditionCounts,
    allLoans,
    allBooksWithCopies,
  ] = await Promise.all([
    prisma.book.count(),
    prisma.bookCopy.count(),
    prisma.bookCopy.count({ where: { status: "AVAILABLE" } }),
    prisma.bookCopy.count({ where: { status: "BORROWED" } }),
    prisma.bookCopy.count({ where: { status: "RESERVED" } }),
    prisma.bookCopy.count({ where: { status: { in: ["MAINTENANCE", "LOST"] } } }),
    prisma.loan.count({ where: { status: "ACTIVE", dueDate: { gte: now } } }),
    prisma.loan.count({
      where: {
        OR: [
          { status: "OVERDUE" },
          { status: "ACTIVE", dueDate: { lt: now } },
        ],
      },
    }),
    prisma.loan.count(),
    prisma.feedback.aggregate({
      _avg: { rating: true },
      _count: { rating: true },
      where: { isModerated: false },
    }),
    prisma.bookCopy.groupBy({
      by: ["condition"],
      _count: { id: true },
    }),
    prisma.loan.findMany({
      where: timeframe === "all" ? {} : { borrowedAt: { gte: startDate } },
      select: {
        id: true,
        borrowedAt: true,
        returnedAt: true,
        dueDate: true,
        status: true,
        studentId: true,
        bookCopy: {
          select: {
            bookId: true,
          },
        },
      },
    }),
    prisma.book.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        category: true,
        coverImageUrl: true,
        copies: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    }),
  ]);

  // Derived KPI calculations
  const overdueRatio =
    activeLoansCount + allOverdueLoansCount > 0
      ? Number(((allOverdueLoansCount / (activeLoansCount + allOverdueLoansCount)) * 100).toFixed(1))
      : 0;

  const utilizationRate =
    totalCopies > 0
      ? Number((((borrowedCopies + reservedCopies) / totalCopies) * 100).toFixed(1))
      : 0;

  const averageRating = Number((feedbackAggregate._avg.rating || 0).toFixed(1));
  const totalFeedbacksCount = feedbackAggregate._count.rating || 0;

  // Distinct active readers count in timeframe
  const activeReaderIds = new Set(allLoans.map((l) => l.studentId));

  const kpis: OverviewKPIs = {
    totalBooks,
    totalCopies,
    availableCopies,
    borrowedCopies,
    reservedCopies,
    maintenanceCopies,
    activeLoansCount,
    overdueLoansCount: allOverdueLoansCount,
    totalLoansCount,
    overdueRatio,
    utilizationRate,
    activeReadersCount: activeReaderIds.size,
    averageCatalogRating: averageRating,
    totalFeedbacksCount,
  };

  // 2. Monthly Borrow Volume Trend Calculation
  // Generate last 6 months buckets minimum for clear visualization
  const monthMap = new Map<string, { label: string; borrows: number; returns: number }>();
  const monthsCount = timeframe === "30d" ? 3 : timeframe === "90d" ? 6 : 12;

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = subMonths(now, i);
    const key = format(d, "yyyy-MM");
    const label = format(d, "MMM yyyy");
    monthMap.set(key, { label, borrows: 0, returns: 0 });
  }

  for (const loan of allLoans) {
    const borrowKey = format(loan.borrowedAt, "yyyy-MM");
    if (monthMap.has(borrowKey)) {
      const entry = monthMap.get(borrowKey)!;
      entry.borrows += 1;
    }
    if (loan.returnedAt) {
      const returnKey = format(loan.returnedAt, "yyyy-MM");
      if (monthMap.has(returnKey)) {
        const entry = monthMap.get(returnKey)!;
        entry.returns += 1;
      }
    }
  }

  const monthlyVolume: MonthlyBorrowVolume[] = Array.from(monthMap.entries()).map(
    ([month, val]) => ({
      month,
      label: val.label,
      borrows: val.borrows,
      returns: val.returns,
    })
  );

  // 3. Category Distribution Aggregation
  const categoryMap = new Map<
    string,
    { bookCount: number; copyCount: number; borrowCount: number }
  >();

  const bookCategoryLookup = new Map<string, string>();
  for (const book of allBooksWithCopies) {
    bookCategoryLookup.set(book.id, book.category);
    const cat = book.category || "Uncategorized";
    const existing = categoryMap.get(cat) || { bookCount: 0, copyCount: 0, borrowCount: 0 };
    existing.bookCount += 1;
    existing.copyCount += book.copies.length;
    categoryMap.set(cat, existing);
  }

  for (const loan of allLoans) {
    const cat = bookCategoryLookup.get(loan.bookCopy.bookId) || "Uncategorized";
    const existing = categoryMap.get(cat);
    if (existing) {
      existing.borrowCount += 1;
    }
  }

  const categoryDistribution: CategoryMetric[] = Array.from(categoryMap.entries())
    .map(([category, stats]) => ({
      category,
      bookCount: stats.bookCount,
      copyCount: stats.copyCount,
      borrowCount: stats.borrowCount,
      percentage: totalCopies > 0 ? Number(((stats.copyCount / totalCopies) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.copyCount - a.copyCount);

  // 4. Overdue Telemetry & Age Breakdown
  let overdue1to7Days = 0;
  let overdue8to14Days = 0;
  let overdue15PlusDays = 0;
  let returnedCount = 0;
  let activeCount = 0;
  let overdueCount = 0;

  for (const loan of allLoans) {
    const isOverdue =
      loan.status === "OVERDUE" || (loan.status === "ACTIVE" && isBefore(loan.dueDate, now));

    if (loan.status === "RETURNED") {
      returnedCount += 1;
    } else if (isOverdue) {
      overdueCount += 1;
      const daysOverdue = Math.floor((now.getTime() - loan.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysOverdue <= 7) {
        overdue1to7Days += 1;
      } else if (daysOverdue <= 14) {
        overdue8to14Days += 1;
      } else {
        overdue15PlusDays += 1;
      }
    } else {
      activeCount += 1;
    }
  }

  const overdueTelemetry: OverdueTelemetry = {
    activeCount,
    returnedCount,
    overdueCount,
    overdue1to7Days,
    overdue8to14Days,
    overdue15PlusDays,
  };

  // 5. Physical Copy Condition Distribution
  const conditionOrder: Array<"MINT" | "GOOD" | "FAIR" | "DAMAGED"> = [
    "MINT",
    "GOOD",
    "FAIR",
    "DAMAGED",
  ];
  const copyConditions: CopyConditionMetric[] = conditionOrder.map((cond) => {
    const found = copyConditionCounts.find((c) => c.condition === cond);
    const count = found ? found._count.id : 0;
    const percentage = totalCopies > 0 ? Number(((count / totalCopies) * 100).toFixed(1)) : 0;
    return {
      condition: cond,
      count,
      percentage,
    };
  });

  // 6. Top Borrowed Books Leaderboard
  const bookLoanCountMap = new Map<string, number>();
  for (const loan of allLoans) {
    const bId = loan.bookCopy.bookId;
    bookLoanCountMap.set(bId, (bookLoanCountMap.get(bId) || 0) + 1);
  }

  const topBooks: TopBorrowedBook[] = allBooksWithCopies
    .map((book) => {
      const loanCount = bookLoanCountMap.get(book.id) || 0;
      const availableCount = book.copies.filter((c) => c.status === "AVAILABLE").length;
      return {
        id: book.id,
        title: book.title,
        author: book.author,
        category: book.category,
        coverImageUrl: book.coverImageUrl,
        loanCount,
        totalCopies: book.copies.length,
        availableCopies: availableCount,
      };
    })
    .sort((a, b) => b.loanCount - a.loanCount)
    .slice(0, 6);

  // 7. Active Reader Cohorts (Top Borrowers)
  const readerLoanMap = new Map<string, { total: number; active: number }>();
  for (const loan of allLoans) {
    const sId = loan.studentId;
    const stats = readerLoanMap.get(sId) || { total: 0, active: 0 };
    stats.total += 1;
    if (loan.status === "ACTIVE" || loan.status === "OVERDUE") {
      stats.active += 1;
    }
    readerLoanMap.set(sId, stats);
  }

  const topStudentIds = Array.from(readerLoanMap.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)
    .map(([sId]) => sId);

  const topStudents = await prisma.user.findMany({
    where: { id: { in: topStudentIds } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  const topReaders: TopReaderCohort[] = topStudents
    .map((student) => {
      const stats = readerLoanMap.get(student.id) || { total: 0, active: 0 };
      return {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        totalLoans: stats.total,
        activeLoans: stats.active,
      };
    })
    .sort((a, b) => b.totalLoans - a.totalLoans);

  return {
    kpis,
    monthlyVolume,
    categoryDistribution,
    overdueTelemetry,
    copyConditions,
    topBooks,
    topReaders,
    timeframe,
    generatedAt: now.toISOString(),
  };
},
["collection-analytics"],
{ revalidate: 60, tags: ["analytics"] }
);
