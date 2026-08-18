"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  BookMarked,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Calendar,
  UserCheck,
  QrCode,
  ArrowRight,
  ShieldAlert,
  Bookmark,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentLoansOverview, StudentLoanItem } from "@/lib/services/history-service";
import { cn } from "@/lib/utils";

interface StudentLoansViewProps {
  overview: StudentLoansOverview;
}

export function StudentLoansView({ overview }: StudentLoansViewProps) {
  const { stats, activeLoans, historicalLoans, user } = overview;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-foreground flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-yellow/20 text-foreground border border-brand-yellow/30 shadow-sm">
              <BookMarked className="h-5 w-5 text-foreground" />
            </div>
            My Borrowed Loans & History
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your active checkouts, return due dates, overdue alerts, and reading history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/reservations">
            <Button variant="outline" size="sm" className="rounded-full gap-2">
              <Bookmark className="h-4 w-4 text-brand-yellow fill-current" />
              <span>View My Holds</span>
            </Button>
          </Link>
          <Link href="/">
            <Button size="sm" className="rounded-full gap-2 bg-brand-blue text-white hover:bg-brand-blue/90 font-medium">
              <BookOpen className="h-4 w-4" />
              <span>Browse Catalog</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border bg-card shadow-sm rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted-foreground">
              Active Loans
            </span>
            <BookMarked className="h-4 w-4 text-brand-blue" />
          </div>
          <p className="text-2xl font-bold font-display mt-2 text-foreground">
            {stats.activeLoansCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Currently checked out</p>
        </Card>

        <Card className={cn(
          "border-border bg-card shadow-sm rounded-2xl p-4",
          stats.overdueLoansCount > 0 && "border-rose-300 bg-rose-50/50 dark:bg-rose-950/20 dark:border-rose-800"
        )}>
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-xs font-mono uppercase text-muted-foreground",
              stats.overdueLoansCount > 0 && "text-rose-700 dark:text-rose-300 font-semibold"
            )}>
              Overdue
            </span>
            <AlertTriangle className={cn(
              "h-4 w-4 text-amber-500",
              stats.overdueLoansCount > 0 && "text-rose-600 animate-pulse"
            )} />
          </div>
          <p className={cn(
            "text-2xl font-bold font-display mt-2 text-foreground",
            stats.overdueLoansCount > 0 && "text-rose-700 dark:text-rose-300"
          )}>
            {stats.overdueLoansCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Past due return deadline</p>
        </Card>

        <Card className="border-border bg-card shadow-sm rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted-foreground">
              Returned
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-display mt-2 text-foreground">
            {stats.returnedLoansCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Completed returns</p>
        </Card>

        <Card className="border-border bg-card shadow-sm rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-muted-foreground">
              Total Borrowed
            </span>
            <BookOpen className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold font-display mt-2 text-foreground">
            {stats.totalLoansCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Lifetime checkouts</p>
        </Card>
      </div>

      {/* Overdue High Priority Banner */}
      {stats.overdueLoansCount > 0 && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-5 text-rose-900 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-200 shadow-sm flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white font-bold shadow-sm">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display">
              Attention: You have {stats.overdueLoansCount} overdue book copy{stats.overdueLoansCount > 1 ? "s" : ""}!
            </h3>
            <p className="text-xs mt-1 text-rose-800 dark:text-rose-300 leading-relaxed">
              Please return your overdue books to the Circulation Desk as soon as possible to avoid late fees or account suspension. Contact library staff if you need assistance.
            </p>
          </div>
        </div>
      )}

      {/* Section 1: Active Checkouts & Due Date Countdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand-blue" />
            Active Checkouts ({activeLoans.length})
          </h2>
        </div>

        {activeLoans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLoans.map((loan) => (
              <Card
                key={loan.id}
                className={cn(
                  "border-border bg-card shadow-sm rounded-2xl overflow-hidden transition-all hover:border-border/80",
                  loan.isOverdue && "border-rose-300 dark:border-rose-800 ring-1 ring-rose-300 dark:ring-rose-800"
                )}
              >
                <CardContent className="p-5 flex gap-4">
                  {/* Book Cover / Thumbnail Placeholder */}
                  <div className="w-20 h-28 rounded-xl bg-muted shrink-0 overflow-hidden border border-border shadow-xs flex items-center justify-center text-muted-foreground">
                    {loan.coverImageUrl ? (
                      /* eslint-disable-next-html-link */
                      <img
                        src={loan.coverImageUrl}
                        alt={loan.bookTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="h-8 w-8 text-muted-foreground/40" />
                    )}
                  </div>

                  {/* Loan Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-accent text-accent-foreground border">
                          {loan.category}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {loan.copyBarcode}
                        </span>
                      </div>

                      <Link
                        href={`/books/${loan.bookId}`}
                        className="font-display font-bold text-base text-foreground hover:text-brand-blue line-clamp-1 mt-1 block"
                      >
                        {loan.bookTitle}
                      </Link>
                      <p className="text-xs text-muted-foreground">by {loan.bookAuthor}</p>
                    </div>

                    {/* Status & Countdown Badges */}
                    <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[11px] text-muted-foreground space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Borrowed: {format(new Date(loan.borrowedAt), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-foreground">
                          <Clock className="h-3 w-3 text-brand-blue" />
                          <span>Due: {format(new Date(loan.dueDate), "MMM d, yyyy")}</span>
                        </div>
                      </div>

                      {loan.isOverdue ? (
                        <div className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300 dark:border-rose-800 flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>{loan.daysOverdue} Day{loan.daysOverdue > 1 ? "s" : ""} Overdue</span>
                        </div>
                      ) : loan.daysRemaining <= 3 ? (
                        <div className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          <span>Due Soon ({loan.daysRemaining} day{loan.daysRemaining === 1 ? "" : "s"} left)</span>
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Active ({loan.daysRemaining} days left)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border bg-card shadow-sm rounded-2xl p-8 text-center">
            <BookMarked className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <h3 className="font-display font-bold text-base text-foreground">
              No Active Checkouts
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
              You do not have any physical books checked out at the moment. Browse the library catalog to reserve available titles.
            </p>
            <div className="mt-4">
              <Link href="/">
                <Button size="sm" className="rounded-full bg-brand-blue text-white hover:bg-brand-blue/90">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>

      {/* Section 2: Historical Returned Loans */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Past Return History ({historicalLoans.length})
          </h2>
        </div>

        {historicalLoans.length > 0 ? (
          <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-mono text-xs uppercase">Book Title</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Barcode</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Borrowed On</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Returned On</TableHead>
                  <TableHead className="font-mono text-xs uppercase">Condition</TableHead>
                  <TableHead className="font-mono text-xs uppercase text-right">Desk Staff</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historicalLoans.map((loan) => (
                  <TableRow key={loan.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground">
                      <Link href={`/books/${loan.bookId}`} className="hover:text-brand-blue font-display">
                        {loan.bookTitle}
                      </Link>
                      <p className="text-xs text-muted-foreground font-normal">by {loan.bookAuthor}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {loan.copyBarcode}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {format(new Date(loan.borrowedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {loan.returnedAt ? format(new Date(loan.returnedAt), "MMM d, yyyy") : "Returned"}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[11px] font-mono border",
                        loan.condition === "MINT" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                        loan.condition === "GOOD" && "bg-blue-50 text-blue-700 border-blue-200",
                        loan.condition === "FAIR" && "bg-amber-50 text-amber-700 border-amber-200",
                        loan.condition === "DAMAGED" && "bg-rose-50 text-rose-700 border-rose-200"
                      )}>
                        {loan.condition}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground text-right font-medium">
                      {loan.assistantName}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Card className="border-border bg-card shadow-sm rounded-2xl p-6 text-center">
            <p className="text-xs text-muted-foreground italic">
              No historical returns logged yet. Your returned loans will be listed here.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
