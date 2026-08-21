"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Star,
  Layers,
  ArrowUpRight,
  Shield,
  RefreshCw,
  BookMarked,
  Sparkles,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AnalyticsData } from "@/lib/services/analytics-service";
import { AnalyticsTimeframe } from "@/lib/schemas/analytics-schema";
import { getAnalyticsDataAction } from "@/app/actions/analytics-actions";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

interface AnalyticsDashboardProps {
  initialData: AnalyticsData;
}

export function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
  const { t, language } = useLanguage();
  const [data, setData] = useState<AnalyticsData>(initialData);
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>(initialData.timeframe);
  const [isPending, startTransition] = useTransition();

  const handleTimeframeChange = (newTimeframe: AnalyticsTimeframe) => {
    setTimeframe(newTimeframe);
    startTransition(async () => {
      const response = await getAnalyticsDataAction(newTimeframe);
      if (response.ok && response.data) {
        setData(response.data);
      }
    });
  };

  const timeframeLabels: Record<AnalyticsTimeframe, string> = {
    "30d": t("timeframe30d"),
    "90d": t("timeframe90d"),
    "6m": t("timeframe6m"),
    "1y": t("timeframe1y"),
    all: t("timeframeAll"),
  };

  // Find max borrow volume for relative bar height calculations
  const maxMonthlyVolume = Math.max(
    ...data.monthlyVolume.map((m) => Math.max(m.borrows, m.returns)),
    1
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full w-9 h-9 border border-border hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer shadow-2xs"
              title="Back to Admin"
              aria-label="Back to Admin"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-display text-foreground">
            Analytics
          </h1>
        </div>

        {/* Timeframe Filter Selector */}
        <div className="flex items-center gap-1.5 bg-card border border-border p-1 rounded-2xl shadow-2xs overflow-x-auto max-w-full">
          {(["30d", "90d", "6m", "1y", "all"] as AnalyticsTimeframe[]).map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? "default" : "ghost"}
              size="sm"
              disabled={isPending}
              onClick={() => handleTimeframeChange(tf)}
              className={cn(
                "rounded-xl text-xs font-semibold px-3 py-1.5 h-8 transition-all whitespace-nowrap cursor-pointer",
                timeframe === tf
                  ? "bg-brand-blue text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {timeframeLabels[tf]}
            </Button>
          ))}
        </div>
      </div>

      {/* 4 Core Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Collection Size */}
        <Card className="border-border bg-card shadow-sm rounded-2xl hover:border-brand-blue/40 transition-all">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Collection
              </span>
              <div className="p-2 rounded-xl bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-display text-foreground">
                {data.kpis.totalBooks}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {data.kpis.totalCopies} physical copies
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-border/50 text-xs text-muted-foreground">
              <span className="font-semibold text-emerald-600">
                {data.kpis.availableCopies} Available
              </span>
              <span>•</span>
              <span>{data.kpis.borrowedCopies} Borrowed</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Active Loans & Overdue Ratio */}
        <Card className="border-border bg-card shadow-sm rounded-2xl hover:border-rose-500/40 transition-all">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Active Loans &amp; Overdue
              </span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-display text-foreground">
                {data.kpis.activeLoansCount + data.kpis.overdueLoansCount}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full border",
                  data.kpis.overdueRatio > 15
                    ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                )}
              >
                {data.kpis.overdueRatio}% Overdue Ratio
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs text-muted-foreground">
              <span>{data.kpis.activeLoansCount} Active Loans</span>
              <span className="font-semibold text-rose-600">
                {data.kpis.overdueLoansCount} Overdue
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Library Utilization Rate */}
        <Card className="border-border bg-card shadow-sm rounded-2xl hover:border-amber-500/40 transition-all">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Inventory Utilization
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-display text-foreground">
                {data.kpis.utilizationRate}%
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Copies in active circulation
              </span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(data.kpis.utilizationRate, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Catalog Ratings & Readers */}
        <Card className="border-border bg-card shadow-sm rounded-2xl hover:border-brand-blue/40 transition-all">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Catalog Rating &amp; Readers
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
                <Star className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-display text-foreground flex items-center gap-1.5">
                {data.kpis.averageCatalogRating}
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {data.kpis.totalFeedbacksCount} reviews
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Users className="w-3.5 h-3.5 text-brand-blue" />
                {data.kpis.activeReadersCount} Active Readers
              </span>
              <span>{data.kpis.totalLoansCount} Total Borrows</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts & Telemetry Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Borrow Volume Visual Bar Chart (Spans 2 Cols) */}
        <Card className="lg:col-span-2 border-border bg-card shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg font-bold font-display text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-brand-blue" />
                  Monthly Borrowing Volume &amp; Returns
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Circulation velocity trends across months for {timeframeLabels[timeframe]}
                </CardDescription>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium self-start sm:self-auto">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-md bg-brand-blue" />
                  <span>Borrows</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-md bg-emerald-500" />
                  <span>Returns</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="h-64 w-full flex items-end justify-between gap-3 sm:gap-6 px-2 border-b border-border pb-2">
              {data.monthlyVolume.map((item) => {
                const borrowHeightPercent = Math.round((item.borrows / maxMonthlyVolume) * 100);
                const returnHeightPercent = Math.round((item.returns / maxMonthlyVolume) * 100);

                return (
                  <div
                    key={item.month}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                  >
                    <div className="w-full flex items-end justify-center gap-1.5 h-full pt-4">
                      {/* Borrow Bar */}
                      <div
                        className="w-full max-w-[20px] sm:max-w-[28px] bg-brand-blue rounded-t-lg transition-all duration-300 group-hover:brightness-110 relative"
                        style={{ height: `${Math.max(borrowHeightPercent, 4)}%` }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-foreground text-background px-1.5 py-0.5 rounded shadow">
                          {item.borrows}
                        </span>
                      </div>

                      {/* Return Bar */}
                      <div
                        className="w-full max-w-[20px] sm:max-w-[28px] bg-emerald-500 rounded-t-lg transition-all duration-300 group-hover:brightness-110 relative"
                        style={{ height: `${Math.max(returnHeightPercent, 4)}%` }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-foreground text-background px-1.5 py-0.5 rounded shadow">
                          {item.returns}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground truncate w-full text-center">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution Breakdown (1 Col) */}
        <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold font-display text-foreground flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-blue" />
              Category Breakdown
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Inventory distribution across catalog categories
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {data.categoryDistribution.slice(0, 5).map((cat) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-foreground truncate max-w-[150px]">{cat.category}</span>
                  <span className="text-muted-foreground font-mono">
                    {cat.copyCount} copies ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-muted/40 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brand-blue h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {data.categoryDistribution.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">
                No catalog categories recorded yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Overdue Telemetry & Aging Breakdown */}
        <Card className="border-border bg-card shadow-sm rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold font-display text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Overdue Severity Telemetry
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Loan status breakdown and aging profile of past-due copies
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="block text-lg font-bold text-emerald-600">
                  {data.overdueTelemetry.activeCount}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase">
                  Active
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-brand-blue/10 border border-brand-blue/20">
                <span className="block text-lg font-bold text-brand-blue">
                  {data.overdueTelemetry.returnedCount}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase">
                  Returned
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="block text-lg font-bold text-rose-600">
                  {data.overdueTelemetry.overdueCount}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase">
                  Overdue
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <span className="text-xs font-semibold text-foreground">Overdue Aging Buckets</span>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">1–7 Days Overdue</span>
                  <span className="font-bold text-foreground">
                    {data.overdueTelemetry.overdue1to7Days}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">8–14 Days Overdue</span>
                  <span className="font-bold text-foreground">
                    {data.overdueTelemetry.overdue8to14Days}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">15+ Days Overdue</span>
                  <span className="font-bold text-rose-600">
                    {data.overdueTelemetry.overdue15PlusDays}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Copy Health & Condition Breakdown */}
        <Card className="border-border bg-card shadow-sm rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold font-display text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              Copy Condition Health
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Physical condition distribution across all inventory items
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {data.copyConditions.map((cond) => {
              const badgeColors: Record<string, string> = {
                MINT: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                GOOD: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
                FAIR: "bg-amber-500/10 text-amber-600 border-amber-500/20",
                DAMAGED: "bg-rose-500/10 text-rose-600 border-rose-500/20",
              };
              return (
                <div
                  key={cond.condition}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20"
                >
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-bold border",
                      badgeColors[cond.condition] || "bg-muted text-muted-foreground"
                    )}
                  >
                    {cond.condition}
                  </span>
                  <div className="text-right font-mono text-xs">
                    <span className="font-bold text-foreground">{cond.count} copies</span>
                    <span className="text-muted-foreground ml-2">({cond.percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Active Reader Cohorts */}
        <Card className="border-border bg-card shadow-sm rounded-2xl md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold font-display text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-blue" />
              Top Active Readers
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Most active student borrowers in timeframe
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {data.topReaders.map((reader, idx) => (
              <div
                key={reader.id}
                className="flex items-center justify-between border-b border-border/50 pb-2.5 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue font-bold text-xs">
                    #{idx + 1}
                  </div>
                  <div className="truncate">
                    <span className="block text-xs font-bold text-foreground truncate">
                      {reader.name}
                    </span>
                    <span className="block text-[11px] text-muted-foreground truncate">
                      {reader.email}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="block text-xs font-extrabold text-foreground font-mono">
                    {reader.totalLoans} borrows
                  </span>
                  {reader.activeLoans > 0 && (
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      {reader.activeLoans} active
                    </span>
                  )}
                </div>
              </div>
            ))}
            {data.topReaders.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">
                No active reader activity recorded.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Borrowed Books Leaderboard Table */}
      <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold font-display text-foreground flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-brand-yellow" />
                Most Popular Catalog Titles
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Top checked-out books across the collection
              </CardDescription>
            </div>
            <Link href="/books">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs font-semibold gap-1 hover:bg-accent"
              >
                <span>Full Catalog</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-y border-border text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Title &amp; Author</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Total Loans</th>
                  <th className="py-3 px-4 text-center">Total Copies</th>
                  <th className="py-3 px-4 text-right">Available Copies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.topBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/books/${book.id}`}
                        className="font-bold text-foreground hover:text-brand-blue transition-colors block"
                      >
                        {book.title}
                      </Link>
                      <span className="text-muted-foreground text-[11px]">{book.author}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                        {book.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-foreground font-mono text-sm">
                      {book.loanCount}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-muted-foreground">
                      {book.totalCopies}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                          book.availableCopies > 0
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        )}
                      >
                        {book.availableCopies} available
                      </span>
                    </td>
                  </tr>
                ))}
                {data.topBooks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground text-xs">
                      No borrow activity recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Exit Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6 pb-2">
        <p className="text-xs text-muted-foreground">
          Viewing collection growth &amp; circulation analytics dashboard.
        </p>
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-2 text-xs font-semibold hover:bg-accent border-border"
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              <span>Back to Admin Hub</span>
            </Button>
          </Link>
          <Link href="/catalog">
            <Button
              size="sm"
              className="rounded-full gap-2 text-xs font-semibold bg-brand-blue text-white hover:bg-brand-blue/90"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Admin Console</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
