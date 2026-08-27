"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  Star,
  ShieldAlert,
  Eye,
  EyeOff,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  BookOpen,
  MessageSquareQuote,
  Loader2,
  AlertCircle,
  AlertTriangle,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/providers/language-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { AdminFeedbackResult, AdminFeedbackItem } from "@/lib/services/feedback-service";
import { moderateFeedbackAction, deleteFeedbackAction } from "@/app/actions/feedback-actions";
import { cn } from "@/lib/utils";

import { toast } from "react-toastify";

interface AdminFeedbackModerationProps {
  initialData: AdminFeedbackResult;
  currentStatus: "all" | "published" | "moderated";
  currentSearch: string;
}

export function AdminFeedbackModeration({
  initialData,
  currentStatus,
  currentSearch,
}: AdminFeedbackModerationProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState<string>(currentSearch);
  const [feedbackToDelete, setFeedbackToDelete] = useState<AdminFeedbackItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { feedbacks, stats, pagination } = initialData;

  const handleFilterStatus = (status: "all" | "published" | "moderated") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", status);
    params.set("page", "1");
    router.push(`/admin/feedback?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`/admin/feedback?${params.toString()}`);
  };

  const handleToggleModeration = (item: AdminFeedbackItem) => {
    setActionError(null);
    const willBeModerated = !item.isModerated;
    startTransition(async () => {
      const res = await moderateFeedbackAction({
        feedbackId: item.id,
        isModerated: willBeModerated,
      });

      if (!res.ok) {
        const errMsg = res.error?.message || "Failed to update review moderation status.";
        setActionError(errMsg);
        toast.error(errMsg);
      } else {
        toast.success(
          willBeModerated
            ? `Review hidden from public catalog`
            : `Review published to public catalog`
        );
        router.refresh();
      }
    });
  };

  const handleDeleteConfirm = async () => {
    if (!feedbackToDelete) return;
    setIsDeleting(true);
    setActionError(null);

    const res = await deleteFeedbackAction({
      feedbackId: feedbackToDelete.id,
    });

    setIsDeleting(false);

    if (!res.ok) {
      const errMsg = res.error?.message || "Failed to delete review.";
      setActionError(errMsg);
      toast.error(errMsg);
    } else {
      toast.info("Review deleted permanently");
      setFeedbackToDelete(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
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
          <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">
            {t("feedbackModeration")}
          </h1>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-border bg-card shadow-sm rounded-2xl p-3.5 sm:p-4 hover:border-foreground/20 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs uppercase font-semibold">{t("totalReviews")}</span>
            <MessageSquareQuote className="h-4 w-4 text-brand-blue shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-display mt-2 text-foreground">
            {stats.totalCount}
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">{language === "uz" ? "Tizimdagi barcha sharhlar" : language === "ru" ? "Всего отзывов в системе" : "Submitted across system"}</p>
        </Card>

        <Card className="border border-border bg-card shadow-sm rounded-2xl p-3.5 sm:p-4 hover:border-foreground/20 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs uppercase font-semibold">{t("publishedPublic")}</span>
            <CheckCircle2 className="h-4 w-4 text-brand-blue shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-display mt-2 text-foreground">
            {stats.publishedCount}
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">{language === "uz" ? "Katalogda ko'rinadigan" : language === "ru" ? "Отображаются в каталоге" : "Visible on catalog detail"}</p>
        </Card>

        <Card className="border border-border bg-card shadow-sm rounded-2xl p-3.5 sm:p-4 hover:border-foreground/20 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs uppercase font-semibold">{t("moderatedHidden")}</span>
            <EyeOff className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-display mt-2 text-foreground">
            {stats.moderatedCount}
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">{language === "uz" ? "Katalogdan yashirilgan" : language === "ru" ? "Скрыто из каталога" : "Hidden from public catalog"}</p>
        </Card>

        <Card className="border border-border bg-card shadow-sm rounded-2xl p-3.5 sm:p-4 hover:border-foreground/20 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs uppercase font-semibold">{t("systemAvgRating")}</span>
            <Star className="h-4 w-4 fill-brand-blue text-brand-blue shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-display mt-2 text-foreground">
            {stats.averageRating ? `${stats.averageRating} / 5` : "N/A"}
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">{language === "uz" ? "O'rtacha baho" : language === "ru" ? "Средний балл" : "Verified loan average"}</p>
        </Card>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-card p-3.5 sm:p-4 rounded-2xl border border-border shadow-sm hover:border-foreground/20 transition-all">
        {/* Status Tab Filters (Horizontal scroll on mobile) */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl overflow-x-auto scrollbar-none shrink-0">
          <button
            type="button"
            onClick={() => handleFilterStatus("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap min-h-[32px]",
              currentStatus === "all"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All ({stats.totalCount})
          </button>
          <button
            type="button"
            onClick={() => handleFilterStatus("published")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap min-h-[32px]",
              currentStatus === "published"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Published ({stats.publishedCount})
          </button>
          <button
            type="button"
            onClick={() => handleFilterStatus("moderated")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap min-h-[32px]",
              currentStatus === "moderated"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Moderated ({stats.moderatedCount})
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search title, student, or comment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs rounded-xl h-9"
            />
          </div>
          <Button type="submit" size="sm" variant="outline" className="rounded-xl text-xs min-h-[36px] px-3.5">
            <Filter className="h-3.5 w-3.5 mr-1" />
            Filter
          </Button>
        </form>
      </div>

      {/* Feedbacks Stream / List */}
      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <Card className="border border-border bg-card shadow-sm rounded-2xl p-8 text-center">
            <MessageSquareQuote className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
            <h3 className="font-display font-bold text-base text-foreground">
              No Reviews Match Filter
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              No student reviews were found matching your selected status filter or search parameters.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((item) => (
              <Card
                key={item.id}
                className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden transition-all hover:border-foreground/20 hover:shadow-md"
              >
                <CardContent className="p-5 flex flex-col md:flex-row gap-5 justify-between">
                  {/* Left Column: Book & Student Info */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.isModerated ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full border border-border">
                          <EyeOff className="h-3 w-3" />
                          Moderated / Hidden from Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-brand-blue/10 text-brand-blue dark:text-blue-400 px-2.5 py-0.5 rounded-full border border-brand-blue/20">
                          <CheckCircle2 className="h-3 w-3" />
                          Published / Public
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-accent text-accent-foreground border border-border">
                        {item.bookCategory}
                      </span>

                      <span className="text-[11px] text-muted-foreground font-mono ml-auto md:ml-0">
                        {format(new Date(item.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>

                    <div className="flex items-start gap-4">
                      {/* Book Thumbnail */}
                      <div className="w-12 h-16 rounded-lg bg-muted shrink-0 overflow-hidden border border-border shadow-xs flex items-center justify-center text-muted-foreground relative">
                        {item.coverImageUrl ? (
                          <Image
                            src={item.coverImageUrl}
                            alt={`Book thumbnail for feedback review on "${item.bookTitle}"`}
                            fill
                            sizes="60px"
                            className="object-cover"
                          />
                        ) : (
                          <BookOpen className="h-6 w-6 text-muted-foreground/40" />
                        )}
                      </div>

                      {/* Content details */}
                      <div className="min-w-0 space-y-1">
                        <h3 className="font-display font-bold text-base text-foreground line-clamp-1">
                          {item.bookTitle}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          By <span className="text-foreground">{item.bookAuthor}</span>
                        </p>
                        <p className="text-xs text-muted-foreground pt-0.5">
                          Student: <span className="font-semibold text-foreground">{item.studentName}</span> ({item.studentEmail})
                        </p>
                      </div>
                    </div>

                    {/* Star Rating & Comment */}
                    <div className="pt-2 space-y-1.5 border-t border-border/50">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= item.rating
                                ? "fill-brand-blue text-brand-blue"
                                : "fill-muted text-muted"
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-foreground ml-1.5">
                          {item.rating} / 5 Stars
                        </span>
                      </div>

                      {item.comment ? (
                        <p className="text-xs text-foreground/90 leading-relaxed italic bg-muted/30 p-3 rounded-xl border border-border/40">
                          &ldquo;{item.comment}&rdquo;
                        </p>
                      ) : (
                        <p className="text-xs italic text-muted-foreground">
                          (No written comment provided)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Moderation Actions */}
                  <div className="flex flex-row md:flex-col items-center justify-end gap-2 shrink-0 md:border-l md:border-border md:pl-5 pt-3 md:pt-0 border-t md:border-t-0 border-border/60">
                    <Button
                      size="sm"
                      variant={item.isModerated ? "default" : "outline"}
                      disabled={isPending}
                      onClick={() => handleToggleModeration(item)}
                      className={cn(
                        "rounded-xl text-xs gap-1.5 flex-1 sm:flex-none min-h-[36px]",
                        item.isModerated
                          ? "bg-brand-blue text-white hover:bg-brand-blue/90 font-semibold"
                          : "border-border text-foreground hover:bg-accent"
                      )}
                    >
                      {item.isModerated ? (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          <span>Publish Review</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          <span>Hide Review</span>
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => setFeedbackToDelete(item)}
                      className="rounded-xl text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 flex-1 sm:flex-none min-h-[36px]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={feedbackToDelete !== null}
        onOpenChange={(open) => !open && !isDeleting && setFeedbackToDelete(null)}
      >
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border-border">
          <DialogHeader className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-1">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            </div>
            <DialogTitle className="font-display font-bold text-xl text-foreground">
              Delete Review Permanently?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete the review by <span className="font-semibold text-foreground">{feedbackToDelete?.studentName}</span> for <span className="font-semibold text-foreground">&ldquo;{feedbackToDelete?.bookTitle}&rdquo;</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFeedbackToDelete(null)}
              disabled={isDeleting}
              className="rounded-full text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="rounded-full bg-rose-600 text-white hover:bg-rose-700 font-medium text-xs gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Review</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
