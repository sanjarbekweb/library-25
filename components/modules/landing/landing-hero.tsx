"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useLanguage } from "@/components/providers/language-provider";
import heroImg from "@/public/hero.png";

export function LandingHero() {
  const { language } = useLanguage();
  const { isSignedIn, isLoaded, user } = useUser();
  const userRole = user?.publicMetadata?.role as string | undefined;
  const isAssistantOrAdmin = userRole === "ASSISTANT" || userRole === "ADMIN";

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

  return (
    <section
      id="product"
      className="relative min-h-[calc(100vh-4rem)] flex items-center bg-slate-100/70 dark:bg-[#07090D] border-b border-border/80 dark:border-white/10 py-12 lg:py-20 overflow-hidden text-foreground dark:text-white transition-colors duration-300"
    >
      {/* Background Radial Ambiance */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-brand-blue/10 dark:bg-brand-blue/15 rounded-full blur-[120px] pointer-events-none -z-0" />
      <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-0" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Content & CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            {/* Top Pill Capsule Badge */}
            <div data-aos="fade-up" data-aos-delay="100">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/90 dark:border-white/15 bg-card/80 dark:bg-white/5 backdrop-blur-md text-xs text-muted-foreground dark:text-white/80 shadow-2xs">
                <span className="px-1.5 py-0.5 rounded-full bg-brand-blue/10 dark:bg-white/20 text-[10px] font-bold text-brand-blue dark:text-white uppercase tracking-wider">
                  NEW
                </span>
                <span>{badgeText}</span>
              </div>
            </div>

            {/* Main Headline */}
            <div data-aos="fade-up" data-aos-delay="150" className="space-y-1">
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.12]">
                <span className="text-muted-foreground dark:text-white/60 block font-normal">{headlineLine1}</span>
                <span className="text-foreground dark:text-white block font-extrabold">{headlineLine2}</span>
              </h1>
            </div>

            {/* Subtitle Description */}
            <p
              data-aos="fade-up"
              data-aos-delay="200"
              className="text-sm sm:text-base text-muted-foreground dark:text-zinc-400 max-w-xl leading-relaxed font-normal"
            >
              {subtitle}
            </p>

            {/* Action Buttons */}
            <div
              data-aos="fade-up"
              data-aos-delay="250"
              className="flex items-center gap-5 pt-2"
            >
              {!isLoaded ? (
                <div className="h-11 w-36 rounded-full bg-muted/60 animate-pulse" />
              ) : isSignedIn ? (
                <Button
                  size="lg"
                  asChild
                  className="rounded-full bg-brand-blue dark:bg-white text-white dark:text-zinc-950 font-bold px-7 py-3 shadow-md hover:bg-brand-blue/90 dark:hover:bg-zinc-100 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Link href={isAssistantOrAdmin ? "/admin" : "/catalog"}>
                    {isAssistantOrAdmin ? "Admin Workspace" : primaryBtnText}
                  </Link>
                </Button>
              ) : (
                <SignInButton mode="modal" fallbackRedirectUrl="/catalog" forceRedirectUrl="/catalog">
                  <Button
                    size="lg"
                    className="rounded-full bg-brand-blue dark:bg-white text-white dark:text-zinc-950 font-bold px-7 py-3 shadow-md hover:bg-brand-blue/90 dark:hover:bg-zinc-100 hover:scale-[1.02] transition-all cursor-pointer"
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

            {/* Social Proof & Metrics (500K / Avatars) */}
            <div
              data-aos="fade-up"
              data-aos-delay="300"
              className="pt-6 sm:pt-8 flex items-center gap-6 max-w-md border-t border-border/80 dark:border-white/10"
            >
              <div className="space-y-0.5">
                <div className="text-3xl sm:text-4xl font-extrabold text-foreground dark:text-white tracking-tight font-display">
                  {statsCount}
                </div>
                <div className="text-xs text-muted-foreground dark:text-zinc-400 font-medium">
                  {statsLabel}
                </div>
              </div>

              {/* Overlapping Circular User Photos */}
              <div className="flex -space-x-2.5 items-center">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Student Patron"
                  className="w-10 h-10 rounded-full border-2 border-background dark:border-[#07090D] object-cover shadow-2xs"
                />
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80"
                  alt="Student Patron"
                  className="w-10 h-10 rounded-full border-2 border-background dark:border-[#07090D] object-cover shadow-2xs"
                />
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                  alt="Student Patron"
                  className="w-10 h-10 rounded-full border-2 border-background dark:border-[#07090D] object-cover shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Right Column: 3D Ribbed Book Bloom Sculpture (Flipped with shadow effects) */}
          <div
            data-aos="fade-left"
            data-aos-delay="200"
            className="lg:col-span-5 relative flex items-center justify-center lg:justify-end"
          >
            {/* Ambient Multi-Layered Radial Spotlight Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[420px] h-80 sm:h-[420px] bg-gradient-to-tr from-brand-blue/15 dark:from-brand-blue/25 via-purple-600/10 dark:via-purple-600/20 to-indigo-400/15 dark:to-indigo-400/20 rounded-full blur-[110px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-[380px] sm:max-w-[460px] lg:max-w-[520px] aspect-square flex items-center justify-center">
              <Image
                src={heroImg}
                alt="libra25 3D Origami Book Bloom Sculpture"
                priority
                unoptimized
                className="w-full h-full object-contain -scale-x-100 drop-shadow-[0_20px_50px_rgba(120,80,255,0.25)] dark:drop-shadow-[0_25px_60px_rgba(120,80,255,0.35)] drop-shadow-[0_10px_25px_rgba(29,97,255,0.15)] dark:drop-shadow-[0_10px_25px_rgba(29,97,255,0.25)] animate-float-slow select-none pointer-events-none transition-transform"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
