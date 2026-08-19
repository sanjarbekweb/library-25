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
            <span>School Library</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
            Real-Time <span className="underline decoration-brand-yellow decoration-4 underline-offset-4">Library</span> Intelligence
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Browse books, check live copy availability, and reserve holds online in seconds.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/sign-in">
              <Button size="lg" className="w-full sm:w-auto rounded-full bg-brand-blue text-white hover:bg-brand-blue/90 font-semibold px-7 gap-2">
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/catalog">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full font-semibold px-7 gap-2 border-hairline">
                <BookOpen className="h-4 w-4 text-brand-yellow" />
                <span>Explore Catalog</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Library Features & Benefits */}
      <section className="py-16 bg-card border-b border-hairline">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-foreground">
              Modern Library Services
            </h2>
            <p className="text-sm text-muted-foreground">
              Designed for speed, accuracy, and copy traceability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl border border-hairline bg-background space-y-3 shadow-soft-floating transition-spring hover:scale-[1.01]">
              <div className="h-10 w-10 rounded-2xl bg-brand-yellow/20 text-yellow-600 dark:text-brand-yellow flex items-center justify-center font-bold">
                <BookMarked className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground">
                Live Inventory
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Check real-time copy availability and estimated return dates instantly.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-hairline bg-background space-y-3 shadow-soft-floating transition-spring hover:scale-[1.01]">
              <div className="h-10 w-10 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground">
                Rapid Desk Checkouts
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Physical checkouts and returns completed seamlessly with full audit history.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-hairline bg-background space-y-3 shadow-soft-floating transition-spring hover:scale-[1.01]">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground">
                Reader Reviews
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Explore authentic reader ratings and feedback to discover great recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Library Hours & Information Callout */}
      <section className="py-16 bg-canvas-warm dark:bg-canvas-dark border-b border-hairline">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-foreground text-xs font-mono border border-hairline">
              <Clock className="h-3.5 w-3.5 text-brand-blue" />
              <span>Hours &amp; Access</span>
            </div>

            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground tracking-tight">
              Circulation Desk &amp; Reading Rooms
            </h2>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Hours:</strong> Mon – Fri, 8:00 AM – 5:00 PM
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Loan Limits:</strong> Up to 3 books per student for 14 days.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Online Holds:</strong> Kept at central desk for 48 hours.
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-hairline bg-card p-6 sm:p-8 space-y-5 shadow-soft-floating">
            <div className="flex items-center gap-3 border-b border-hairline pb-4">
              <div className="h-9 w-9 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-foreground">Main Campus Library</h3>
                <p className="text-xs text-muted-foreground">Building B, 2nd Floor</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground font-mono">
              <div className="flex justify-between py-1 border-b border-hairline">
                <span>Mon – Fri</span>
                <span className="font-semibold text-foreground">8:00 AM – 5:00 PM</span>
              </div>
              <div className="flex justify-between py-1 border-b border-hairline">
                <span>Saturday</span>
                <span className="font-semibold text-foreground">9:00 AM – 1:00 PM</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Sunday</span>
                <span className="font-semibold text-rose-500">Closed</span>
              </div>
            </div>

            <Link href="/sign-up" className="block pt-1">
              <Button className="w-full rounded-full bg-brand-blue text-white hover:bg-brand-blue/90 font-medium text-xs">
                Create Account &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-hairline bg-card py-6 text-center text-xs text-muted-foreground mt-auto">
        <div className="container max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-brand-yellow" />
            <span className="font-bold text-foreground">ShelfSync Library</span>
          </div>
          <span>&copy; {new Date().getFullYear()} ShelfSync. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
