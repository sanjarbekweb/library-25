import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const isAvailable = availableCount > 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-tight transition-colors",
        isAvailable
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full shrink-0",
          isAvailable ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
        )}
      />
      {isAvailable ? (
        <span className="truncate">
          <span className="hidden sm:inline">{availableCount} of {totalCount} Available</span>
          <span className="sm:hidden">{availableCount}/{totalCount} Avail</span>
        </span>
      ) : nextAvailableDate ? (
        <span className="truncate flex items-center gap-1 font-mono text-[11px]">
          <Calendar className="h-3 w-3 shrink-0" />
          <span>Next Avail: {format(new Date(nextAvailableDate), "MMM d")}</span>
        </span>
      ) : (
        <span className="truncate">
          <span className="hidden sm:inline">All {totalCount} Checked Out</span>
          <span className="sm:hidden">{totalCount}/{totalCount} Out</span>
        </span>
      )}
    </span>
  );
}
