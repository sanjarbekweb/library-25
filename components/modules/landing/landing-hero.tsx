"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Lightbulb,
  ShieldAlert,
  MessageSquare,
  Fingerprint,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { useUser } from "@clerk/nextjs";

export function LandingHero() {
  const [activeState, setActiveState] = useState<1 | 2>(1);
  const { isSignedIn, isLoaded, user } = useUser();
  const userRole = user?.publicMetadata?.role as string | undefined;
  const isAssistantOrAdmin = userRole === "ASSISTANT" || userRole === "ADMIN";

  return (
    <section id="product" className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center border-b border-hairline bg-canvas-warm dark:bg-canvas-dark py-8 md:py-12 bg-grid-pattern overflow-hidden">
      {/* Soft Radial Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[320px] bg-gradient-to-tr from-violet-500/10 via-indigo-500/10 to-amber-500/10 blur-[90px] pointer-events-none -z-0" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-5 sm:space-y-6 my-auto">
        {/* Eyebrow / State Selector Badge */}
        <div className="inline-flex items-center gap-2 p-1 pr-3 rounded-full bg-card border border-hairline shadow-soft-floating text-xs font-medium">
          <button
            onClick={() => setActiveState(1)}
            className={`px-3 py-1 rounded-full transition-all text-xs font-bold ${
              activeState === 1
                ? "bg-brand-yellow text-black shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Library System
          </button>
          <button
            onClick={() => setActiveState(2)}
            className={`px-3 py-1 rounded-full transition-all text-xs font-bold ${
              activeState === 2
                ? "bg-brand-blue text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Smart Circulation
          </button>
        </div>

        {/* Dynamic State Headlines */}
        <div className="space-y-3 max-w-4xl mx-auto">
          {activeState === 1 ? (
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-tight text-foreground leading-tight animate-in fade-in duration-300">
              All-in-one <span className="text-brand-blue underline decoration-brand-yellow decoration-4 underline-offset-4">Campus Library</span> platform
            </h1>
          ) : (
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-tight text-foreground leading-tight animate-in fade-in duration-300">
              Centralized Catalog &amp; <span className="text-violet-600 dark:text-violet-400 underline decoration-violet-500 decoration-4 underline-offset-4">Circulation Desk</span>
            </h1>
          )}

          {activeState === 1 ? (
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              ShelfSync is a modern, all-in-one library management platform designed to streamline book discovery, reservations, desk checkouts, and collection tracking.
            </p>
          ) : (
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Streamline physical book loans, real-time hold reservations, and automated overdue alerts in one unified campus workspace.
            </p>
          )}
        </div>

        {/* Hero CTAs */}
        <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isLoaded && isSignedIn ? (
            <>
              <Link href={isAssistantOrAdmin ? "/assistant" : "/catalog"}>
                <Button size="lg" variant="gradient" className="w-full sm:w-auto rounded-full font-semibold px-7 gap-2">
                  <span>{isAssistantOrAdmin ? "Circulation Desk" : "Explore Catalog"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/reservations">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full font-semibold px-7 gap-2 border-hairline">
                  <BookOpen className="h-4 w-4 text-brand-yellow" />
                  <span>My Holds &amp; Loans</span>
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/catalog">
                <Button size="lg" variant="gradient" className="w-full sm:w-auto rounded-full font-semibold px-7 gap-2">
                  <span>Explore Book Catalog</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full font-semibold px-7 gap-2 border-hairline">
                  <BookOpen className="h-4 w-4 text-brand-yellow" />
                  <span>Library Features</span>
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Floating Feature Badges / Connected Nodes */}
        <div className="pt-4 md:pt-6 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 max-w-4xl mx-auto">
          <div className="flex items-center gap-2.5 p-3 rounded-2xl border border-hairline bg-card/80 backdrop-blur-md shadow-soft-floating transition-spring hover:scale-[1.02]">
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-foreground">Catalog Search</div>
              <div className="text-[10px] text-muted-foreground">Instant ISBN &amp; Title Lookup</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-2xl border border-hairline bg-card/80 backdrop-blur-md shadow-soft-floating transition-spring hover:scale-[1.02]">
            <div className="h-8 w-8 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-foreground">Rapid Circulation</div>
              <div className="text-[10px] text-muted-foreground">10-Second Desk Checkouts</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-2xl border border-hairline bg-card/80 backdrop-blur-md shadow-soft-floating transition-spring hover:scale-[1.02]">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-foreground">Hold Queue</div>
              <div className="text-[10px] text-muted-foreground">Automated Reservations</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-2xl border border-hairline bg-card/80 backdrop-blur-md shadow-soft-floating transition-spring hover:scale-[1.02]">
            <div className="h-8 w-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <Fingerprint className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-foreground">Campus RBAC</div>
              <div className="text-[10px] text-muted-foreground">Student &amp; Staff Roles</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
