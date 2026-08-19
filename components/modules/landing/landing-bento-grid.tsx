"use client";

import { useState } from "react";
import {
  Users,
  BarChart3,
  FileText,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function LandingBentoGrid() {
  const [activeFilter, setActiveFilter] = useState<"Daily" | "Weekly" | "Monthly">("Monthly");
  const [selectedBadge, setSelectedBadge] = useState<string>("Course Reserve Telemetry");

  return (
    <section id="features" className="py-20 bg-card border-b border-hairline">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div data-aos="fade-up" className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="outline" className="px-3 py-1 font-mono text-xs">
            Built for Modern Libraries
          </Badge>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-foreground tracking-tight">
            Built for Modern Libraries
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Empowering students, campus librarians, and faculty with real-time catalog search, hold reservations, and circulation desk telemetry.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Librarians & Desk Staff */}
          <Card data-aos="fade-up" data-aos-delay="100" className="flex flex-col justify-between p-6 rounded-3xl border border-hairline bg-background shadow-soft-floating transition-spring hover-scale-card">
            <CardHeader className="p-0 space-y-2">
              <div className="h-10 w-10 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold">
                <BarChart3 className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-bold">For Librarians &amp; Desk Staff</CardTitle>
              <CardDescription>
                A unified cloud console for book acquisitions, cataloging, hold queues, and desk checkouts.
              </CardDescription>
            </CardHeader>

            {/* Widget UI: Circulation Telemetry Bar Chart */}
            <CardContent className="p-0 pt-6">
              <div className="p-4 rounded-2xl bg-card border border-hairline space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-brand-blue" />
                    Circulation Volume
                  </span>
                  <Badge variant="blue" className="text-[10px] font-mono px-2 py-0.5">
                    Monthly
                  </Badge>
                </div>

                {/* Monthly Bar Chart (Jan - Jun) */}
                <div className="grid grid-cols-6 gap-2 items-end h-24 pt-2">
                  {[
                    { month: "Jan", val: "65%" },
                    { month: "Feb", val: "85%" },
                    { month: "Mar", val: "45%" },
                    { month: "Apr", val: "90%" },
                    { month: "May", val: "75%" },
                    { month: "Jun", val: "95%" },
                  ].map((bar, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end group">
                      <div
                        style={{ height: bar.val }}
                        className="w-full rounded-t-md bg-gradient-to-t from-brand-blue to-blue-600 group-hover:brightness-110 transition-all"
                      />
                      <span className="text-[9px] font-mono text-muted-foreground">{bar.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Faculty & Department Leads */}
          <Card data-aos="fade-up" data-aos-delay="200" className="flex flex-col justify-between p-6 rounded-3xl border border-hairline bg-background shadow-soft-floating transition-spring hover-scale-card">
            <CardHeader className="p-0 space-y-2">
              <div className="h-10 w-10 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold">
                <TrendingUp className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-bold">For Faculty &amp; Academic Leads</CardTitle>
              <CardDescription>
                Track course textbook demands, borrowing trends, and physical copy availability in real time.
              </CardDescription>
            </CardHeader>

            {/* Widget UI: Interactive Dynamic Badges */}
            <CardContent className="p-0 pt-6 space-y-2.5">
              {[
                "Course Reserve Telemetry",
                "Acquisition Priorities",
                "Real-Time Shelf Stock",
              ].map((badgeText) => (
                <button
                  key={badgeText}
                  onClick={() => setSelectedBadge(badgeText)}
                  className={`w-full text-left p-3 rounded-2xl border text-xs font-semibold transition-all duration-300 ease-out flex items-center justify-between ${
                    selectedBadge === badgeText
                      ? "bg-brand-blue text-white border-brand-blue shadow-sm"
                      : "bg-card text-foreground border-hairline hover:bg-accent"
                  }`}
                >
                  <span>{badgeText}</span>
                  <span className="text-[10px] opacity-80">&rarr;</span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Card 3: Catalog Compliance & Policy Stack */}
          <Card data-aos="fade-up" data-aos-delay="300" className="flex flex-col justify-between p-6 rounded-3xl border border-hairline bg-background shadow-soft-floating transition-spring hover-scale-card">
            <CardHeader className="p-0 space-y-2">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-bold">Catalog &amp; Loan Policies</CardTitle>
              <CardDescription>
                Manage MARC21 metadata standards, physical copy barcodes, and automated loan policies.
              </CardDescription>
            </CardHeader>

            {/* Widget UI: Document Stack Review */}
            <CardContent className="p-0 pt-6">
              <div className="relative space-y-2">
                <div className="p-3 rounded-2xl bg-card border border-hairline shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
                    <FileText className="h-4 w-4 text-emerald-500" />
                    <span>MARC21 Metadata Schema</span>
                  </div>
                  <Badge variant="emerald" className="text-[10px] font-mono">
                    Verified
                  </Badge>
                </div>
                <div className="p-3 rounded-2xl bg-card/70 border border-hairline text-xs flex items-center justify-between opacity-80">
                  <div className="flex items-center gap-2.5 text-foreground">
                    <FileText className="h-4 w-4 text-brand-blue" />
                    <span>Physical Copy Loan Policy</span>
                  </div>
                  <Badge variant="blue" className="text-[10px] font-mono">
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: All Book & Patron Telemetry (Col-span 2) */}
          <Card data-aos="fade-up" data-aos-delay="400" className="md:col-span-2 flex flex-col justify-between p-6 rounded-3xl border border-hairline bg-background shadow-soft-floating transition-spring hover-scale-card">
            <CardHeader className="p-0 space-y-2">
              <div className="h-10 w-10 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                <Users className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-bold">Centralized Catalog &amp; Patron Telemetry</CardTitle>
              <CardDescription>
                ISBN records, physical copy holdings, student checkout histories, active holds, and fine audits.
              </CardDescription>
            </CardHeader>

            {/* Widget UI: Patron Table & Category Loan Rates */}
            <CardContent className="p-0 pt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 border border-hairline rounded-2xl bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-hairline hover:bg-transparent">
                      <TableHead className="py-2 px-3 text-xs">Book Title</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Patron</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Category</TableHead>
                      <TableHead className="py-2 px-3 text-xs text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: "Clean Code", patron: "Albert Gray", cat: "CS / Software", status: "Active Loan" },
                      { name: "Quantum Physics", patron: "Emma Russel", cat: "Physics", status: "Hold Ready" },
                      { name: "Design Patterns", patron: "David Reed", cat: "Engineering", status: "Returned" },
                    ].map((row, idx) => (
                      <TableRow key={idx} className="hover:bg-accent/40 text-xs">
                        <TableCell className="py-2.5 px-3 font-bold text-foreground">{row.name}</TableCell>
                        <TableCell className="py-2.5 px-3 text-muted-foreground">{row.patron}</TableCell>
                        <TableCell className="py-2.5 px-3 text-muted-foreground">{row.cat}</TableCell>
                        <TableCell className="py-2.5 px-3 text-right font-mono font-bold text-brand-blue">{row.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Side Chart: Category Loan Rates using Shadcn Progress */}
              <div className="border border-hairline rounded-2xl bg-card p-3 space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-foreground">Category Loans</span>
                  <div className="flex gap-1">
                    {(["Daily", "Weekly", "Monthly"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`px-1.5 py-0.5 text-[9px] rounded-md font-mono ${
                          activeFilter === f ? "bg-brand-blue text-white" : "text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {f[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {[
                    { label: "Computer Science", val: 95 },
                    { label: "Engineering", val: 80 },
                    { label: "Physics & Math", val: 65 },
                    { label: "Literature", val: 40 },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
                        <span>{item.label}</span>
                        <span>{item.val}%</span>
                      </div>
                      <Progress value={item.val} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Students & Researchers */}
          <Card data-aos="fade-up" data-aos-delay="500" className="flex flex-col justify-between p-6 rounded-3xl border border-hairline bg-background shadow-soft-floating transition-spring hover-scale-card">
            <CardHeader className="p-0 space-y-2">
              <div className="h-10 w-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                <UserCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-bold">For Students &amp; Borrowers</CardTitle>
              <CardDescription>
                Know physical copy availability on shelf, receive pickup alerts, and manage active holds.
              </CardDescription>
            </CardHeader>

            {/* Widget UI: Circular Patron Roster with Shadcn Avatar */}
            <CardContent className="p-0 pt-6 space-y-3">
              <div className="p-4 rounded-2xl bg-card border border-hairline flex items-center justify-between shadow-xs">
                <div className="flex -space-x-2 overflow-hidden">
                  <Avatar className="h-9 w-9 bg-amber-400 text-black border-2 border-card">
                    <AvatarFallback className="bg-amber-400 text-black font-bold text-xs">AG</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-9 w-9 bg-brand-blue text-white border-2 border-card">
                    <AvatarFallback className="bg-brand-blue text-white font-bold text-xs">ER</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-9 w-9 bg-emerald-500 text-white border-2 border-card">
                    <AvatarFallback className="bg-emerald-500 text-white font-bold text-xs">DR</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-9 w-9 bg-violet-600 text-white border-2 border-card">
                    <AvatarFallback className="bg-violet-600 text-white font-bold text-xs">+15</AvatarFallback>
                  </Avatar>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-500 flex items-center gap-1 justify-end">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    18 Active Holds
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">4 Ready for Pickup</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
