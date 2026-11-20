"use client";

import { useState, useTransition } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { cancelReservationApi } from "@/hooks/api/useReservations";
import { useRouter } from "next/navigation";

interface ReservationCancelButtonProps {
  reservationId: string;
  bookId: string;
}

export function ReservationCancelButton({
  reservationId,
  bookId,
}: ReservationCancelButtonProps) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCancel = () => {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        const token = await getToken();
        await cancelReservationApi({ reservationId }, token);
        router.refresh();
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to cancel hold");
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCancel}
        disabled={isPending}
        className="rounded-full gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <X className="h-3.5 w-3.5" />
        )}
        Cancel Hold
      </Button>
      {errorMsg && (
        <span className="text-[10px] text-destructive font-mono">{errorMsg}</span>
      )}
    </div>
  );
}
