"use client";

import { useState } from "react";
import { format, addDays, startOfDay, isBefore, isAfter, differenceInCalendarDays } from "date-fns";
import { Bookmark, Calendar, Clock, AlertCircle, ShieldCheck, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReserveHoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (holdDays?: number, holdUntilDate?: string) => void;
  isPending: boolean;
  bookTitle?: string;
}

export function ReserveHoldModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  bookTitle,
}: ReserveHoldModalProps) {
  const today = startOfDay(new Date());
  const maxAllowableHoldDate = addDays(today, 7);
  const minAllowableHoldDate = addDays(today, 1);

  const [selectedHoldDays, setSelectedHoldDays] = useState<number>(2);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(addDays(today, 2));
  const [useCalendarPicker, setUseCalendarPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePresetSelect = (days: number) => {
    setSelectedHoldDays(days);
    setSelectedCalendarDate(addDays(today, days));
    setUseCalendarPicker(false);
    setError(null);
  };

  const handleCalendarInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;

    const parsedDate = startOfDay(new Date(val));

    if (isBefore(parsedDate, minAllowableHoldDate)) {
      setError("Hold expiration date must be at least 1 day from today.");
      return;
    }

    if (isAfter(parsedDate, maxAllowableHoldDate)) {
      setError("Maximum allowable hold duration for student pickup is 7 days.");
      return;
    }

    setError(null);
    setSelectedCalendarDate(parsedDate);
    const computedDays = Math.max(1, differenceInCalendarDays(parsedDate, today));
    setSelectedHoldDays(computedDays);
    setUseCalendarPicker(true);
  };

  const handleConfirm = () => {
    if (useCalendarPicker) {
      const dateStr = format(selectedCalendarDate, "yyyy-MM-dd");
      onConfirm(undefined, dateStr);
    } else {
      onConfirm(selectedHoldDays, undefined);
    }
  };

  const formattedMinDate = format(minAllowableHoldDate, "yyyy-MM-dd");
  const formattedMaxDate = format(maxAllowableHoldDate, "yyyy-MM-dd");
  const formattedInputDate = format(selectedCalendarDate, "yyyy-MM-dd");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border-border shadow-lg">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-yellow/20 text-black border border-brand-yellow/30 font-bold">
              <Bookmark className="h-5 w-5 fill-current text-foreground" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-display text-foreground">
                Set Hold Duration & Expiration
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Choose how long to hold this book for desk pickup (Max limit: 7 days).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {bookTitle && (
          <div className="p-3 rounded-xl bg-accent/40 border border-border text-xs">
            <span className="text-muted-foreground font-mono uppercase text-[10px]">Title:</span>
            <p className="font-bold text-foreground font-display line-clamp-1 mt-0.5">{bookTitle}</p>
          </div>
        )}

        {/* Quick Presets */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold uppercase font-mono text-muted-foreground tracking-wider">
            Quick Hold Duration Presets
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[1, 2, 3, 5, 7].map((days) => {
              const isSelected = !useCalendarPicker && selectedHoldDays === days;
              return (
                <button
                  key={days}
                  type="button"
                  onClick={() => handlePresetSelect(days)}
                  className={cn(
                    "px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center gap-0.5",
                    isSelected
                      ? "bg-brand-yellow text-black border-brand-yellow shadow-sm font-bold"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                  )}
                >
                  <span>{days} {days === 1 ? "Day" : "Days"}</span>
                  <span className="text-[9px] font-normal opacity-80">
                    {days === 2 ? "(Default)" : format(addDays(today, days), "MMM d")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Calendar Input Option */}
        <div className="space-y-1.5 pt-2">
          <label htmlFor="hold-calendar-date" className="text-xs font-semibold uppercase font-mono text-muted-foreground tracking-wider flex items-center justify-between">
            <span>Or Pick Exact Calendar Expiration Date</span>
            <span className="text-[10px] text-brand-blue font-normal">Max 7 Days</span>
          </label>
          <div className="relative">
            <input
              id="hold-calendar-date"
              type="date"
              min={formattedMinDate}
              max={formattedMaxDate}
              value={formattedInputDate}
              onChange={handleCalendarInputChange}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/80 text-foreground text-sm font-mono focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/15 hover:border-foreground/20 transition-all duration-200"
            />
          </div>
        </div>

        {/* Summary Info Box */}
        {error ? (
          <div className="p-3 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold font-display">
              <Clock className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Pickup Expiration Summary</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Book copy will be reserved at the Circulation Desk until{" "}
              <strong className="font-semibold">{format(selectedCalendarDate, "EEEE, MMMM d, yyyy")}</strong> ({selectedHoldDays} day{selectedHoldDays > 1 ? "s" : ""} hold).
            </p>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="rounded-full text-xs font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending || !!error}
            className="rounded-full text-xs font-bold bg-brand-yellow text-black hover:bg-brand-yellow/90 px-6"
          >
            {isPending ? "Placing Hold..." : "Confirm Hold Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
