"use client";

import { useState } from "react";
import Link from "next/link";
import { useTransition } from "react";
import { SignInButton } from "@clerk/nextjs";
import { Bookmark, Clock, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { requestReservationAction, cancelReservationAction } from "@/app/actions/reservation-actions";

import { ReserveHoldModal } from "./reserve-hold-modal";

interface ReserveButtonProps {
  bookId: string;
  availableCopiesCount: number;
  existingReservationId?: string | null;
  isSignedIn: boolean;
  bookTitle?: string;
}

export function ReserveButton({
  bookId,
  availableCopiesCount,
  existingReservationId,
  isSignedIn,
  bookTitle,
}: ReserveButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeReservationId, setActiveReservationId] = useState<string | null>(
    existingReservationId ?? null
  );
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleConfirmReservation = (holdDays?: number, holdUntilDate?: string) => {
    setIsModalOpen(false);
    setFeedback(null);
    startTransition(async () => {
      const res = await requestReservationAction(bookId, holdDays, holdUntilDate);
      if (res.ok && res.data) {
        setActiveReservationId(res.data.reservationId);
        const msg = "Hold placed successfully! Pick up your book copy at the circulation desk before expiration.";
        setFeedback({ type: "success", message: msg });
        toast.success(msg);
      } else {
        const errMsg = res.error?.message || "Failed to place reservation hold.";
        setFeedback({ type: "error", message: errMsg });
        toast.error(errMsg);
      }
    });
  };

  const handleCancel = () => {
    if (!activeReservationId) return;
    setFeedback(null);
    startTransition(async () => {
      const res = await cancelReservationAction(activeReservationId, bookId);
      if (res.ok) {
        setActiveReservationId(null);
        const msg = "Reservation hold cancelled successfully.";
        setFeedback({ type: "success", message: msg });
        toast.info(msg);
      } else {
        const errMsg = res.error?.message || "Failed to cancel reservation.";
        setFeedback({ type: "error", message: errMsg });
        toast.error(errMsg);
      }
    });
  };

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal" fallbackRedirectUrl="/catalog" forceRedirectUrl="/catalog">
        <Button size="lg" className="w-full sm:w-auto rounded-full gap-2 font-bold px-6 bg-brand-yellow text-black hover:bg-brand-yellow/90">
          <Bookmark className="h-5 w-5" />
          Sign In to Reserve Book
        </Button>
      </SignInButton>
    );
  }

  return (
    <div className="space-y-3 w-full sm:w-auto">
      {activeReservationId ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <Clock className="h-5 w-5 shrink-0" />
            <div className="text-xs">
              <span className="font-bold block text-sm">Active Hold Pending</span>
              <span>Physical copy held at circulation desk for 48h pickup.</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/reservations" className="flex-1">
              <Button variant="outline" size="sm" className="w-full rounded-full gap-1.5 text-xs font-semibold">
                <Clock className="h-4 w-4" /> View My Holds
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancel}
              disabled={isPending}
              className="rounded-full gap-1.5 text-xs font-semibold"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Cancel Hold
            </Button>
          </div>
        </div>
      ) : availableCopiesCount > 0 ? (
        <Button
          size="lg"
          onClick={() => setIsModalOpen(true)}
          disabled={isPending}
          className="w-full sm:w-auto rounded-full gap-2 font-bold px-8 bg-brand-yellow text-black hover:bg-brand-yellow/90 shadow-sm"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Placing Hold...
            </>
          ) : (
            <>
              <Bookmark className="h-5 w-5 fill-current" />
              Reserve Book for Pickup
            </>
          )}
        </Button>
      ) : (
        <Button
          size="lg"
          disabled
          className="w-full sm:w-auto rounded-full gap-2 font-semibold px-8 bg-muted text-muted-foreground border border-border"
        >
          <AlertCircle className="h-5 w-5" />
          No Available Copies for Hold
        </Button>
      )}

      {feedback && (
        <div
          className={
            feedback.type === "success"
              ? "p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2"
              : "p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2"
          }
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <ReserveHoldModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmReservation}
        isPending={isPending}
        bookTitle={bookTitle}
      />
    </div>
  );
}
