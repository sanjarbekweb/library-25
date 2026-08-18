"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { format, addDays } from "date-fns";
import {
  Search,
  BookOpen,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  XCircle,
  FileText,
  History,
  LogOut,
} from "lucide-react";
import { CopyTraceabilityView } from "@/components/modules/history/copy-traceability-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CirculationDeskSummary,
  PendingReservationItem,
  ActiveLoanItem,
  StudentSearchResult,
  CopySearchResult,
} from "@/lib/services/circulation-service";
import {
  checkoutCopyAction,
  checkinCopyAction,
  searchStudentsAction,
  searchCopiesAction,
} from "@/app/actions/circulation-actions";
import { CopyCondition, CopyStatus } from "@prisma/client";

interface CirculationDeskProps {
  initialSummary: CirculationDeskSummary;
  initialReservations: PendingReservationItem[];
  initialActiveLoans: ActiveLoanItem[];
}

export function CirculationDesk({
  initialSummary,
  initialReservations,
  initialActiveLoans,
}: CirculationDeskProps) {
  const [activeTab, setActiveTab] = useState<"checkout" | "checkin" | "holds" | "loans" | "history">("checkout");
  const [isPending, startTransition] = useTransition();

  // Alert Feedback State
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  // Stats
  const [summary, setSummary] = useState(initialSummary);
  const [pendingReservations, setPendingReservations] = useState(initialReservations);
  const [activeLoans, setActiveLoans] = useState(initialActiveLoans);

  // Sync state if props update
  useEffect(() => {
    setSummary(initialSummary);
    setPendingReservations(initialReservations);
    setActiveLoans(initialActiveLoans);
  }, [initialSummary, initialReservations, initialActiveLoans]);

  // -------------------------------------------------------------
  // Checkout Form State
  // -------------------------------------------------------------
  const [studentQuery, setStudentQuery] = useState("");
  const [studentResults, setStudentResults] = useState<StudentSearchResult[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null);
  const [isSearchingStudents, setIsSearchingStudents] = useState(false);

  const [copyQuery, setCopyQuery] = useState("");
  const [copyResults, setCopyResults] = useState<CopySearchResult[]>([]);
  const [selectedCopy, setSelectedCopy] = useState<CopySearchResult | null>(null);
  const [isSearchingCopies, setIsSearchingCopies] = useState(false);

  const [dueDays, setDueDays] = useState(14);

  // Student Search Handler
  useEffect(() => {
    if (!studentQuery.trim()) {
      setStudentResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingStudents(true);
      const res = await searchStudentsAction(studentQuery);
      if (res.ok && res.data) {
        setStudentResults(res.data);
      }
      setIsSearchingStudents(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [studentQuery]);

  // Copy Search Handler
  useEffect(() => {
    if (!copyQuery.trim()) {
      setCopyResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingCopies(true);
      const res = await searchCopiesAction(copyQuery);
      if (res.ok && res.data) {
        setCopyResults(res.data);
      }
      setIsSearchingCopies(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [copyQuery]);

  // Execute Rapid Checkout
  const handleCheckout = () => {
    if (!selectedStudent) {
      setAlert({
        type: "error",
        title: "Student Required",
        message: "Please select a valid student account first.",
      });
      return;
    }
    const targetCopyIdentifier = selectedCopy ? selectedCopy.barcode : copyQuery.trim();
    if (!targetCopyIdentifier) {
      setAlert({
        type: "error",
        title: "Copy Identifier Required",
        message: "Please scan or select a physical copy barcode.",
      });
      return;
    }

    setAlert(null);
    startTransition(async () => {
      const res = await checkoutCopyAction({
        copyId: targetCopyIdentifier,
        studentId: selectedStudent.id,
        dueDays,
      });

      if (res.ok && res.data) {
        setAlert({
          type: "success",
          title: "Checkout Completed Successfully",
          message: `Physical copy ${res.data.copyBarcode} checked out to ${res.data.studentName}. Due: ${format(new Date(res.data.dueDate), "MMM dd, yyyy")}`,
        });
        // Reset form
        setSelectedStudent(null);
        setSelectedCopy(null);
        setStudentQuery("");
        setCopyQuery("");
      } else {
        setAlert({
          type: "error",
          title: "Checkout Failed",
          message: res.error?.message || "An error occurred during checkout.",
        });
      }
    });
  };

  // -------------------------------------------------------------
  // Check-in Form State
  // -------------------------------------------------------------
  const [checkinBarcode, setCheckinBarcode] = useState("");
  const [checkinCopyResults, setCheckinCopyResults] = useState<CopySearchResult[]>([]);
  const [selectedCheckinCopy, setSelectedCheckinCopy] = useState<CopySearchResult | null>(null);
  const [condition, setCondition] = useState<CopyCondition>("GOOD");
  const [targetStatus, setTargetStatus] = useState<CopyStatus>("AVAILABLE");
  const [notes, setNotes] = useState("");

  // Search copy for check-in
  useEffect(() => {
    if (!checkinBarcode.trim()) {
      setCheckinCopyResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await searchCopiesAction(checkinBarcode);
      if (res.ok && res.data) {
        setCheckinCopyResults(res.data.filter((c) => c.status === "BORROWED" || c.activeLoanId));
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [checkinBarcode]);

  // Execute Rapid Check-in
  const handleCheckin = () => {
    const targetIdentifier = selectedCheckinCopy ? selectedCheckinCopy.barcode : checkinBarcode.trim();
    if (!targetIdentifier) {
      setAlert({
        type: "error",
        title: "Barcode Required",
        message: "Please enter or scan a book copy barcode to check in.",
      });
      return;
    }

    setAlert(null);
    startTransition(async () => {
      const res = await checkinCopyAction({
        copyId: targetIdentifier,
        condition,
        status: targetStatus,
        notes: notes.trim() || undefined,
      });

      if (res.ok && res.data) {
        setAlert({
          type: "success",
          title: "Check-in Completed Successfully",
          message: `Physical copy ${res.data.copyBarcode} (${res.data.bookTitle}) returned by ${res.data.studentName}. Status set to ${res.data.newStatus}.`,
        });
        // Reset check-in form
        setCheckinBarcode("");
        setSelectedCheckinCopy(null);
        setNotes("");
        setCondition("GOOD");
        setTargetStatus("AVAILABLE");
      } else {
        setAlert({
          type: "error",
          title: "Check-in Failed",
          message: res.error?.message || "An error occurred during check-in.",
        });
      }
    });
  };

  // 1-Click Fulfill Reservation from Holds Queue
  const handleFulfillReservation = (resItem: PendingReservationItem) => {
    setActiveTab("checkout");
    setSelectedStudent({
      id: resItem.studentId,
      clerkId: "",
      email: resItem.studentEmail,
      firstName: resItem.studentName.split(" ")[0] || "",
      lastName: resItem.studentName.split(" ")[1] || "",
      role: "STUDENT",
      isActive: true,
      activeLoansCount: 0,
      activeReservationsCount: 1,
    });
    if (resItem.copyBarcode) {
      setCopyQuery(resItem.copyBarcode);
    } else {
      setCopyQuery(resItem.bookTitle);
    }
  };

  // 1-Click Select Active Loan for Check-in
  const handleSelectLoanForCheckin = (loanItem: ActiveLoanItem) => {
    setActiveTab("checkin");
    setCheckinBarcode(loanItem.copyBarcode);
    setSelectedCheckinCopy({
      id: loanItem.copyId,
      barcode: loanItem.copyBarcode,
      condition: loanItem.condition,
      status: "BORROWED",
      bookId: loanItem.bookId,
      bookTitle: loanItem.bookTitle,
      bookAuthor: loanItem.bookAuthor,
      bookIsbn: null,
      coverImageUrl: loanItem.coverImageUrl,
      category: "",
      currentHolderName: loanItem.studentName,
      currentHolderId: loanItem.studentId,
      activeLoanId: loanItem.loanId,
      dueDate: loanItem.dueDate,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header & Sub-10s Telemetry Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-display text-foreground">
              Circulation Desk Console
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-yellow text-black border border-black/10">
              <Sparkles className="w-3.5 h-3.5" /> Sub-10s Desk Mode
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Rapid execution console for in-person student checkouts, check-ins, and holds fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="px-4 py-2 rounded-xl bg-card border border-border text-xs font-mono flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{format(new Date(), "EEEE, MMM dd, yyyy")}</span>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="rounded-full gap-2 text-xs font-semibold hover:bg-accent border-border">
              <LogOut className="w-4 h-4 text-muted-foreground" />
              <span>Exit Desk Console</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Global Alert Notification Banner */}
      {alert && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between gap-4 animate-in fade-in slide-in-from-top-2 ${alert.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
              : "bg-destructive/10 border-destructive/30 text-destructive dark:text-red-300"
            }`}
        >
          <div className="flex items-start gap-3">
            {alert.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            )}
            <div>
              <h4 className="font-semibold text-sm">{alert.title}</h4>
              <p className="text-xs opacity-90 mt-0.5">{alert.message}</p>
            </div>
          </div>
          <button
            onClick={() => setAlert(null)}
            className="text-xs opacity-70 hover:opacity-100 transition-opacity"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-border bg-card shadow-sm hover:border-primary/20 transition-colors">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Active Loans
              <BookOpen className="w-4 h-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-display text-foreground">
              {summary.activeLoansCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Currently checked out</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card shadow-sm hover:border-amber-500/20 transition-colors">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Pending Holds
              <Clock className="w-4 h-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-display text-amber-600 dark:text-amber-400">
              {summary.pendingReservationsCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting desk pickup</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card shadow-sm hover:border-red-500/20 transition-colors">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Overdue Copies
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-display text-destructive">
              {summary.overdueLoansCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Past due return date</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card shadow-sm hover:border-emerald-500/20 transition-colors">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Available Copies
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
              {summary.availableCopiesCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Ready for checkout</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab("checkout")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${activeTab === "checkout"
              ? "bg-primary text-primary-foreground shadow-sm scale-105"
              : "bg-muted/60 hover:bg-muted text-muted-foreground"
            }`}
        >
          <UserCheck className="w-4 h-4" />
          Rapid Checkout
        </button>

        <button
          onClick={() => setActiveTab("checkin")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${activeTab === "checkin"
              ? "bg-primary text-primary-foreground shadow-sm scale-105"
              : "bg-muted/60 hover:bg-muted text-muted-foreground"
            }`}
        >
          <RefreshCw className="w-4 h-4" />
          Rapid Check-in
        </button>

        <button
          onClick={() => setActiveTab("holds")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${activeTab === "holds"
              ? "bg-primary text-primary-foreground shadow-sm scale-105"
              : "bg-muted/60 hover:bg-muted text-muted-foreground"
            }`}
        >
          <Clock className="w-4 h-4" />
          Holds Queue
          {pendingReservations.length > 0 && (
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-brand-yellow text-black font-bold">
              {pendingReservations.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("loans")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${activeTab === "loans"
              ? "bg-primary text-primary-foreground shadow-sm scale-105"
              : "bg-muted/60 hover:bg-muted text-muted-foreground"
            }`}
        >
          <BookOpen className="w-4 h-4" />
          Active Loans ({activeLoans.length})
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${activeTab === "history"
              ? "bg-primary text-primary-foreground shadow-sm scale-105"
              : "bg-muted/60 hover:bg-muted text-muted-foreground"
            }`}
        >
          <History className="w-4 h-4" />
          Copy Audit Trail & Traceability
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: RAPID CHECKOUT */}
      {/* ========================================================= */}
      {activeTab === "checkout" && (
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-lg font-bold font-display flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" /> Sub-10s Checkout Console
            </CardTitle>
            <CardDescription className="text-xs">
              Select student borrower, scan or enter book copy barcode, set loan period, and confirm.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Step 1: Student Lookup */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  1. Student Borrower
                </label>

                {selectedStudent ? (
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">
                        {selectedStudent.firstName} {selectedStudent.lastName}
                      </h4>
                      <p className="text-xs text-muted-foreground">{selectedStudent.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary font-medium">
                          Active Loans: {selectedStudent.activeLoansCount}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedStudent(null)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search student by name, email, or ID..."
                      value={studentQuery}
                      onChange={(e) => setStudentQuery(e.target.value)}
                      className="pl-9 rounded-xl border-border"
                    />
                    {isSearchingStudents && (
                      <div className="absolute right-3 top-3">
                        <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    )}

                    {/* Autocomplete Dropdown */}
                    {studentResults.length > 0 && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-border">
                        {studentResults.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              setSelectedStudent(s);
                              setStudentResults([]);
                              setStudentQuery("");
                            }}
                            className="w-full p-3 text-left hover:bg-muted/80 transition-colors flex items-center justify-between group"
                          >
                            <div>
                              <div className="font-medium text-sm text-foreground">
                                {s.firstName} {s.lastName}
                              </div>
                              <div className="text-xs text-muted-foreground">{s.email}</div>
                            </div>
                            <span className="text-xs text-muted-foreground group-hover:text-primary font-medium">
                              Select →
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2: Copy Scan / Lookup */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  2. Physical Book Copy
                </label>

                {selectedCopy ? (
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted">
                          {selectedCopy.barcode}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600">
                          {selectedCopy.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-foreground mt-1">
                        {selectedCopy.bookTitle}
                      </h4>
                      <p className="text-xs text-muted-foreground">{selectedCopy.bookAuthor}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCopy(null)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <QrCode className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Scan copy barcode (e.g., BC-GATSBY-01) or search title..."
                      value={copyQuery}
                      onChange={(e) => setCopyQuery(e.target.value)}
                      className="pl-9 rounded-xl border-border font-mono"
                    />
                    {isSearchingCopies && (
                      <div className="absolute right-3 top-3">
                        <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    )}

                    {/* Autocomplete Dropdown */}
                    {copyResults.length > 0 && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-border">
                        {copyResults.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedCopy(c);
                              setCopyResults([]);
                              setCopyQuery(c.barcode);
                            }}
                            className="w-full p-3 text-left hover:bg-muted/80 transition-colors flex items-center justify-between group"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-muted rounded">
                                  {c.barcode}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.status === "AVAILABLE"
                                      ? "bg-emerald-500/10 text-emerald-600"
                                      : c.status === "RESERVED"
                                        ? "bg-amber-500/10 text-amber-600"
                                        : "bg-destructive/10 text-destructive"
                                    }`}
                                >
                                  {c.status}
                                </span>
                              </div>
                              <div className="font-medium text-sm text-foreground mt-1">
                                {c.bookTitle}
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground group-hover:text-primary font-medium">
                              Select →
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Loan Duration Presets */}
            <div className="space-y-3 border-t border-border/60 pt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                3. Loan Duration Period
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {[7, 14, 21, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDueDays(days)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${dueDays === days
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card border-border hover:bg-muted text-muted-foreground"
                      }`}
                  >
                    {days} Days (Due {format(addDays(new Date(), days), "MMM dd")})
                  </button>
                ))}
              </div>
            </div>

            {/* Final Action Button */}
            <div className="border-t border-border/60 pt-4 flex justify-end">
              <Button
                onClick={handleCheckout}
                disabled={isPending || !selectedStudent || (!selectedCopy && !copyQuery.trim())}
                size="lg"
                className="rounded-full px-8 font-semibold bg-brand-blue hover:bg-brand-blue/90 text-white shadow-md hover:shadow-lg transition-all"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Processing Checkout...
                  </>
                ) : (
                  <>
                    Confirm & Checkout Copy <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 2: RAPID CHECK-IN */}
      {/* ========================================================= */}
      {activeTab === "checkin" && (
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-lg font-bold font-display flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" /> Sub-10s Check-in Console
            </CardTitle>
            <CardDescription className="text-xs">
              Scan returned physical book barcode, verify physical condition, and return to inventory.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Copy Barcode Scan */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Returned Copy Barcode / ID
                </label>
                <div className="relative">
                  <QrCode className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Scan barcode (e.g., BC-GATSBY-01)..."
                    value={checkinBarcode}
                    onChange={(e) => setCheckinBarcode(e.target.value)}
                    className="pl-9 rounded-xl border-border font-mono text-base"
                  />

                  {/* Autocomplete Dropdown */}
                  {checkinCopyResults.length > 0 && !selectedCheckinCopy && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-border">
                      {checkinCopyResults.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setSelectedCheckinCopy(c);
                            setCheckinBarcode(c.barcode);
                            setCheckinCopyResults([]);
                          }}
                          className="w-full p-3 text-left hover:bg-muted/80 transition-colors flex items-center justify-between group"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-muted rounded">
                                {c.barcode}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                                {c.currentHolderName || "Borrowed"}
                              </span>
                            </div>
                            <div className="font-medium text-sm text-foreground mt-1">
                              {c.bookTitle}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground group-hover:text-primary font-medium">
                            Select →
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedCheckinCopy && (
                  <div className="p-3 rounded-xl border border-border bg-muted/30 text-xs space-y-1">
                    <p className="font-bold text-foreground">{selectedCheckinCopy.bookTitle}</p>
                    <p className="text-muted-foreground">
                      Borrower: {selectedCheckinCopy.currentHolderName}
                    </p>
                  </div>
                )}
              </div>

              {/* Physical Condition Selector */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Returned Physical Condition
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["MINT", "GOOD", "FAIR", "DAMAGED"] as CopyCondition[]).map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => {
                        setCondition(cond);
                        if (cond === "DAMAGED") {
                          setTargetStatus("MAINTENANCE");
                        } else {
                          setTargetStatus("AVAILABLE");
                        }
                      }}
                      className={`p-3 rounded-xl text-xs font-semibold border transition-all text-center ${condition === cond
                          ? cond === "DAMAGED"
                            ? "bg-destructive text-destructive-foreground border-destructive shadow-sm"
                            : "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card border-border hover:bg-muted text-muted-foreground"
                        }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Check-in Notes */}
            <div className="space-y-2 border-t border-border/60 pt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Inspection / Check-in Notes (Optional)
              </label>
              <Input
                placeholder="Add condition notes (e.g. Spine wear, minor page crease)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-xl border-border"
              />
            </div>

            {/* Action Submit Button */}
            <div className="border-t border-border/60 pt-4 flex justify-end">
              <Button
                onClick={handleCheckin}
                disabled={isPending || (!checkinBarcode.trim() && !selectedCheckinCopy)}
                size="lg"
                className="rounded-full px-8 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Processing Check-in...
                  </>
                ) : (
                  <>
                    Confirm & Check-in Copy <CheckCircle2 className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 3: HOLDS QUEUE */}
      {/* ========================================================= */}
      {activeTab === "holds" && (
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-lg font-bold font-display flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" /> Pending Student Holds Queue
            </CardTitle>
            <CardDescription className="text-xs">
              Students who reserved books online and are waiting for physical desk pickup.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {pendingReservations.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-semibold text-sm text-foreground">No Pending Holds in Queue</p>
                <p className="text-xs">All student online reservations have been fulfilled.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-xs">Book Title</TableHead>
                    <TableHead className="text-xs">Student Borrower</TableHead>
                    <TableHead className="text-xs">Assigned Barcode</TableHead>
                    <TableHead className="text-xs">Expiration Date</TableHead>
                    <TableHead className="text-xs text-right">Quick Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReservations.map((resItem) => (
                    <TableRow key={resItem.id} className="border-border hover:bg-muted/40">
                      <TableCell className="font-medium text-sm">
                        <div>
                          <p className="font-bold text-foreground">{resItem.bookTitle}</p>
                          <p className="text-xs text-muted-foreground">{resItem.bookAuthor}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <p className="font-medium text-foreground">{resItem.studentName}</p>
                        <p className="text-muted-foreground">{resItem.studentEmail}</p>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {resItem.copyBarcode ? (
                          <span className="px-2 py-0.5 rounded bg-muted font-bold">
                            {resItem.copyBarcode}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">Any Available</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {format(new Date(resItem.expiresAt), "MMM dd, HH:mm")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleFulfillReservation(resItem)}
                          className="rounded-full text-xs font-semibold bg-brand-yellow hover:bg-brand-yellow/90 text-black border border-black/10"
                        >
                          Fulfill Checkout <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 4: ACTIVE LOANS DIRECTORY */}
      {/* ========================================================= */}
      {activeTab === "loans" && (
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-lg font-bold font-display flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Active Loans Directory
            </CardTitle>
            <CardDescription className="text-xs">
              All physical book copies currently checked out to students.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {activeLoans.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground space-y-2">
                <BookOpen className="w-8 h-8 text-primary mx-auto" />
                <p className="font-semibold text-sm text-foreground">No Active Loans</p>
                <p className="text-xs">There are currently no books checked out.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-xs">Copy Barcode</TableHead>
                    <TableHead className="text-xs">Book Title</TableHead>
                    <TableHead className="text-xs">Student Borrower</TableHead>
                    <TableHead className="text-xs">Borrowed Date</TableHead>
                    <TableHead className="text-xs">Due Date</TableHead>
                    <TableHead className="text-xs text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeLoans.map((loanItem) => (
                    <TableRow key={loanItem.id} className="border-border hover:bg-muted/40">
                      <TableCell className="font-mono text-xs font-bold">
                        <span className="px-2 py-0.5 rounded bg-muted">
                          {loanItem.copyBarcode}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        <p className="font-bold text-foreground">{loanItem.bookTitle}</p>
                        <p className="text-xs text-muted-foreground">{loanItem.bookAuthor}</p>
                      </TableCell>
                      <TableCell className="text-xs">
                        <p className="font-medium text-foreground">{loanItem.studentName}</p>
                        <p className="text-muted-foreground">{loanItem.studentEmail}</p>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {format(new Date(loanItem.borrowedAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${loanItem.isOverdue
                              ? "bg-destructive/10 text-destructive border border-destructive/20 animate-pulse"
                              : "bg-muted text-foreground"
                            }`}
                        >
                          {format(new Date(loanItem.dueDate), "MMM dd, yyyy")}
                          {loanItem.isOverdue && " (OVERDUE)"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectLoanForCheckin(loanItem)}
                          className="rounded-full text-xs font-semibold hover:bg-primary hover:text-primary-foreground border-border"
                        >
                          Return Check-in
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 5: COPY TRACEABILITY & AUDIT HISTORY */}
      {/* ========================================================= */}
      {activeTab === "history" && (
        <CopyTraceabilityView />
      )}
    </div>
  );
}
