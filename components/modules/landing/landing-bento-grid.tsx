"use client";

import { useState, useRef } from "react";
import {
  Users,
  BarChart3,
  FileText,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Calendar,
  Clock,
  BookOpen,
  Sparkles,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserPresenceAvatar } from "@/components/animate-ui/components/community/user-presence-avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export function LandingBentoGrid() {
  const [activeFilter, setActiveFilter] = useState<"Daily" | "Weekly" | "Monthly">("Monthly");
  const [selectedBadge, setSelectedBadge] = useState<string>("Course Reserve Telemetry");
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { reduceMotion } = context.conditions as { reduceMotion: boolean };

          if (reduceMotion) {
            gsap.set([".bento-header", ".bento-card", ".bar-chart-bar"], {
              autoAlpha: 1,
              y: 0,
              scaleY: 1,
            });
            return;
          }

          // Header scroll reveal
          gsap.from(".bento-header", {
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
            autoAlpha: 0,
            y: 30,
            duration: 0.8,
            ease: "power3.out",
          });

          // Bento cards staggered entrance
          gsap.from(".bento-card", {
            scrollTrigger: {
              trigger: ".bento-grid-wrapper",
              start: "top 78%",
              toggleActions: "play none none none",
            },
            autoAlpha: 0,
            y: 35,
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
          });
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="features"
      ref={sectionRef}
      className="py-20 lg:py-24 bg-slate-50/70 dark:bg-[#07090D] border-b border-border/80 overflow-hidden relative transition-colors duration-300"
    >
      {/* Background Subtle Ambiance */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-[130px] pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none -z-0" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 relative z-10">
        {/* Section Header */}
        <div className="bento-header text-center space-y-3.5 max-w-2xl mx-auto will-change-transform">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/80 text-foreground text-xs font-semibold shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-brand-blue" />
            <span>Circulation Infrastructure</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-foreground tracking-tight">
            Built for Modern Libraries
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Empowering students, campus librarians, and faculty with real-time catalog search, hold reservations, and circulation desk telemetry.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="bento-grid-wrapper grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7">
          {/* Card 1: Librarians & Desk Staff */}
          <Card className="bento-card flex flex-col justify-between p-6 sm:p-7 rounded-3xl border border-border/80 bg-card/85 dark:bg-zinc-900/60 backdrop-blur-md shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand-blue/40 will-change-transform">
            <CardHeader className="p-0 space-y-2.5">
              <div className="h-11 w-11 rounded-2xl bg-blue-500/10 text-brand-blue flex items-center justify-center font-bold shadow-2xs">
                <BarChart3 className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-bold font-display text-foreground">
                For Librarians &amp; Desk Staff
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                A unified cloud console for book acquisitions, cataloging, hold queues, and desk checkouts.
              </CardDescription>
            </CardHeader>

            {/* Widget UI: Circulation Telemetry Bar Chart */}
            <CardContent className="p-0 pt-6">
              <div className="bar-chart-container p-4 rounded-2xl bg-slate-50/90 dark:bg-zinc-950/70 border border-border/80 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-brand-blue" />
                    <span>Circulation Volume</span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue">
                    +18% Peak
                  </span>
                </div>

                {/* Monthly Bar Chart (Jan - Jun) */}
                <div className="grid grid-cols-6 gap-2.5 items-end h-28 pt-2">
                  {[
                    { month: "Jan", height: "65%", val: "650" },
                    { month: "Feb", height: "85%", val: "850" },
                    { month: "Mar", height: "50%", val: "500" },
                    { month: "Apr", height: "92%", val: "920" },
                    { month: "May", height: "78%", val: "780" },
                    { month: "Jun", height: "98%", val: "980" },
                  ].map((bar, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group cursor-default">
                      <div className="w-full flex justify-center items-end h-full">
                        <div
                          style={{ height: bar.height }}
                          className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-brand-blue to-indigo-500 shadow-xs group-hover:brightness-115 group-hover:shadow-md transition-all duration-300"
                          title={`${bar.month}: ${bar.val} checkouts`}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {bar.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Faculty & Department Leads */}
          <Card className="bento-card flex flex-col justify-between p-6 sm:p-7 rounded-3xl border border-border/80 bg-card/85 dark:bg-zinc-900/60 backdrop-blur-md shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand-blue/40 will-change-transform">
            <CardHeader className="p-0 space-y-2.5">
              <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-2xs">
                <TrendingUp className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-bold font-display text-foreground">
                For Faculty &amp; Academic Leads
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Track course textbook demands, borrowing trends, and physical copy availability in real time.
              </CardDescription>
            </CardHeader>

            {/* Widget UI: Interactive Dynamic Badges */}
            <CardContent className="p-0 pt-6 space-y-2.5">
              {[
                { title: "Course Reserve Telemetry", metric: "48 Active Titles" },
                { title: "Acquisition Priorities", metric: "14 High Demand" },
                { title: "Real-Time Shelf Stock", metric: "96% Available" },
              ].map((item) => (
                <button
                  key={item.title}
                  onClick={() => setSelectedBadge(item.title)}
                  className={`w-full text-left p-3 rounded-2xl border text-xs font-semibold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    selectedBadge === item.title
                      ? "bg-brand-blue text-white border-transparent shadow-xs shadow-brand-blue/20"
                      : "bg-slate-50/90 dark:bg-zinc-950/70 text-foreground border-border/80 hover:bg-accent/70"
                  }`}
                >
                  <span className="font-semibold">{item.title}</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      selectedBadge === item.title
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.metric}
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Card 3: Catalog Compliance & Policy Stack */}
          <Card className="bento-card flex flex-col justify-between p-6 sm:p-7 rounded-3xl border border-border/80 bg-card/85 dark:bg-zinc-900/60 backdrop-blur-md shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-emerald-500/40 will-change-transform">
            <CardHeader className="p-0 space-y-2.5">
              <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-2xs">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-bold font-display text-foreground">
                Catalog &amp; Loan Policies
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Manage MARC21 metadata standards, physical copy barcodes, and automated loan policies.
              </CardDescription>
            </CardHeader>

            {/* Widget UI: Document Stack Review */}
            <CardContent className="p-0 pt-6">
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-zinc-950/70 border border-border/80 shadow-2xs flex items-center justify-between transition-colors hover:border-emerald-500/30">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
                    <FileText className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div>
                      <div className="font-bold">MARC21 Metadata Schema</div>
                      <div className="text-[11px] text-muted-foreground font-normal">OPAC &bull; Z39.50 compliant</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                    Verified
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-zinc-950/70 border border-border/80 shadow-2xs flex items-center justify-between transition-colors hover:border-brand-blue/30">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
                    <Clock className="h-4 w-4 text-brand-blue shrink-0" />
                    <div>
                      <div className="font-bold">14-Day Physical Loan Policy</div>
                      <div className="text-[11px] text-muted-foreground font-normal">Auto fine &bull; Online renewal</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                    Active
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: All Book & Patron Telemetry (Col-span 2) */}
          <Card className="bento-card md:col-span-2 flex flex-col justify-between p-6 sm:p-7 rounded-3xl border border-border/80 bg-card/85 dark:bg-zinc-900/60 backdrop-blur-md shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-purple-500/40 will-change-transform">
            <CardHeader className="p-0 space-y-2.5">
              <div className="h-11 w-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shadow-2xs">
                <Users className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-bold font-display text-foreground">
                Centralized Catalog &amp; Patron Telemetry
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                ISBN records, physical copy holdings, student checkout histories, active holds, and fine audits.
              </CardDescription>
            </CardHeader>

            {/* Widget UI: Patron Table & Category Loan Rates */}
            <CardContent className="p-0 pt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 border border-border/80 rounded-2xl bg-slate-50/90 dark:bg-zinc-950/70 overflow-hidden overflow-x-auto shadow-2xs">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/80 hover:bg-transparent bg-muted/30">
                      <TableHead className="py-2.5 px-3.5 text-xs font-bold text-foreground">Book Title</TableHead>
                      <TableHead className="py-2.5 px-3.5 text-xs font-semibold text-muted-foreground">Patron</TableHead>
                      <TableHead className="py-2.5 px-3.5 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Category</TableHead>
                      <TableHead className="py-2.5 px-3.5 text-xs text-right font-bold text-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: "Clean Code", patron: "Albert Gray", cat: "CS / Software", status: "Active Loan", type: "blue" },
                      { name: "Quantum Physics", patron: "Emma Russel", cat: "Physics", status: "Hold Ready", type: "emerald" },
                      { name: "Design Patterns", patron: "David Reed", cat: "Engineering", status: "Returned", type: "muted" },
                    ].map((row, idx) => (
                      <TableRow key={idx} className="hover:bg-accent/40 text-xs border-b border-border/60 last:border-0 transition-colors">
                        <TableCell className="py-3 px-3.5 font-bold text-foreground">{row.name}</TableCell>
                        <TableCell className="py-3 px-3.5 text-muted-foreground">{row.patron}</TableCell>
                        <TableCell className="py-3 px-3.5 text-muted-foreground hidden sm:table-cell">{row.cat}</TableCell>
                        <TableCell className="py-3 px-3.5 text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              row.type === "emerald"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                                : row.type === "blue"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {row.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Side Chart: Category Loan Rates using Progress */}
              <div className="border border-border/80 rounded-2xl bg-slate-50/90 dark:bg-zinc-950/70 p-4 space-y-3 flex flex-col justify-between shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">Demand by Discipline</span>
                  <div className="flex gap-1 bg-background/60 p-0.5 rounded-lg border border-border/70">
                    {(["Daily", "Weekly", "Monthly"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`px-2 py-0.5 text-xs rounded-md font-medium transition-all cursor-pointer ${
                          activeFilter === f
                            ? "bg-brand-blue text-white font-semibold shadow-2xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {f[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  {[
                    { label: "Computer Science", val: 95 },
                    { label: "Engineering", val: 80 },
                    { label: "Physics & Math", val: 65 },
                    { label: "Literature", val: 45 },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/80">{item.label}</span>
                        <span className="font-semibold text-brand-blue">{item.val}%</span>
                      </div>
                      <Progress value={item.val} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Students & Borrowers */}
          <Card className="bento-card flex flex-col justify-between p-6 sm:p-7 rounded-3xl border border-border/80 bg-card/85 dark:bg-zinc-900/60 backdrop-blur-md shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-teal-500/40 will-change-transform">
            <CardHeader className="p-0 space-y-2.5">
              <div className="h-11 w-11 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold shadow-2xs">
                <UserCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-bold font-display text-foreground">
                For Students &amp; Borrowers
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Live campus reader presence, instant hold queues, and pickup notifications.
              </CardDescription>
            </CardHeader>

            {/* Widget UI: Interactive User Presence & Pickup Card */}
            <CardContent className="p-0 pt-6 space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-zinc-950/70 border border-border/80 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <UserPresenceAvatar size="sm" />
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 justify-end">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      18 Active Holds
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">4 Ready at Desk</div>
                  </div>
                </div>

                {/* Instant Pickup Notification Snippet */}
                <div className="pt-2 border-t border-border/70 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <BookOpen className="h-3.5 w-3.5 text-brand-blue shrink-0" />
                    <span className="truncate max-w-[140px] font-semibold">Clean Architecture</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full">
                    Ready
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
