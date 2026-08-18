import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  Clock,
  MapPin,
  ArrowRight,
  BookMarked,
  BarChart3,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Welcome to School Library Management | ShelfSync",
  description:
    "Explore physical book collections, opening hours, circulation rules, and student borrowing services at the School Library.",
};

export default async function HomePage() {
  const { userId } = await auth();

  // If user is already authenticated, redirect seamlessly to the interactive Catalog
  if (userId) {
    redirect("/catalog");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative border-b border-border bg-canvas-warm dark:bg-canvas-dark py-16 md:py-24 bg-grid-pattern overflow-hidden">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-yellow text-black text-xs font-bold tracking-tight shadow-sm">
            <Sparkles className="h-4 w-4" />
            <span>School Library Management System</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
            Empowering Readers with <span className="underline decoration-brand-yellow decoration-4 underline-offset-4">Real-Time</span> Library Intelligence
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Welcome to ShelfSync. Browse physical books, track copy availability, reserve holds online, and experience sub-10s circulation desk checkouts.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-in">
              <Button size="lg" className="w-full sm:w-auto rounded-full bg-brand-blue text-white hover:bg-brand-blue/90 font-semibold px-8 gap-2">
                <span>Sign In to Your Account</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/catalog">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full font-semibold px-8 gap-2 border-border">
                <BookOpen className="h-4 w-4 text-brand-yellow" />
                <span>Explore Book Catalog</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Library Features & Benefits */}
      <section className="py-16 bg-card border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-foreground">
              Modern Library Services Designed for Students &amp; Staff
            </h2>
            <p className="text-sm text-muted-foreground">
              Built for speed, accuracy, and absolute copy traceability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-border bg-background space-y-4 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-brand-yellow/20 text-yellow-600 dark:text-brand-yellow flex items-center justify-center font-bold">
                <BookMarked className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground">
                Live Inventory Tracking
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Know instantly whether physical copies are Available, Reserved, or Borrowed with estimated return calendars.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-background space-y-4 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground">
                Rapid Circulation Desk
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Assistants execute physical checkouts and returns in under 10 seconds with automatic audit trail logging.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-background space-y-4 shadow-xs">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground">
                Verified Reviews &amp; Ratings
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Read authentic reader comments and star ratings to find your next great book recommendation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Library Hours & Information Callout */}
      <section className="py-16 bg-canvas-warm dark:bg-canvas-dark border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-foreground text-xs font-mono border border-border">
              <Clock className="h-3.5 w-3.5 text-brand-blue" />
              <span>Library Hours &amp; Access</span>
            </div>

            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground">
              Visit the Circulation Desk &amp; Reading Rooms
            </h2>

            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Regular Hours:</strong> Monday – Friday, 8:00 AM – 5:00 PM
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Standard Loan Limits:</strong> Up to 3 books per student for 14 days (extendable up to 30 days).
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Online Holds:</strong> Holds reserved online are kept at the circulation desk for 48 hours.
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="h-10 w-10 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">Main Campus Library</h3>
                <p className="text-xs text-muted-foreground">Building B, 2nd Floor &bull; Central Desk</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-muted-foreground font-mono">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span>Weekdays (Mon-Fri)</span>
                <span className="font-semibold text-foreground">8:00 AM – 5:00 PM</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span>Saturday</span>
                <span className="font-semibold text-foreground">9:00 AM – 1:00 PM</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Sunday &amp; Holidays</span>
                <span className="font-semibold text-rose-500">Closed</span>
              </div>
            </div>

            <Link href="/sign-up" className="block pt-2">
              <Button className="w-full rounded-full bg-brand-blue text-white hover:bg-brand-blue/90 font-medium text-xs">
                Create Student Account &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 text-center text-xs text-muted-foreground mt-auto">
        <div className="container max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-brand-yellow" />
            <span className="font-bold text-foreground">ShelfSync School Library</span>
          </div>
          <span>&copy; {new Date().getFullYear()} School Library System. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
