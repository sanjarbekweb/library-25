"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { format, addDays, differenceInCalendarDays } from "date-fns";
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
import { toast } from "react-toastify";
import { CopyTraceabilityView } from "@/components/modules/history/copy-traceability-view";
import { CalendarUsageLimitPicker } from "@/components/modules/books/calendar-usage-limit-picker";
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
import type {
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
        const msg = `Physical copy ${res.data.copyBarcode} checked out to ${res.data.studentName}. Due: ${format(new Date(res.data.dueDate), "MMM dd, yyyy")}`;
        setAlert({
          type: "success",
          title: "Checkout Completed Successfully",
          message: msg,
        });
        toast.success(`Checkout Success: ${res.data.copyBarcode} assigned to ${res.data.studentName}`);
        // Reset form
        setSelectedStudent(null);
        setSelectedCopy(null);
        setStudentQuery("");
        setCopyQuery("");
      } else {
        const errMsg = res.error?.message || "An error occurred during checkout.";
        setAlert({
          type: "error",
          title: "Checkout Failed",
          message: errMsg,
        });
        toast.error(errMsg);
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
        setCheckinCopyResults(res.data);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [checkinBarcode]);

  // Execute Rapid Check-in
  const handleCheckin = () => {
    const targetIdentifier = selectedCheckinCopy ? selectedCheckinCopy.barcode : checkinBarcode.trim();
    if (!targetIdentifier) {
      const errMsg = "Please enter or scan a book copy barcode to check in.";
      setAlert({
        type: "error",
        title: "Barcode Required",
        message: errMsg,
      });
      toast.warn(errMsg);
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
        const msg = `Physical copy ${res.data.copyBarcode} (${res.data.bookTitle}) returned by ${res.data.studentName}. Status set to ${res.data.newStatus}.`;
        setAlert({
          type: "success",
          title: "Check-in Completed Successfully",
          message: msg,
        });
        toast.success(`Check-in Success: ${res.data.copyBarcode} returned by ${res.data.studentName}`);
        // Reset check-in form
        setCheckinBarcode("");
        setSelectedCheckinCopy(null);
        setNotes("");
        setCondition("GOOD");
        setTargetStatus("AVAILABLE");
      } else {
        const errMsg = res.error?.message || "An error occurred during check-in.";
        setAlert({
          type: "error",
          title: "Check-in Failed",
          message: errMsg,
        });
        toast.error(errMsg);
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
      borrowedAt: loanItem.borrowedAt,
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

            {/* Step 3: Loan Duration & Calendar Usage Limit Selector */}
            <div className="space-y-3 border-t border-border/60 pt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                3. Loan Duration & Expiration Deadline (Calendar Style)
              </label>
              <CalendarUsageLimitPicker
                initialDays={dueDays}
                maxUsageDays={30}
                onChange={(days) => setDueDays(days)}
              />
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
      {/* TAB 2: RAPID CHECK-IN & EARLY RETURN */}
      {/* ========================================================= */}
      {activeTab === "checkin" && (
        <Card className="rounded-2xl border border-border bg-card shadow-sm relative z-40 overflow-visible">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-bold font-display flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-emerald-500" /> Sub-10s Check-in Console
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Search by book title or scan barcode. Books can be checked in early before their due date at any time.
                </CardDescription>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> Early Return Allowed
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6 relative z-40 overflow-visible">
            {/* Early Return Notice Banner */}
            <div className="p-3.5 rounded-2xl bg-accent/60 border border-border text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-brand-yellow shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-foreground block">Early Return {"&"} Instant Re-stocking</span>
                <span className="text-muted-foreground">
                  Students may return physical books prior to or past their due date. Processing a return immediately releases the copy back to Available inventory.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-40 overflow-visible">
              {/* Copy / Book Title Search */}
              <div className="space-y-3 relative z-50">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" /> 1. Search Book Title or Scan Barcode
                </label>
                <div className="relative z-50">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search by book name (e.g. 1984, Gatsby) or scan barcode..."
                    value={checkinBarcode}
                    onChange={(e) => {
                      setCheckinBarcode(e.target.value);
                      if (selectedCheckinCopy && e.target.value !== selectedCheckinCopy.barcode) {
                        setSelectedCheckinCopy(null);
                      }
                    }}
                    className="pl-9 rounded-xl border-border font-medium text-sm min-h-[44px]"
                  />

                  {/* Search Autocomplete Dropdown */}
                  {checkinCopyResults.length > 0 && !selectedCheckinCopy && (
                    <div className="absolute z-[100] top-full left-0 right-0 mt-2 bg-popover text-popover-foreground border border-border rounded-2xl shadow-2xl max-h-80 overflow-y-auto divide-y divide-border/60 p-1">
                      {checkinCopyResults.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedCheckinCopy(c);
                            setCheckinBarcode(c.barcode);
                            setCheckinCopyResults([]);
                          }}
                          className="w-full p-3.5 text-left hover:bg-accent/70 transition-colors flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Book Cover Thumbnail */}
                            <div className="relative h-12 w-9 rounded bg-muted overflow-hidden shrink-0 border border-border shadow-2xs">
                              {c.coverImageUrl ? (
                                <Image
                                  src={c.coverImageUrl}
                                  alt={c.bookTitle}
                                  fill
                                  sizes="36px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-brand-yellow/20 text-brand-yellow">
                                  <BookOpen className="h-4 w-4" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-muted text-foreground rounded border border-border">
                                  {c.barcode}
                                </span>
                                {c.status === "BORROWED" && c.currentHolderName ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                                    <UserCheck className="w-3 h-3 text-blue-500 shrink-0" />
                                    Book In Hand: {c.currentHolderName}
                                  </span>
                                ) : c.status === "RESERVED" && c.currentHolderName ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                    <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                                    Reserved Hold (Awaiting Pickup): {c.currentHolderName}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                    Available on Shelf
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-sm text-foreground truncate group-hover:text-brand-blue transition-colors">
                                {c.bookTitle}
                              </h4>
                              <p className="text-xs text-muted-foreground truncate">by {c.bookAuthor}</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0 gap-1">
                            <span className="text-xs text-brand-blue font-bold group-hover:translate-x-0.5 transition-transform">
                              Select {"→"}
                            </span>
                            {c.dueDate && (
                              <span className="text-[10px] text-muted-foreground font-mono">
                                Due {format(new Date(c.dueDate), "MMM dd")}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {!selectedCheckinCopy && (
                  <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-brand-yellow" />
                    Type a book title or barcode above, then click on the matching book from the search list to select it for check-in.
                  </p>
                )}

                {/* Selected Book Rich Return Preview Card */}
                {selectedCheckinCopy && (
                  <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 animate-in fade-in zoom-in-95">
                    <div className="flex items-start justify-between gap-3 border-b border-emerald-500/20 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-10 rounded-lg bg-muted overflow-hidden shrink-0 border border-border shadow-xs">
                          {selectedCheckinCopy.coverImageUrl ? (
                            <Image
                              src={selectedCheckinCopy.coverImageUrl}
                              alt={selectedCheckinCopy.bookTitle}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-brand-yellow/20 text-brand-yellow">
                              <BookOpen className="h-5 w-5" />
                            </div>
                          )}
                        </div>

                        <div>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-card border border-border text-foreground">
                            {selectedCheckinCopy.barcode}
                          </span>
                          <h4 className="font-bold text-base text-foreground mt-1 leading-tight">
                            {selectedCheckinCopy.bookTitle}
                          </h4>
                          <p className="text-xs text-muted-foreground font-medium">by {selectedCheckinCopy.bookAuthor}</p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCheckinCopy(null)}
                        className="text-xs text-muted-foreground hover:text-foreground shrink-0"
                      >
                        Change
                      </Button>
                    </div>

                    {/* Borrower & Due Date Info or Unborrowed Warning */}
                    {selectedCheckinCopy.status === "BORROWED" || selectedCheckinCopy.activeLoanId ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-card border border-border/60 space-y-0.5">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                              Physical Holder (Book In Hand)
                            </span>
                            <span className="font-bold text-foreground block truncate">
                              {selectedCheckinCopy.currentHolderName || "Assigned Student"}
                            </span>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-medium">
                              Active Borrower • Possesses Physical Copy
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-card border border-border/60 space-y-0.5">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Due Date</span>
                            <span className="font-mono font-bold text-foreground block">
                              {selectedCheckinCopy.dueDate
                                ? format(new Date(selectedCheckinCopy.dueDate), "MMM dd, yyyy")
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Early Return / Overdue Calculation Indicator */}
                        {selectedCheckinCopy.dueDate && (() => {
                          const now = new Date();
                          const dueDate = new Date(selectedCheckinCopy.dueDate);
                          const daysDiff = differenceInCalendarDays(dueDate, now);

                          if (daysDiff > 0) {
                            return (
                              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                  Early Return ({daysDiff} Day{daysDiff === 1 ? "" : "s"} Before Due Date)
                                </span>
                                <span className="font-mono text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                                  On Schedule
                                </span>
                              </div>
                            );
                          } else if (daysDiff === 0) {
                            return (
                              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                                Returned On Due Date
                              </div>
                            );
                          } else {
                            const overdueDays = Math.abs(daysDiff);
                            return (
                              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                                Returned Overdue ({overdueDays} Day{overdueDays === 1 ? "" : "s"} Past Due)
                              </div>
                            );
                          }
                        })()}
                      </>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block font-bold">Copy is Currently {selectedCheckinCopy.status}</strong>
                            <span>Physical copy {selectedCheckinCopy.barcode} is currently in the library inventory and does not have an active borrowing record to check in.</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveTab("checkout");
                            setCopyQuery(selectedCheckinCopy.barcode);
                          }}
                          className="rounded-full text-xs font-semibold gap-1 bg-card hover:bg-accent"
                        >
                          Switch to Checkout Tab {"→"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Physical Condition Selector */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  2. Returned Physical Condition
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
                      className={`p-3.5 rounded-xl text-xs font-semibold border transition-all text-center min-h-[44px] ${
                        condition === cond
                          ? cond === "DAMAGED"
                            ? "bg-destructive text-destructive-foreground border-destructive shadow-sm"
                            : "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {cond}
                      {cond === "DAMAGED" && <span className="block text-[9px] opacity-80 mt-0.5">(Maintenance)</span>}
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Selecting <strong className="text-foreground">DAMAGED</strong> automatically routes the physical copy to maintenance status.
                </p>
              </div>
            </div>

            {/* Additional Check-in Notes */}
            <div className="space-y-2 border-t border-border/60 pt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Inspection / Check-in Notes (Optional)
              </label>
              <Input
                placeholder="Add condition notes (e.g. Returned early by student, spine in good condition)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-xl border-border min-h-[44px] text-xs"
              />
            </div>

            {/* Action Submit Button */}
            <div className="border-t border-border/60 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground font-mono">
                {selectedCheckinCopy ? (
                  selectedCheckinCopy.status === "BORROWED" || selectedCheckinCopy.activeLoanId ? (
                    <>Ready to check in <strong className="text-foreground">{selectedCheckinCopy.barcode}</strong> ({selectedCheckinCopy.bookTitle})</>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">Copy {selectedCheckinCopy.barcode} is currently {selectedCheckinCopy.status} (no active borrowing record).</span>
                  )
                ) : (
                  <>Please select a target book from search results above to enable check-in.</>
                )}
              </span>

              <Button
                onClick={handleCheckin}
                disabled={
                  isPending ||
                  !selectedCheckinCopy ||
                  (selectedCheckinCopy.status !== "BORROWED" && !selectedCheckinCopy.activeLoanId)
                }
                size="lg"
                className="w-full sm:w-auto rounded-full px-8 font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-md hover:shadow-lg transition-all min-h-[44px]"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Processing Check-in...
                  </>
                ) : (
                  <>
                    Confirm {"&"} Check-in Copy <CheckCircle2 className="w-4 h-4 ml-2" />
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
