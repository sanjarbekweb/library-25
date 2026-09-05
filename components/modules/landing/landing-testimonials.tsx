"use client";

import { useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { Star, Quote, Sparkles, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import avatar1 from "@/public/avatars/avatar-1.webp";
import avatar2 from "@/public/avatars/avatar-2.webp";
import avatar3 from "@/public/avatars/avatar-3.webp";
import avatar4 from "@/public/avatars/avatar-4.webp";
import avatar5 from "@/public/avatars/avatar-5.webp";
import avatar6 from "@/public/avatars/avatar-6.webp";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
  campus: string;
  avatar: string;
  image: StaticImageData;
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
    image: avatar4,
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
    image: avatar1,
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
    image: avatar6,
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
    image: avatar3,
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
    image: avatar5,
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
    image: avatar2,
    bg: "bg-cyan-600 text-white",
    rating: "5.0",
  },
];

export function LandingTestimonials() {
  const containerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const marqueeTweenRef = useRef<gsap.core.Tween | null>(null);
  const isHoveredRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(true);

  // Duplicated list creates a seamless infinite looping ribbon
  const loopedItems = [...TESTIMONIALS, ...TESTIMONIALS];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { reduceMotion } = context.conditions as { reduceMotion: boolean };

          if (reduceMotion) {
            gsap.set([".testimonials-header", trackRef.current], {
              opacity: 1,
              visibility: "visible",
              y: 0,
              xPercent: 0,
            });
            return;
          }

          // Header reveal animation
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

          // Continuous Infinite Marquee with GSAP
          if (trackRef.current) {
            const tween = gsap.to(trackRef.current, {
              xPercent: -50,
              ease: "none",
              duration: 42,
              repeat: -1,
            });

            marqueeTweenRef.current = tween;

            // ScrollTrigger: Subtle dynamic velocity boost during active scroll
            ScrollTrigger.create({
              trigger: containerRef.current,
              start: "top bottom",
              end: "bottom top",
              onUpdate: (self) => {
                if (isHoveredRef.current) return;
                const scrollVel = Math.abs(self.getVelocity() / 350);
                if (scrollVel > 0.15) {
                  gsap.to(tween, {
                    timeScale: 1 + Math.min(scrollVel, 2.8),
                    duration: 0.25,
                    overwrite: "auto",
                    onComplete: () => {
                      if (!isHoveredRef.current) {
                        gsap.to(tween, { timeScale: 1, duration: 0.8, ease: "power2.out" });
                      }
                    },
                  });
                }
              },
            });
          }
        }
      );
    },
    { scope: containerRef }
  );

  // Smooth hover interactions: gently decelerate to a stop on hover so user can read comfortably
  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    if (marqueeTweenRef.current) {
      gsap.to(marqueeTweenRef.current, { timeScale: 0, duration: 0.45, ease: "power1.out" });
    }
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    if (marqueeTweenRef.current && isPlaying) {
      gsap.to(marqueeTweenRef.current, { timeScale: 1, duration: 0.6, ease: "power1.inOut" });
    }
  };

  const handleTogglePlay = () => {
    if (!marqueeTweenRef.current) return;
    if (isPlaying) {
      gsap.to(marqueeTweenRef.current, { timeScale: 0, duration: 0.35, ease: "power1.out" });
      setIsPlaying(false);
    } else {
      gsap.to(marqueeTweenRef.current, { timeScale: 1, duration: 0.5, ease: "power1.inOut" });
      setIsPlaying(true);
    }
  };

  // Previous & Next navigation controls
  const handlePrev = () => {
    if (!marqueeTweenRef.current) return;
    const curProgress = marqueeTweenRef.current.progress();
    const step = 1 / TESTIMONIALS.length;
    const target = (curProgress - step + 1) % 1;
    gsap.to(marqueeTweenRef.current, {
      progress: target,
      duration: 0.6,
      ease: "power2.out",
    });
  };

  const handleNext = () => {
    if (!marqueeTweenRef.current) return;
    const curProgress = marqueeTweenRef.current.progress();
    const step = 1 / TESTIMONIALS.length;
    const target = (curProgress + step) % 1;
    gsap.to(marqueeTweenRef.current, {
      progress: target,
      duration: 0.6,
      ease: "power2.out",
    });
  };

  return (
    <section
      id="testimonials"
      ref={containerRef}
      className="py-20 sm:py-24 bg-slate-100/60 dark:bg-zinc-900/40 border-b border-border/80 overflow-hidden relative transition-colors duration-300"
    >
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[450px] h-[450px] bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none -z-0" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 space-y-10 relative z-10">
        {/* Section Header */}
        <div className="testimonials-header text-center space-y-3.5 max-w-2xl mx-auto will-change-transform">
          <Badge variant="outline" className="px-3 py-1 font-mono text-xs border-border/80 bg-card shadow-2xs">
            <Sparkles className="h-3 w-3 mr-1 text-brand-blue" />
            Library Stories
          </Badge>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-foreground tracking-tight">
            Trusted by Librarians &amp; Students
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Discover how libra25 simplifies catalog discovery, hold fulfillment, and circulation desk transactions.
          </p>

          {/* Interactive Navigation & Playback Controls */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handlePrev}
              aria-label="Previous review"
              className="rounded-full w-9 h-9 border-border/80 bg-card hover:bg-accent text-foreground shadow-2xs cursor-pointer transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handleTogglePlay}
              aria-label={isPlaying ? "Pause reviews animation" : "Resume reviews animation"}
              className="rounded-full w-9 h-9 border-border/80 bg-card hover:bg-accent text-foreground shadow-2xs cursor-pointer transition-colors"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handleNext}
              aria-label="Next review"
              className="rounded-full w-9 h-9 border-border/80 bg-card hover:bg-accent text-foreground shadow-2xs cursor-pointer transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* GSAP Seamless Infinite Marquee Track with Fade Masks */}
      <div
        className="relative w-full overflow-hidden mt-8 sm:mt-12"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Left and Right Edge Gradient Fade Overlays */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-slate-100/90 dark:from-[#07090D] to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-slate-100/90 dark:from-[#07090D] to-transparent z-20" />

        {/* Continuous Animated Track */}
        <div
          ref={trackRef}
          className="flex items-stretch gap-6 w-max will-change-transform py-4 px-4 select-none"
        >
          {loopedItems.map((item, idx) => (
            <Card
              key={`${item.name}-${idx}`}
              className="w-[300px] sm:w-[380px] lg:w-[420px] p-6 sm:p-7 rounded-3xl border border-border/90 bg-card shadow-xs flex flex-col justify-between space-y-6 shrink-0 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-brand-blue/40 will-change-transform cursor-pointer"
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
                <div className="h-11 w-11 shrink-0 rounded-2xl overflow-hidden border border-border/60 shadow-2xs bg-muted">
                  <Image src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
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
    </section>
  );
}
