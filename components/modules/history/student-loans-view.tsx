"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { formatTashkentDate } from "@/lib/utils/tashkent-time";
import {
  BookMarked,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Calendar,
  ShieldAlert,
  Star,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StudentLoansOverview, StudentLoanItem } from "@/lib/services/history-service";
import { SubmitFeedbackModal } from "@/components/modules/feedback/submit-feedback-modal";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

interface StudentLoansViewProps {
  overview: StudentLoansOverview;
}

export function StudentLoansView({ overview }: StudentLoansViewProps) {
  const { t, language } = useLanguage();
  const { stats, activeLoans, historicalLoans } = overview;
  const [selectedLoanForFeedback, setSelectedLoanForFeedback] = useState<StudentLoanItem | null>(null);

  const activeLoansSubtext = language === "uz" ? "Hozirda qo'ldagi kitoblar" : language === "ru" ? "Книги на руках" : "Currently checked out";
  const overdueSubtext = language === "uz" ? "Qaytarish muddati o'tgan" : language === "ru" ? "Просрочен срок возврата" : "Past due return deadline";
  const returnedSubtext = language === "uz" ? "Qaytarilgan kitoblar" : language === "ru" ? "Возвращено в библиотеку" : "Completed returns";
  const totalBorrowedSubtext = language === "uz" ? "Jami olingan kitoblar" : language === "ru" ? "Всего выдано за все время" : "Lifetime checkouts";

  const attentionBannerTitle = language === "uz"
    ? `Diqqat: Sizda ${stats.overdueLoansCount} ta muddati o'tgan kitob mavjud!`
    : language === "ru"
    ? `Внимание: У вас ${stats.overdueLoansCount} просроченных книг!`
    : `Attention: You have ${stats.overdueLoansCount} overdue book copy${stats.overdueLoansCount > 1 ? "s" : ""}!`;

  const attentionBannerText = language === "uz"
    ? "Iltimos, kechikish to'lovlari yoki hisob cheklanishini oldini olish uchun kitoblarni zudlik bilan kutubxona ijara stoliga qaytaring."
    : language === "ru"
    ? "Пожалуйста, верните просроченные книги на стойку выдачи как можно скорее во избежание штрафов и блокировки."
    : "Please return your overdue books to the Circulation Desk as soon as possible to avoid late fees or account suspension.";

  const noActiveCheckoutsTitle = language === "uz" ? "Faol ijaradagi kitoblar yo'q" : language === "ru" ? "Нет книг на руках" : "No Active Checkouts";
  const noActiveCheckoutsSubtitle = language === "uz"
    ? "Hozirda sizda olingan kitoblar mavjud emas. Katalogdan kitob tanlab band qilishingiz mumkin."
    : language === "ru"
    ? "В данный момент у вас нет книг на руках. Выберите книгу в каталоге для бронирования."
    : "You do not have any physical books checked out at the moment. Browse the library catalog to reserve available titles.";

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <h1 className="text-2xl font-bold font-display text-foreground">
          {t("myLoans")}
        </h1>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border bg-card shadow-sm rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              {t("activeLoans")}
            </span>
            <BookMarked className="h-4 w-4 text-brand-blue" />
          </div>
          <p className="text-2xl font-bold font-display mt-2 text-foreground">
            {stats.activeLoansCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{activeLoansSubtext}</p>
        </Card>

        <Card className={cn(
          "border-border bg-card shadow-sm rounded-2xl p-4",
          stats.overdueLoansCount > 0 && "border-rose-300 bg-rose-50/50 dark:bg-rose-950/20 dark:border-rose-800"
        )}>
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-xs font-semibold uppercase text-muted-foreground",
              stats.overdueLoansCount > 0 && "text-rose-700 dark:text-rose-300 font-semibold"
            )}>
              {t("overdue")}
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
          <p className="text-[11px] text-muted-foreground mt-0.5">{overdueSubtext}</p>
        </Card>

        <Card className="border-border bg-card shadow-sm rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              {t("returnedLoans")}
            </span>
            <CheckCircle2 className="h-4 w-4 text-brand-blue" />
          </div>
          <p className="text-2xl font-bold font-display mt-2 text-foreground">
            {stats.returnedLoansCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{returnedSubtext}</p>
        </Card>

        <Card className="border-border bg-card shadow-sm rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              {language === "uz" ? "Jami ijaralar" : language === "ru" ? "Всего выдач" : "Total Borrowed"}
            </span>
            <BookOpen className="h-4 w-4 text-brand-blue" />
          </div>
          <p className="text-2xl font-bold font-display mt-2 text-foreground">
            {stats.totalLoansCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{totalBorrowedSubtext}</p>
        </Card>
      </div>

      {/* Overdue High Priority Banner */}
      {stats.overdueLoansCount > 0 && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-destructive shadow-sm flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive text-destructive-foreground font-bold shadow-sm">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display">
              {attentionBannerTitle}
            </h3>
            <p className="text-xs mt-1 opacity-90 leading-relaxed">
              {attentionBannerText}
            </p>
          </div>
        </div>
      )}

      {/* Section 1: Active Checkouts & Due Date Countdown */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5 text-brand-blue" />
          {t("activeLoans")} ({activeLoans.length})
        </h2>

        {activeLoans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLoans.map((loan) => (
              <Card
                key={loan.id}
                className={cn(
                  "border-border bg-card shadow-xs rounded-2xl overflow-hidden transition-all hover:border-border/80",
                  loan.isOverdue && "border-destructive/40 ring-1 ring-destructive/30"
                )}
              >
                <CardContent className="p-5 flex gap-4">
                  {/* Book Cover */}
                  <div className="relative w-20 h-28 rounded-xl bg-muted shrink-0 overflow-hidden border border-border shadow-xs flex items-center justify-center text-muted-foreground">
                    {loan.coverImageUrl ? (
                      <Image
                        src={loan.coverImageUrl}
                        alt={`Book cover image for borrowed loan "${loan.bookTitle}"`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <BookOpen className="h-8 w-8 text-muted-foreground/40" />
                    )}
                  </div>

                  {/* Loan Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-accent text-accent-foreground border border-border">
                          {loan.category}
                        </span>
                        <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
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
                          <span>{t("borrowedDate")}: {formatTashkentDate(loan.borrowedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-foreground">
                          <Clock className="h-3 w-3 text-brand-blue" />
                          <span>{t("dueDate")}: {formatTashkentDate(loan.dueDate)}</span>
                        </div>
                      </div>

                      {loan.isOverdue ? (
                        <div className="px-3 py-1 rounded-full text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>{loan.daysOverdue} {t("daysOverdue")}</span>
                        </div>
                      ) : loan.daysRemaining <= 3 ? (
                        <div className="px-3 py-1 rounded-full text-xs font-bold bg-muted text-foreground border border-border flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-brand-blue" />
                          <span>{loan.daysRemaining} {t("daysLeft")}</span>
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-brand-blue/10 text-brand-blue dark:text-blue-400 border border-brand-blue/20 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{t("onTime")} ({loan.daysRemaining} {t("daysLeft")})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card space-y-3">
            <BookMarked className="h-8 w-8 mx-auto text-muted-foreground/40" />
            <h3 className="font-display font-bold text-sm text-foreground">
              {noActiveCheckoutsTitle}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {noActiveCheckoutsSubtitle}
            </p>
            <div className="pt-1">
              <Link href="/catalog">
                <Button size="sm" className="rounded-full bg-brand-blue text-white hover:bg-brand-blue/90 text-xs font-semibold cursor-pointer">
                  {t("browseCatalog")}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Section 2: Historical Returned Loans */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-brand-blue" />
          {t("returnedLoans")} ({historicalLoans.length})
        </h2>

        {historicalLoans.length > 0 ? (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-semibold text-xs uppercase">{language === "uz" ? "Kitob nomi" : language === "ru" ? "Название книги" : "Book Title"}</TableHead>
                  <TableHead className="font-semibold text-xs uppercase">{language === "uz" ? "Shtrix-kod" : language === "ru" ? "Штрих-код" : "Barcode"}</TableHead>
                  <TableHead className="font-semibold text-xs uppercase">{t("borrowedDate")}</TableHead>
                  <TableHead className="font-semibold text-xs uppercase">{language === "uz" ? "Qaytarilgan sana" : language === "ru" ? "Дата возврата" : "Returned On"}</TableHead>
                  <TableHead className="font-semibold text-xs uppercase">{language === "uz" ? "Holati" : language === "ru" ? "Состояние" : "Condition"}</TableHead>
                  <TableHead className="font-semibold text-xs uppercase text-right">{t("reviewsAndRatings")}</TableHead>
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
                    <TableCell className="text-xs font-semibold text-muted-foreground">
                      {loan.copyBarcode}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(loan.borrowedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-foreground">
                      {loan.returnedAt ? format(new Date(loan.returnedAt), "MMM d, yyyy") : (language === "uz" ? "Qaytarilgan" : language === "ru" ? "Возвращено" : "Returned")}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border border-border bg-muted text-foreground">
                        {loan.condition}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {loan.feedback ? (
                        <div className="inline-flex items-center gap-1 text-xs font-semibold text-foreground bg-accent px-2.5 py-1 rounded-full border border-border">
                          <Star className="h-3.5 w-3.5 fill-brand-blue text-brand-blue" />
                          <span>{loan.feedback.rating} / 5</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedLoanForFeedback(loan)}
                          className="rounded-full text-xs font-medium gap-1.5 border-border hover:bg-accent text-foreground cursor-pointer"
                        >
                          <Star className="h-3.5 w-3.5 fill-brand-blue text-brand-blue" />
                          <span>{t("leaveReview")}</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center bg-card">
            <p className="text-xs text-muted-foreground italic">
              {language === "uz" ? "Qaytarilgan kitoblar tarixi hozircha bo'sh." : language === "ru" ? "История возвратов пока пуста." : "No historical returns logged yet. Your returned loans will be listed here."}
            </p>
          </div>
        )}
      </section>

      {/* Submit Feedback Modal Dialog */}
      {selectedLoanForFeedback && (
        <SubmitFeedbackModal
          isOpen={selectedLoanForFeedback !== null}
          onClose={() => setSelectedLoanForFeedback(null)}
          loanId={selectedLoanForFeedback.loanId}
          bookTitle={selectedLoanForFeedback.bookTitle}
          bookAuthor={selectedLoanForFeedback.bookAuthor}
        />
      )}
    </div>
  );
}
