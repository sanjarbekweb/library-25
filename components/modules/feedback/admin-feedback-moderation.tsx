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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AdminFeedbackResult, AdminFeedbackItem } from "@/lib/services/feedback-service";
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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-foreground flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue border border-brand-blue/20 shadow-sm">
              <ShieldAlert className="h-5 w-5" />
            </div>
            Feedback & Review Moderation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review student ratings, moderate inappropriate comments, and enforce catalog quality controls.
          </p>
        </div>

        <div>
          <Link href="/admin">
            <Button variant="outline" size="sm" className="rounded-full gap-2 text-xs font-semibold hover:bg-accent border-border">
              <LogOut className="w-4 h-4 text-muted-foreground" />
              <span>Exit to Admin Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border bg-card shadow-sm rounded-2xl p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-mono uppercase">Total Reviews</span>
            <MessageSquareQuote className="h-4 w-4 text-brand-blue" />
          </div>
          <p className="text-2xl font-bold font-display mt-2 text-foreground">
            {stats.totalCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Submitted across system</p>
        </Card>

        <Card className="border-border bg-card shadow-sm rounded-2xl p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-mono uppercase">Published (Public)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-display mt-2 text-emerald-600 dark:text-emerald-400">
            {stats.publishedCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Visible on catalog detail</p>
        </Card>

        <Card className={cn(
          "border-border bg-card shadow-sm rounded-2xl p-4",
          stats.moderatedCount > 0 && "border-amber-300 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-800"
        )}>
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-mono uppercase">Moderated (Hidden)</span>
            <EyeOff className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-display mt-2 text-amber-600 dark:text-amber-400">
            {stats.moderatedCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Hidden from public catalog</p>
        </Card>

        <Card className="border-border bg-card shadow-sm rounded-2xl p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-mono uppercase">System Avg Rating</span>
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-display mt-2 text-foreground">
            {stats.averageRating ? `${stats.averageRating} / 5` : "N/A"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Verified loan average</p>
        </Card>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-900 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border">
        {/* Status Tab Filters */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
          <button
            type="button"
            onClick={() => handleFilterStatus("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
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
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              currentStatus === "published"
                ? "bg-background text-foreground shadow-xs font-semibold text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Published ({stats.publishedCount})
          </button>
          <button
            type="button"
            onClick={() => handleFilterStatus("moderated")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              currentStatus === "moderated"
                ? "bg-background text-foreground shadow-xs font-semibold text-amber-600 dark:text-amber-400"
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
          <Button type="submit" size="sm" variant="outline" className="rounded-xl text-xs">
            <Filter className="h-3.5 w-3.5 mr-1" />
            Filter
          </Button>
        </form>
      </div>

      {/* Feedbacks Stream / List */}
      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <Card className="border-border bg-card shadow-sm rounded-2xl p-8 text-center">
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
                className={cn(
                  "border-border bg-card shadow-sm rounded-2xl overflow-hidden transition-all hover:border-border/80",
                  item.isModerated && "border-amber-300/70 bg-amber-500/5"
                )}
              >
                <CardContent className="p-5 flex flex-col md:flex-row gap-5 justify-between">
                  {/* Left Column: Book & Student Info */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.isModerated ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                          <EyeOff className="h-3 w-3" />
                          Moderated / Hidden from Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          Published / Public
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-accent text-accent-foreground border">
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
                            alt={item.bookTitle}
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
                            className={`h-4 w-4 ${star <= item.rating
                                ? "fill-amber-400 text-amber-400"
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
                  <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 md:border-l md:border-border md:pl-5">
                    <Button
                      size="sm"
                      variant={item.isModerated ? "default" : "outline"}
                      disabled={isPending}
                      onClick={() => handleToggleModeration(item)}
                      className={cn(
                        "rounded-xl text-xs gap-1.5 w-full sm:w-auto",
                        item.isModerated
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300"
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
                      className="rounded-xl text-xs gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/50 w-full sm:w-auto"
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
