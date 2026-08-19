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
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useUser } from "@clerk/nextjs";

export function LandingHero() {
  const [activeState, setActiveState] = useState<1 | 2>(1);
  const { isSignedIn, isLoaded, user } = useUser();
  const userRole = user?.publicMetadata?.role as string | undefined;
  const isAssistantOrAdmin = userRole === "ASSISTANT" || userRole === "ADMIN";

  return (
    <TooltipProvider>
      <section id="product" className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center border-b border-hairline bg-canvas-warm dark:bg-canvas-dark py-8 md:py-12 bg-grid-pattern overflow-hidden">
        {/* Soft Radial Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[320px] bg-gradient-to-tr from-violet-500/10 via-indigo-500/10 to-amber-500/10 blur-[90px] pointer-events-none -z-0" />

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-5 sm:space-y-6 my-auto">
          {/* Eyebrow / State Selector Badge */}
          <div data-aos="fade-down" className="inline-flex items-center gap-2 p-1 pr-3 rounded-full bg-card border border-hairline shadow-soft-floating text-xs font-medium">
            <button
              onClick={() => setActiveState(1)}
              className={`px-3 py-1 rounded-full transition-all duration-300 ease-out hover:scale-105 text-xs font-bold ${activeState === 1
                  ? "bg-brand-yellow text-black shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Library System
            </button>
            <button
              onClick={() => setActiveState(2)}
              className={`px-3 py-1 rounded-full transition-all duration-300 ease-out hover:scale-105 text-xs font-bold ${activeState === 2
                  ? "bg-brand-blue text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Smart Circulation
            </button>
          </div>

          {/* Dynamic State Headlines */}
          <div data-aos="fade-up" data-aos-delay="100" className="space-y-3 max-w-4xl mx-auto">
            {activeState === 1 ? (
              <>
                <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl text-foreground tracking-tight leading-[1.1]">
                  All-in-one Library Platform
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  ShelfSync is a modern, all-in-one library platform designed to perfectly fit your campus needs.
                </p>
              </>
            ) : (
              <>
                <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl text-foreground tracking-tight leading-[1.1]">
                  Smart Circulation &amp; Holds
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Streamline circulation desk transactions in one centralized console, enhancing book availability and campus transparency.
                </p>
              </>
            )}
          </div>

          {/* Call to Action Buttons */}
          <div data-aos="fade-up" data-aos-delay="200" className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {!isLoaded ? (
              <div className="h-10 w-36 rounded-full bg-muted animate-pulse" />
            ) : isSignedIn ? (
              /* Signed-In Role-Based CTA Buttons */
              isAssistantOrAdmin ? (
                <>
                  <Button size="lg" className="rounded-full font-bold px-6 shadow-md" asChild>
                    <Link href="/admin">
                      Go to Admin Workspace &rarr;
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full font-bold px-6 border-hairline" asChild>
                    <Link href="/catalog">
                      Catalog
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" className="rounded-full font-bold px-6 shadow-md" asChild>
                    <Link href="/dashboard">
                      Explore Catalog &amp; Holds &rarr;
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full font-bold px-6 border-hairline" asChild>
                    <Link href="/borrowed">
                      My Active Loans
                    </Link>
                  </Button>
                </>
              )
            ) : (
              /* Public Visitor CTA Buttons */
              <>
                <Button size="lg" className="rounded-full font-bold px-6 shadow-md" asChild>
                  <Link href="/sign-in">
                    Sign in &amp; Access Library &rarr;
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full font-bold px-6 border-hairline" asChild>
                  <Link href="/sign-up">
                    Create Student Account
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Floating Feature Badges / Connected Nodes with Shadcn Tooltips */}
          <div className="pt-4 md:pt-6 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 max-w-4xl mx-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <div data-aos="zoom-in-up" data-aos-delay="300" className="flex items-center gap-2.5 p-3 rounded-2xl border border-hairline bg-card/80 backdrop-blur-md shadow-soft-floating hover-scale-node cursor-pointer">
                  <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-foreground">Catalog Search</div>
                    <div className="text-[10px] text-muted-foreground">Instant ISBN &amp; Title Lookup</div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Search over 50,000+ catalog titles instantly</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div data-aos="zoom-in-up" data-aos-delay="400" className="flex items-center gap-2.5 p-3 rounded-2xl border border-hairline bg-card/80 backdrop-blur-md shadow-soft-floating hover-scale-node cursor-pointer">
                  <div className="h-8 w-8 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-foreground">Rapid Circulation</div>
                    <div className="text-[10px] text-muted-foreground">10-Second Desk Checkouts</div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Process desk borrowing in under 10 seconds</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div data-aos="zoom-in-up" data-aos-delay="500" className="flex items-center gap-2.5 p-3 rounded-2xl border border-hairline bg-card/80 backdrop-blur-md shadow-soft-floating hover-scale-node cursor-pointer">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-foreground">Hold Queue</div>
                    <div className="text-[10px] text-muted-foreground">Automated Reservations</div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Automated SMS &amp; email pickup notifications</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div data-aos="zoom-in-up" data-aos-delay="600" className="flex items-center gap-2.5 p-3 rounded-2xl border border-hairline bg-card/80 backdrop-blur-md shadow-soft-floating hover-scale-node cursor-pointer">
                  <div className="h-8 w-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                    <Fingerprint className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-foreground">Campus RBAC</div>
                    <div className="text-[10px] text-muted-foreground">Student &amp; Staff Roles</div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Fine-grained permissions for staff and patrons</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}
