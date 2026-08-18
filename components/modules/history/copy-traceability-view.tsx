"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import {
  QrCode,
  Search,
  BookOpen,
  User,
  Clock,
  Shield,
  FileText,
  CheckCircle2,
  AlertTriangle,
  History,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CopyTraceabilityDetail } from "@/lib/services/history-service";
import { getCopyTraceabilityByBarcodeAction } from "@/app/actions/history-actions";
import { CopyHistoryTimeline } from "./copy-history-timeline";
import { cn } from "@/lib/utils";

interface CopyTraceabilityViewProps {
  initialDetail?: CopyTraceabilityDetail | null;
}

export function CopyTraceabilityView({ initialDetail = null }: CopyTraceabilityViewProps) {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [detail, setDetail] = useState<CopyTraceabilityDetail | null>(initialDetail);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;

    setError(null);
    startTransition(async () => {
      const res = await getCopyTraceabilityByBarcodeAction(query);
      if (res.ok) {
        setDetail(res.data);
      } else {
        setDetail(null);
        setError(res.error.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header / Search Console */}
      <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/40 pb-4 border-b border-border">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold font-display flex items-center gap-2">
                <QrCode className="h-5 w-5 text-brand-blue" />
                Physical Copy Traceability Inspector
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Enter any physical copy barcode or scan RFID tag to inspect full immutable history log and current status.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <QrCode className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter Copy Barcode (e.g. BC-1001-01)..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="pl-10 font-mono text-sm"
              />
            </div>
            <Button
              type="submit"
              disabled={isPending || !barcodeInput.trim()}
              className="bg-brand-blue text-white hover:bg-brand-blue/90 font-medium px-6 rounded-full"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Searching...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span>Lookup Copy</span>
                </div>
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Copy Traceability Result Details */}
      {detail ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Physical Copy & Book Metadata */}
          <div className="space-y-6">
            <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/30 pb-3 border-b border-border">
                <CardTitle className="text-base font-bold font-display flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-brand-yellow" />
                  Copy & Catalog Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <span className="text-xs text-muted-foreground uppercase font-mono tracking-wider">
                    Barcode ID
                  </span>
                  <span className="font-mono text-sm font-bold bg-accent px-2.5 py-1 rounded-full border border-border">
                    {detail.barcode}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <span className="text-xs text-muted-foreground uppercase font-mono tracking-wider">
                    Copy Status
                  </span>
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase font-mono border",
                      detail.status === "AVAILABLE" && "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300",
                      detail.status === "BORROWED" && "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300",
                      detail.status === "RESERVED" && "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300",
                      (detail.status === "MAINTENANCE" || detail.status === "LOST") && "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300"
                    )}
                  >
                    {detail.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <span className="text-xs text-muted-foreground uppercase font-mono tracking-wider">
                    Physical Condition
                  </span>
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-medium font-mono border",
                      detail.condition === "MINT" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                      detail.condition === "GOOD" && "bg-blue-50 text-blue-700 border-blue-200",
                      detail.condition === "FAIR" && "bg-amber-50 text-amber-700 border-amber-200",
                      detail.condition === "DAMAGED" && "bg-rose-50 text-rose-700 border-rose-200"
                    )}
                  >
                    {detail.condition}
                  </span>
                </div>

                <div className="pt-2">
                  <h4 className="font-display font-bold text-base text-foreground">
                    {detail.book.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    by {detail.book.author}
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground font-mono">
                    <span className="px-2 py-0.5 rounded bg-muted">
                      {detail.book.category}
                    </span>
                    {detail.book.isbn && <span>ISBN: {detail.book.isbn}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Holder / Active Loan Info */}
            <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/30 pb-3 border-b border-border">
                <CardTitle className="text-base font-bold font-display flex items-center gap-2">
                  <User className="h-4 w-4 text-brand-blue" />
                  Current Holder & Active Loan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {detail.currentHolder ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/40 border border-border">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/20 text-brand-blue font-bold text-xs">
                        {detail.currentHolder.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {detail.currentHolder.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {detail.currentHolder.email}
                        </p>
                      </div>
                    </div>

                    {detail.activeLoan && (
                      <div className="space-y-2 text-xs pt-2 border-t border-border/50">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Borrowed On:</span>
                          <span className="font-mono text-foreground font-medium">
                            {format(new Date(detail.activeLoan.borrowedAt), "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Due Date:</span>
                          <span className="font-mono text-foreground font-semibold">
                            {format(new Date(detail.activeLoan.dueDate), "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Checked Out By:</span>
                          <span className="font-medium text-foreground">
                            {detail.activeLoan.assistantName}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic py-2 text-center">
                    Copy is currently not assigned to any user (In Library Stack).
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Immutable Audit History Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/30 pb-3 border-b border-border flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold font-display flex items-center gap-2">
                    <History className="h-4 w-4 text-purple-600" />
                    Immutable BookHistory Audit Log ({detail.history.length})
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Complete time-sequenced append-only lifecycle records for barcode {detail.barcode}.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CopyHistoryTimeline history={detail.history} />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        !error && (
          <div className="text-center py-16 px-4 border border-dashed rounded-2xl bg-card">
            <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-60" />
            <h3 className="text-base font-bold text-foreground font-display">
              Scan or Enter a Physical Copy Barcode
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
              Use the input box above to look up any book copy (e.g. BC-1001-01) to trace its full chain of custody, checkout cycles, condition changes, and audit events.
            </p>
          </div>
        )
      )}
    </div>
  );
}
