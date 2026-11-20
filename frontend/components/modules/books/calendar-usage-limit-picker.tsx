"use client";

import { useState, useEffect } from "react";
import { format, addDays, differenceInCalendarDays, isAfter, isBefore, startOfDay } from "date-fns";
import { Calendar, Clock, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarUsageLimitPickerProps {
  maxUsageDays?: number; // Default 30 days max usage limit
  initialDays?: number; // Default initial selection (e.g. 14 days)
  onChange: (days: number, selectedDate: Date) => void;
  className?: string;
}

export function CalendarUsageLimitPicker({
  maxUsageDays = 30,
  initialDays = 14,
  onChange,
  className,
}: CalendarUsageLimitPickerProps) {
  const today = startOfDay(new Date());
  const maxAllowableDate = addDays(today, maxUsageDays);
  const minAllowableDate = addDays(today, 1);

  const [selectedDate, setSelectedDate] = useState<Date>(addDays(today, initialDays));
  const [error, setError] = useState<string | null>(null);

  // Synchronize initial value
  useEffect(() => {
    const computedDays = differenceInCalendarDays(selectedDate, today);
    onChange(computedDays, selectedDate);
  }, []);

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) return;

    const parsedDate = startOfDay(new Date(value));

    if (isBefore(parsedDate, minAllowableDate)) {
      setError("Return due date must be at least 1 day from today.");
      return;
    }

    if (isAfter(parsedDate, maxAllowableDate)) {
      setError(`Usage limit exceeded. Maximum allowable borrow duration is ${maxUsageDays} days.`);
      return;
    }

    setError(null);
    setSelectedDate(parsedDate);
    const computedDays = Math.max(1, differenceInCalendarDays(parsedDate, today));
    onChange(computedDays, parsedDate);
  };

  const handlePresetSelect = (days: number) => {
    const targetDate = addDays(today, days);
    setError(null);
    setSelectedDate(targetDate);
    onChange(days, targetDate);
  };

  const selectedDays = differenceInCalendarDays(selectedDate, today);
  const formattedMinDate = format(minAllowableDate, "yyyy-MM-dd");
  const formattedMaxDate = format(maxAllowableDate, "yyyy-MM-dd");
  const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");

  return (
    <div className={cn("space-y-4 rounded-2xl border border-border bg-card p-5 shadow-xs", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue font-bold">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-display text-foreground">
              Usage Duration & Due Date Calendar
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Set exact return deadline (Max limit: {maxUsageDays} days).
            </p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-accent text-accent-foreground border border-border">
          {selectedDays} Days Usage Limit
        </div>
      </div>

      {/* Preset Duration Buttons */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase font-mono tracking-wider">
          Quick Preset Limits
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[7, 14, 21, 30].map((presetDays) => {
            const isSelected = selectedDays === presetDays;
            return (
              <button
                key={presetDays}
                type="button"
                onClick={() => handlePresetSelect(presetDays)}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center gap-0.5",
                  isSelected
                    ? "bg-brand-blue text-white border-brand-blue shadow-sm"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                )}
              >
                <span>{presetDays} Days</span>
                <span className={cn("text-[10px] font-normal opacity-80", isSelected ? "text-white" : "text-muted-foreground")}>
                  {format(addDays(today, presetDays), "MMM d")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Calendar Date Selector Input */}
      <div className="space-y-1.5 pt-1">
        <label htmlFor="calendar-due-date" className="text-xs font-medium text-muted-foreground uppercase font-mono tracking-wider">
          Custom Calendar Expiration Date
        </label>
        <div className="relative">
          <input
            id="calendar-due-date"
            type="date"
            min={formattedMinDate}
            max={formattedMaxDate}
            value={formattedSelectedDate}
            onChange={handleDateInputChange}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/80 text-foreground text-sm font-mono focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/15 hover:border-foreground/20 transition-all duration-200"
          />
        </div>
      </div>

      {/* Selected Usage Info Banner */}
      {error ? (
        <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-destructive" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="p-3 rounded-xl border border-brand-blue/30 bg-brand-blue/10 text-brand-blue dark:text-blue-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-brand-blue shrink-0" />
            <span>
              Return due by <strong className="font-semibold">{format(selectedDate, "EEEE, MMMM d, yyyy")}</strong>
            </span>
          </div>
          <span className="font-mono text-[11px] bg-brand-blue/20 text-brand-blue dark:text-blue-200 px-2 py-0.5 rounded font-bold">
            {selectedDays} Days
          </span>
        </div>
      )}
    </div>
  );
}
