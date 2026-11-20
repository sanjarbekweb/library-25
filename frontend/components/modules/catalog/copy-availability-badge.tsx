"use client";

import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";

interface CopyAvailabilityBadgeProps {
  availableCount: number;
  totalCount: number;
  nextAvailableDate?: Date | string | null;
  className?: string;
}

export function CopyAvailabilityBadge({
  availableCount,
  totalCount,
  nextAvailableDate,
  className,
}: CopyAvailabilityBadgeProps) {
  const { t } = useLanguage();
  const isAvailable = availableCount > 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap tracking-tight transition-colors shadow-2xs border",
        isAvailable
          ? "bg-brand-blue/10 text-brand-blue border-brand-blue/20 dark:text-blue-400"
          : "bg-muted text-muted-foreground border-border",
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full shrink-0",
          isAvailable ? "bg-brand-blue" : "bg-muted-foreground/60"
        )}
      />
      {isAvailable ? (
        <span className="truncate">
          <span className="hidden sm:inline">{availableCount}/{totalCount} {t("available")}</span>
          <span className="sm:hidden">{availableCount}/{totalCount}</span>
        </span>
      ) : nextAvailableDate ? (
        <span className="truncate flex items-center gap-1 text-xs">
          <Calendar className="h-3 w-3 shrink-0" />
          <span>{format(new Date(nextAvailableDate), "MMM d")}</span>
        </span>
      ) : (
        <span className="truncate">
          <span className="hidden sm:inline">{t("onHold")}</span>
          <span className="sm:hidden">{totalCount}/{totalCount}</span>
        </span>
      )}
    </span>
  );
}
