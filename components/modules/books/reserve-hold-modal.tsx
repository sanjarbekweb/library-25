"use client";

import { useState } from "react";
import { format, addDays, startOfDay, isBefore, isAfter, differenceInCalendarDays } from "date-fns";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogPanel,
  DialogFooter,
} from "@/components/animate-ui/components/headless/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
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
}: ReserveHoldModalProps) {
  const { t, language } = useLanguage();
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
      setError(
        language === "uz"
          ? "Band qilish muddati kamida 1 kundan keyingi sana bo'lishi kerak."
          : language === "ru"
          ? "Срок бронирования должен быть минимум на 1 день вперед."
          : "Hold expiration date must be at least 1 day from today."
      );
      return;
    }

    if (isAfter(parsedDate, maxAllowableHoldDate)) {
      setError(
        language === "uz"
          ? "Talabalar uchun maksimal band qilish muddati 7 kun."
          : language === "ru"
          ? "Максимальный срок бронирования для самовывоза составляет 7 дней."
          : "Maximum allowable hold duration for student pickup is 7 days."
      );
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

  const quickPresetsLabel = language === "uz" ? "Tezkor muddatlar" : language === "ru" ? "Быстрый выбор срока" : "Quick Hold Duration Presets";
  const pickCalendarLabel = language === "uz" ? "Yoki taqvimdan aniq sanani tanlang" : language === "ru" ? "Или выберите точную дату в календаре" : "Or Pick Exact Calendar Date";

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogPanel className="sm:max-w-md rounded-3xl p-6 bg-card border-border shadow-2xl space-y-4">
        {/* Quick Presets */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider block">
            {quickPresetsLabel}
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
                    "px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer",
                    isSelected
                      ? "bg-brand-blue text-white border-brand-blue shadow-xs font-bold"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                  )}
                >
                  <span>{days} {days === 1 ? t("day") : t("days")}</span>
                  <span className="text-[9px] font-normal opacity-80">
                    {days === 2 ? t("defaultPreset") : format(addDays(today, days), "MMM d")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Calendar Input Option */}
        <div className="space-y-1.5 pt-1">
          <label htmlFor="hold-calendar-date" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center justify-between">
            <span>{pickCalendarLabel}</span>
            <span className="text-[10px] text-brand-blue font-semibold">Max 7 {t("days")}</span>
          </label>
          <div className="relative">
            <input
              id="hold-calendar-date"
              type="date"
              min={formattedMinDate}
              max={formattedMaxDate}
              value={formattedInputDate}
              onChange={handleCalendarInputChange}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/80 text-foreground text-sm focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/15 hover:border-foreground/20 transition-all duration-200"
            />
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            <span>{error}</span>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="rounded-full text-xs font-medium cursor-pointer"
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending || !!error}
            className="rounded-full text-xs font-bold bg-brand-blue text-white hover:bg-brand-blue/90 px-6 cursor-pointer"
          >
            {isPending ? t("placingHold") : t("confirmHoldRequest")}
          </Button>
        </DialogFooter>
      </DialogPanel>
    </Dialog>
  );
}
