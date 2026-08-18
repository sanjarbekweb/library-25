import { cn } from "@/lib/utils";

interface CopyAvailabilityBadgeProps {
  availableCount: number;
  totalCount: number;
  className?: string;
}

export function CopyAvailabilityBadge({
  availableCount,
  totalCount,
  className,
}: CopyAvailabilityBadgeProps) {
  const isAvailable = availableCount > 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-tight transition-colors",
        isAvailable
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isAvailable ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
        )}
      />
      {isAvailable ? (
        <span>
          {availableCount} of {totalCount} Available
        </span>
      ) : (
        <span>All {totalCount} Checked Out</span>
      )}
    </span>
  );
}
