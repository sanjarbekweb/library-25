"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useLanguage } from "@/components/providers/language-provider";
import { ClickSpark } from "@/components/ui/click-spark";
import { UserPresenceAvatar } from "@/components/animate-ui/components/community/user-presence-avatar";
import heroImg from "@/public/hero.png";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export function LandingHero() {
  const { language } = useLanguage();
  const { isSignedIn, isLoaded, user } = useUser();
  const userRole = user?.publicMetadata?.role as string | undefined;
  const isAssistantOrAdmin = userRole === "ASSISTANT" || userRole === "ADMIN";

  const sectionRef = useRef<HTMLElement>(null);
  const sculptureRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Localized headline lines
  const headlineLine1 =
    language === "uz"
      ? "Kutubxona boshqaruvi"
      : language === "ru"
      ? "Управление библиотекой"
      : "Library workflows with";

  const headlineLine2 =
    language === "uz"
      ? "tezlik va qulaylik."
      : language === "ru"
      ? "точностью и скоростью."
      : "speed and simplicity.";

  const subtitle =
    language === "uz"
      ? "Kitoblarni tezkor qidirish, band qilish, 10 soniyalik ijara va kitoblar fondini boshqarishning zamonaviy platformasi."
      : language === "ru"
      ? "Удобный поиск книг, онлайн-бронирование, выдача на стойке за 10 секунд и учет библиотечного фонда."
      : "Streamline book discovery, hold reservations, desk checkouts, and collection tracking with speed and simplicity.";

  const badgeText =
    language === "uz"
      ? "Yangi avlod kutubxona tizimi"
      : language === "ru"
      ? "Платформа нового поколения"
      : "Campus Library Platform";

  const primaryBtnText =
    language === "uz"
      ? "Katalogni ko'rish"
      : language === "ru"
      ? "Открыть каталог"
      : "Visit Catalog";

  const exploreText =
    language === "uz"
      ? "batafsil."
      : language === "ru"
      ? "подробнее."
      : "explore.";

  const statsCount = "50K+";
  const statsLabel =
    language === "uz"
      ? "faol kitobxonlar"
      : language === "ru"
      ? "читателей кампуса"
      : "campus readers";

  // GSAP Orchestration with useGSAP and matchMedia
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
            gsap.set(
              [
                ".hero-badge",
                ".hero-title-1",
                ".hero-title-2",
                ".hero-subtitle",
                ".hero-actions",
                ".hero-stats",
                ".hero-visual",
              ],
              { autoAlpha: 1, y: 0, scale: 1 }
            );
            return;
          }

          // Initial coordinated hero timeline entrance
          const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
          });

          tl.from(".hero-badge", {
            autoAlpha: 0,
            y: -20,
            duration: 0.6,
          })
            .from(
              ".hero-title-1",
              {
                autoAlpha: 0,
                y: 35,
                duration: 0.7,
              },
              "-=0.35"
            )
            .from(
              ".hero-title-2",
              {
                autoAlpha: 0,
                y: 35,
                duration: 0.7,
              },
              "-=0.45"
            )
            .from(
              ".hero-subtitle",
              {
                autoAlpha: 0,
                y: 25,
                duration: 0.6,
              },
              "-=0.4"
            )
            .from(
              ".hero-actions",
              {
                autoAlpha: 0,
                y: 20,
                duration: 0.55,
              },
              "-=0.35"
            )
            .from(
              ".hero-stats",
              {
                autoAlpha: 0,
                y: 20,
                duration: 0.55,
              },
              "-=0.35"
            )
            .from(
              ".hero-visual",
              {
                autoAlpha: 0,
                scale: 0.88,
                y: 40,
                duration: 1.1,
                ease: "back.out(1.2)",
              },
              "-=1.1"
            );

          // Idle floating oscillation on 3D sculpture
          gsap.to(".hero-sculpture-img", {
            y: -14,
            duration: 3.6,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });

          // Soft ambient breathing on spotlight glow
          if (glowRef.current) {
            gsap.to(glowRef.current, {
              scale: 1.12,
              opacity: 0.7,
              duration: 4,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            });
          }

          // Interactive 3D Perspective Tilt with gsap.quickTo on Desktop
          if (isDesktop && sculptureRef.current && sectionRef.current) {
            const rotX = gsap.quickTo(sculptureRef.current, "rotationX", {
              duration: 0.5,
              ease: "power2.out",
            });
            const rotY = gsap.quickTo(sculptureRef.current, "rotationY", {
              duration: 0.5,
              ease: "power2.out",
            });
            const moveX = gsap.quickTo(sculptureRef.current, "x", {
              duration: 0.6,
              ease: "power2.out",
            });
            const moveY = gsap.quickTo(sculptureRef.current, "y", {
              duration: 0.6,
              ease: "power2.out",
            });

            const handleMouseMove = (e: MouseEvent) => {
              const rect = sectionRef.current?.getBoundingClientRect();
              if (!rect) return;

              const xNorm = (e.clientX - rect.left) / rect.width - 0.5;
              const yNorm = (e.clientY - rect.top) / rect.height - 0.5;

              rotY(xNorm * 18);
              rotX(-yNorm * 18);
              moveX(xNorm * 16);
              moveY(yNorm * 16);
            };

            const handleMouseLeave = () => {
              rotX(0);
              rotY(0);
              moveX(0);
              moveY(0);
            };

            const sectionEl = sectionRef.current;
            sectionEl.addEventListener("mousemove", handleMouseMove);
            sectionEl.addEventListener("mouseleave", handleMouseLeave);

            return () => {
              sectionEl.removeEventListener("mousemove", handleMouseMove);
              sectionEl.removeEventListener("mouseleave", handleMouseLeave);
            };
          }
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="product"
      ref={sectionRef}
      className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center bg-slate-100/70 dark:bg-[#07090D] border-b border-border/80 dark:border-white/10 py-12 lg:py-20 overflow-hidden text-foreground dark:text-white transition-colors duration-300"
    >
      <ClickSpark
        sparkColor="#3B82F6"
        sparkSize={22}
        sparkRadius={38}
        sparkCount={10}
        duration={500}
        extraScale={1.2}
        className="flex flex-col justify-center py-6 sm:py-12"
      >
        {/* Background Radial Ambiance */}
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-brand-blue/10 dark:bg-brand-blue/15 rounded-full blur-[120px] pointer-events-none -z-0" />
        <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-0" />

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Hero Content & CTAs */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
              {/* Top Pill Capsule Badge */}
              <div className="hero-badge will-change-transform">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/90 dark:border-white/15 bg-card/80 dark:bg-white/5 backdrop-blur-md text-xs text-muted-foreground dark:text-white/80 shadow-2xs">
                  <span className="px-1.5 py-0.5 rounded-full bg-brand-blue/10 dark:bg-white/20 text-[10px] font-bold text-brand-blue dark:text-white uppercase tracking-wider">
                    NEW
                  </span>
                  <span>{badgeText}</span>
                </div>
              </div>

              {/* Main Headline */}
              <div className="space-y-1">
                <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.12]">
                  <span className="hero-title-1 text-muted-foreground dark:text-white/60 block font-normal will-change-transform">
                    {headlineLine1}
                  </span>
                  <span className="hero-title-2 text-foreground dark:text-white block font-extrabold will-change-transform">
                    {headlineLine2}
                  </span>
                </h1>
              </div>

              {/* Subtitle Description */}
              <p className="hero-subtitle text-sm sm:text-base text-muted-foreground dark:text-zinc-400 max-w-xl leading-relaxed font-normal will-change-transform">
                {subtitle}
              </p>

              {/* Action Buttons */}
              <div className="hero-actions flex items-center gap-5 pt-2 will-change-transform">
                {!isLoaded ? (
                  <div className="h-11 w-36 rounded-full bg-muted/60 animate-pulse" />
                ) : isSignedIn ? (
                  <Button
                    size="lg"
                    asChild
                    className="rounded-full bg-brand-blue dark:bg-white text-white dark:text-zinc-950 font-bold px-7 py-3 shadow-md hover:bg-brand-blue/90 dark:hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Link href={isAssistantOrAdmin ? "/admin" : "/catalog"}>
                      {isAssistantOrAdmin ? "Admin Workspace" : primaryBtnText}
                    </Link>
                  </Button>
                ) : (
                  <SignInButton mode="modal" fallbackRedirectUrl="/catalog" forceRedirectUrl="/catalog">
                    <Button
                      size="lg"
                      className="rounded-full bg-brand-blue dark:bg-white text-white dark:text-zinc-950 font-bold px-7 py-3 shadow-md hover:bg-brand-blue/90 dark:hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      {primaryBtnText}
                    </Button>
                  </SignInButton>
                )}

                <Link
                  href="/catalog"
                  className="text-sm font-semibold text-muted-foreground dark:text-zinc-400 hover:text-foreground dark:hover:text-white transition-colors cursor-pointer"
                >
                  {exploreText}
                </Link>
              </div>

              {/* Social Proof & Metrics (50K / Live Presence Avatars) */}
              <div className="hero-stats pt-6 sm:pt-8 flex flex-wrap items-center gap-5 sm:gap-6 max-w-xl border-t border-border/80 dark:border-white/10 will-change-transform">
                <div className="space-y-0.5">
                  <div className="text-3xl sm:text-4xl font-extrabold text-foreground dark:text-white tracking-tight font-display">
                    {statsCount}
                  </div>
                  <div className="text-xs text-muted-foreground dark:text-zinc-400 font-medium">
                    {statsLabel}
                  </div>
                </div>

                <div className="py-1">
                  <UserPresenceAvatar size="default" />
                </div>
              </div>
            </div>

            {/* Right Column: 3D Ribbed Book Bloom Sculpture with Interactive Tilt */}
            <div className="hero-visual lg:col-span-5 relative flex items-center justify-center lg:justify-end [perspective:1200px] will-change-transform">
              {/* Ambient Multi-Layered Radial Spotlight Glow */}
              <div
                ref={glowRef}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[420px] h-80 sm:h-[420px] bg-gradient-to-tr from-brand-blue/20 dark:from-brand-blue/30 via-purple-600/10 dark:via-purple-600/20 to-indigo-400/15 dark:to-indigo-400/20 rounded-full blur-[110px] pointer-events-none will-change-transform"
              />

              <div
                ref={sculptureRef}
                className="relative z-10 w-full max-w-[380px] sm:max-w-[460px] lg:max-w-[520px] aspect-square flex items-center justify-center [transform-style:preserve-3d] will-change-transform"
              >
                <Image
                  src={heroImg}
                  alt="libra25 3D Origami Book Bloom Sculpture"
                  priority
                  unoptimized
                  className="hero-sculpture-img w-full h-full object-contain -scale-x-100 drop-shadow-[0_20px_50px_rgba(120,80,255,0.25)] dark:drop-shadow-[0_25px_60px_rgba(120,80,255,0.35)] drop-shadow-[0_10px_25px_rgba(29,97,255,0.15)] dark:drop-shadow-[0_10px_25px_rgba(29,97,255,0.25)] select-none pointer-events-none will-change-transform"
                />
              </div>
            </div>
          </div>
        </div>
      </ClickSpark>
    </section>
  );
}
