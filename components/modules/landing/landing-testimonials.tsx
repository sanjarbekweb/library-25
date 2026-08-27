"use client";

import { useRef } from "react";
import { Star, Quote, Sparkles } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
  campus: string;
  avatar: string;
  bg: string;
  rating: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    quote:
      "libra25 has transformed our campus operations. Desk checkout times dropped to under 10 seconds, and students love reserving physical copies directly from their phones.",
    name: "Dr. Bakhtiyor Arisov",
    role: "Head University Librarian",
    campus: "Central Campus Library",
    avatar: "BA",
    bg: "bg-brand-blue text-white",
    rating: "5.0",
  },
  {
    quote:
      "Finding course textbooks and tracking hold availability is effortless. The catalog search is lightning fast, accurate, and displays exact physical shelf availability.",
    name: "Malika Akhmedova",
    role: "Senior Student & Researcher",
    campus: "Faculty of Computer Science",
    avatar: "MA",
    bg: "bg-indigo-600 text-white",
    rating: "5.0",
  },
  {
    quote:
      "The barcode scanning and automatic overdue telemetry eliminated manual logbooks. Managing thousands of book copies across departments has never been this smooth.",
    name: "Jasur Nematov",
    role: "Circulation Desk Assistant",
    campus: "Engineering Library Desk",
    avatar: "JN",
    bg: "bg-emerald-600 text-white",
    rating: "5.0",
  },
  {
    quote:
      "Being able to review books, check real-time return dates, and renew holds in one click makes studying for finals much less stressful.",
    name: "Elena Rostova",
    role: "Graduate Student",
    campus: "Department of Mathematics",
    avatar: "ER",
    bg: "bg-amber-600 text-white",
    rating: "5.0",
  },
  {
    quote:
      "As department chair, the collection intelligence reports show us which textbooks need more copies before the semester even begins.",
    name: "Prof. Alisher Qodirov",
    role: "Dean of Academic Affairs",
    campus: "Campus Faculty Board",
    avatar: "AQ",
    bg: "bg-violet-600 text-white",
    rating: "5.0",
  },
  {
    quote:
      "Zero-latency search with typo tolerance and instant pickup notifications makes libra25 the gold standard for campus library platforms.",
    name: "Sardor Karimov",
    role: "IT & Systems Administrator",
    campus: "Campus Digital Services",
    avatar: "SK",
    bg: "bg-cyan-600 text-white",
    rating: "5.0",
  },
];

export function LandingTestimonials() {
  const containerRef = useRef<HTMLElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          isMobile: "(max-width: 1023px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions as {
            isDesktop: boolean;
            isMobile: boolean;
            reduceMotion: boolean;
          };

          if (reduceMotion) {
            gsap.set([".testimonials-header", slideRef.current], {
              autoAlpha: 1,
              y: 0,
              x: 0,
            });
            return;
          }

          // Header reveal
          gsap.fromTo(
            ".testimonials-header",
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
              clearProps: "transform,opacity,visibility",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          );

          // Horizontal scroll scrub for desktop & tablet
          if (slideRef.current && containerRef.current) {
            const shiftAmount = isDesktop ? "-40%" : "-60%";

            gsap.to(slideRef.current, {
              scrollTrigger: {
                trigger: containerRef.current,
                start: "clamp(top 85%)",
                end: "clamp(bottom 15%)",
                scrub: 1.2,
              },
              x: shiftAmount,
              ease: "none",
            });
          }
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      id="testimonials"
      ref={containerRef}
      className="py-24 bg-slate-100/60 dark:bg-zinc-900/40 border-b border-border/80 overflow-hidden relative"
    >
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[450px] h-[450px] bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none -z-0" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 space-y-12 relative z-10">
        {/* Section Header */}
        <div className="testimonials-header text-center space-y-3 max-w-2xl mx-auto will-change-transform">
          <Badge variant="outline" className="px-3 py-1 font-mono text-xs border-border/80 bg-card">
            <Sparkles className="h-3 w-3 mr-1 text-brand-blue" />
            Library Stories
          </Badge>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-foreground tracking-tight">
            Trusted by Librarians &amp; Students
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Discover how libra25 simplifies catalog discovery, hold fulfillment, and circulation desk transactions.
          </p>
        </div>

        {/* GSAP Scrubbed Horizontal Slides Container */}
        <div className="pt-4 overflow-visible">
          <div
            ref={slideRef}
            className="scrub-slide flex items-stretch gap-6 w-max will-change-transform"
          >
            {TESTIMONIALS.map((item, idx) => (
              <Card
                key={idx}
                className="w-[320px] sm:w-[380px] lg:w-[420px] p-7 rounded-3xl border border-border/90 bg-card shadow-xs flex flex-col justify-between space-y-6 shrink-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-md will-change-transform"
              >
                <CardHeader className="p-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                      <span className="text-xs font-mono font-bold text-foreground ml-1.5">
                        {item.rating}
                      </span>
                    </div>
                    <Quote className="h-6 w-6 text-muted-foreground/30" />
                  </div>

                  <p className="text-sm sm:text-base text-foreground leading-relaxed italic line-clamp-4">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </CardHeader>

                <CardContent className="p-0 flex items-center gap-3 border-t border-border/70 pt-4">
                  <Avatar className="h-11 w-11 shrink-0 border border-border/60 shadow-2xs">
                    <AvatarFallback className={`${item.bg} font-bold text-sm`}>
                      {item.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-sm text-foreground truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{item.role}</p>
                    <p className="text-[11px] text-brand-blue font-medium truncate">{item.campus}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
