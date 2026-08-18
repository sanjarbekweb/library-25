"use client";

import { format } from "date-fns";
import {
  BookHistoryItem,
} from "@/lib/services/history-service";
import { HistoryAction } from "@prisma/client";
import {
  ArrowRight,
  CheckCircle2,
  Bookmark,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  XCircle,
  Clock,
  ShieldCheck,
  UserCheck,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyHistoryTimelineProps {
  history: BookHistoryItem[];
  compact?: boolean;
}

const ACTION_CONFIG: Record<
  HistoryAction,
  { label: string; icon: React.ElementType; colorClass: string; bgClass: string }
> = {
  CREATED: {
    label: "Copy Registered",
    icon: PlusCircle,
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800",
  },
  CHECKOUT: {
    label: "Checked Out",
    icon: ArrowRight,
    colorClass: "text-indigo-600 dark:text-indigo-400",
    bgClass: "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800",
  },
  CHECKIN: {
    label: "Checked In",
    icon: CheckCircle2,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800",
  },
  RESERVED: {
    label: "Reserved Online",
    icon: Bookmark,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800",
  },
  RESERVATION_FULFILLED: {
    label: "Hold Fulfilled",
    icon: UserCheck,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800",
  },
  RESERVATION_CANCELLED: {
    label: "Hold Cancelled",
    icon: XCircle,
    colorClass: "text-rose-600 dark:text-rose-400",
    bgClass: "bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800",
  },
  RESERVATION_EXPIRED: {
    label: "Hold Expired",
    icon: Clock,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800",
  },
  CONDITION_CHANGE: {
    label: "Condition Change",
    icon: AlertTriangle,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800",
  },
  STATUS_CHANGE: {
    label: "Status Shift",
    icon: RefreshCw,
    colorClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800",
  },
  LOST: {
    label: "Marked Lost",
    icon: XCircle,
    colorClass: "text-rose-600 dark:text-rose-400",
    bgClass: "bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800",
  },
  MAINTENANCE: {
    label: "Sent to Maintenance",
    icon: ShieldCheck,
    colorClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800",
  },
};

export function CopyHistoryTimeline({ history, compact = false }: CopyHistoryTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 px-4 border border-dashed rounded-xl bg-muted/30">
        <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground font-medium">No history log entries found.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 border-l-2 border-border space-y-6">
      {history.map((log, index) => {
        const config = ACTION_CONFIG[log.action] || {
          label: log.action,
          icon: Clock,
          colorClass: "text-foreground",
          bgClass: "bg-muted border-border",
        };
        const IconComponent = config.icon;

        return (
          <div key={log.id} className="relative group">
            {/* Dot Indicator */}
            <div
              className={cn(
                "absolute -left-[31px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full border shadow-sm transition-transform group-hover:scale-110",
                config.bgClass
              )}
            >
              <IconComponent className={cn("h-3.5 w-3.5", config.colorClass)} />
            </div>

            {/* Content Card */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-border/80 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase font-mono",
                      config.bgClass,
                      config.colorClass
                    )}
                  >
                    {config.label}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {format(new Date(log.createdAt), "MMM d, yyyy • h:mm a")}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{log.actorName}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-mono bg-accent text-accent-foreground">
                    {log.actorRole}
                  </span>
                </div>
              </div>

              {/* State Transitions */}
              {(log.previousState || log.newState) && (
                <div className="flex items-center gap-2 text-xs font-mono my-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/50">
                  {log.previousState && (
                    <span className="px-2 py-0.5 rounded bg-background border text-muted-foreground">
                      {log.previousState}
                    </span>
                  )}
                  {log.previousState && log.newState && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                  {log.newState && (
                    <span className="px-2 py-0.5 rounded bg-brand-yellow/20 text-foreground border border-brand-yellow/30 font-semibold">
                      {log.newState}
                    </span>
                  )}
                </div>
              )}

              {/* Condition / Action Notes */}
              {log.notes && (
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/40 italic">
                  &ldquo;{log.notes}&rdquo;
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
