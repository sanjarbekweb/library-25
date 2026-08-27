"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import {
  BookOpen,
  Shield,
  ClipboardList,
  BookMarked,
  Bookmark,
  Menu,
  X,
  Search,
  Sparkles,
  Layers,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { useLenis } from "lenis/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSearchVisibility } from "@/lib/hooks/use-search-visibility";
import { SearchHeader } from "@/components/modules/search/search-header";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { useLanguage } from "@/components/providers/language-provider";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useLenis();
  const { t } = useLanguage();
  const { isSignedIn, isLoaded, user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const isSearchObscured = useSearchVisibility("catalog-search-bar");
  const userRole = user?.publicMetadata?.role as string | undefined;

  const isAssistantOrAdmin = userRole === "ASSISTANT" || userRole === "ADMIN";
  const isAdmin = userRole === "ADMIN";

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (lenis) {
      lenis.scrollTo(targetId, {
        duration: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        offset: -72,
      });
    } else {
      const el = document.querySelector(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Collapse expanded search if main catalog search becomes visible again
  useEffect(() => {
    if (!isSearchObscured) {
      setIsSearchExpanded(false);
    }
  }, [isSearchObscured]);

  // Handle escape key to close search bar or mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isSearchExpanded) setIsSearchExpanded(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchExpanded, mobileMenuOpen]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleNavbarSearchSubmit = (query: string) => {
    setIsSearchExpanded(false);
    if (query.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/catalog`);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-background/80 dark:bg-[#07090D]/85 backdrop-blur-md border-b border-border/80 dark:border-white/10 shadow-xs transition-colors duration-200">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-3.5 sm:px-6 lg:px-8">
          {/* Brand Logo - Fixed Left */}
          <Link
            href={isSignedIn ? "/catalog" : "/"}
            className="flex items-center gap-2.5 group shrink-0 transition-transform duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-brand-blue rounded-xl p-1"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white font-bold shadow-xs transition-shadow group-hover:shadow-md">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
                libra25
              </span>
              <span className="text-[9px] font-mono font-semibold uppercase tracking-widest text-muted-foreground -mt-1">
                Library
              </span>
            </div>
          </Link>

          {/* Center Navigation & Search Bar Area with Fluid Desktop/Laptop Transitions */}
          <div className="flex-1 flex items-center justify-center px-2 sm:px-6 min-w-0">
            {/* Desktop Navigation Links (Smoothly fades & collapses when search expands) */}
            <nav
              className={cn(
                "hidden md:flex items-center gap-1 lg:gap-1.5 transition-all duration-300 ease-in-out transform-gpu origin-center",
                isSearchExpanded
                  ? "max-w-0 opacity-0 scale-95 pointer-events-none overflow-hidden"
                  : "max-w-2xl opacity-100 scale-100"
              )}
            >
              {pathname === "/" ? (
                /* Landing Page Section Navigation Buttons */
                <div className="flex items-center gap-1 p-1 rounded-full border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs">
                  <a
                    href="#product"
                    onClick={(e) => handleScrollToSection(e, "#product")}
                    className="px-3.5 py-1.5 text-xs lg:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-full transition-all duration-200"
                  >
                    {t("product")}
                  </a>
                  <a
                    href="#features"
                    onClick={(e) => handleScrollToSection(e, "#features")}
                    className="px-3.5 py-1.5 text-xs lg:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-full transition-all duration-200"
                  >
                    {t("features")}
                  </a>
                  <a
                    href="#pricing"
                    onClick={(e) => handleScrollToSection(e, "#pricing")}
                    className="px-3.5 py-1.5 text-xs lg:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-full transition-all duration-200"
                  >
                    {t("pricing")}
                  </a>
                  <a
                    href="#resources"
                    onClick={(e) => handleScrollToSection(e, "#resources")}
                    className="px-3.5 py-1.5 text-xs lg:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-full transition-all duration-200"
                  >
                    {t("resources")}
                  </a>
                </div>
              ) : (
                /* Functional Application Navigation Links */
                isLoaded && isSignedIn && (
                  <div className="flex items-center gap-1 p-1 rounded-full border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs">
                    <Link
                      href="/catalog"
                      className={cn(
                        "px-3 py-1.5 text-xs lg:text-sm font-medium rounded-full transition-colors",
                        pathname.startsWith("/catalog")
                          ? "bg-brand-blue text-white font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                      )}
                    >
                      {t("catalog")}
                    </Link>

                    <Link
                      href="/reservations"
                      className={cn(
                        "px-3 py-1.5 text-xs lg:text-sm font-medium rounded-full transition-colors flex items-center gap-1.5",
                        pathname.startsWith("/reservations")
                          ? "bg-brand-blue text-white font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                      )}
                    >
                      <Bookmark className="h-3.5 w-3.5 fill-current" />
                      {t("holds")}
                    </Link>

                    <Link
                      href="/loans"
                      className={cn(
                        "px-3 py-1.5 text-xs lg:text-sm font-medium rounded-full transition-colors flex items-center gap-1.5",
                        pathname.startsWith("/loans")
                          ? "bg-brand-blue text-white font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                      )}
                    >
                      <BookMarked className="h-3.5 w-3.5" />
                      {t("loans")}
                    </Link>

                    {isAssistantOrAdmin && (
                      <>
                        <Link
                          href="/assistant/books"
                          className={cn(
                            "px-3 py-1.5 text-xs lg:text-sm font-medium rounded-full transition-colors flex items-center gap-1.5",
                            pathname.startsWith("/assistant/books")
                              ? "bg-brand-blue text-white font-semibold shadow-xs"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                          )}
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          {t("manageBooks")}
                        </Link>

                        <Link
                          href="/assistant"
                          className={cn(
                            "px-3 py-1.5 text-xs lg:text-sm font-medium rounded-full transition-colors flex items-center gap-1.5",
                            pathname === "/assistant" || pathname === "/assistant/desk"
                              ? "bg-brand-blue text-white font-semibold shadow-xs"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                          )}
                        >
                          <ClipboardList className="h-3.5 w-3.5" />
                          {t("circulation")}
                        </Link>
                      </>
                    )}

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className={cn(
                          "px-3 py-1.5 text-xs lg:text-sm font-medium rounded-full transition-colors flex items-center gap-1.5",
                          pathname.startsWith("/admin")
                            ? "bg-brand-blue text-white font-semibold shadow-xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                        )}
                      >
                        <Shield className="h-3.5 w-3.5" />
                        {t("adminConsole")}
                      </Link>
                    )}
                  </div>
                )
              )}
            </nav>

            {/* Expanded Search Bar Container (Smoothly expands & opens when search button clicked) */}
            <div
              className={cn(
                "flex items-center gap-2 w-full transition-all duration-300 ease-in-out transform-gpu origin-center",
                isSearchExpanded
                  ? "max-w-2xl opacity-100 scale-100 pointer-events-auto"
                  : "max-w-0 opacity-0 scale-95 pointer-events-none overflow-hidden"
              )}
            >
              <SearchHeader
                placeholder="Search catalog by title, author, or ISBN..."
                onSearchSubmit={handleNavbarSearchSubmit}
                autoFocus={isSearchExpanded}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchExpanded(false)}
                aria-label="Close search bar"
                className="h-10 w-10 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-accent shrink-0 transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </Button>
            </div>
          </div>

          {/* Auth Actions & Header CTAs - Right Section */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Animated Search Trigger Button */}
            <div
              className={cn(
                "flex items-center overflow-hidden transition-all duration-300 ease-in-out transform-gpu",
                isSearchObscured && !isSearchExpanded
                  ? "max-w-[48px] opacity-100 scale-100 translate-x-0"
                  : "max-w-0 opacity-0 scale-95 translate-x-2 pointer-events-none"
              )}
            >
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setIsSearchExpanded(true)}
                aria-label="Open catalog search"
                className="rounded-full w-9 h-9 border border-border bg-card/90 hover:bg-accent text-foreground shadow-2xs transition-all duration-200 shrink-0 cursor-pointer"
              >
                <Search className="h-4 w-4 text-brand-blue" />
              </Button>
            </div>

            {/* Auth Buttons / User Button */}
            {!isLoaded ? (
              <div className="h-8 w-20 skeleton-shimmer rounded-full" />
            ) : isSignedIn ? (
              <div className="flex items-center gap-2 sm:gap-3 transition-transform duration-200">
                {userRole && (
                  <span className="hidden sm:inline-block text-[10px] font-mono uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue dark:bg-white/10 dark:text-white border border-brand-blue/20 dark:border-white/20">
                    {userRole}
                  </span>
                )}
                <UserButton />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 transition-transform duration-200">
                <SignInButton mode="modal" fallbackRedirectUrl="/catalog" forceRedirectUrl="/catalog">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full font-medium px-2.5 sm:px-3.5 text-xs text-foreground hover:bg-accent/60 cursor-pointer"
                  >
                    Sign in
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal" fallbackRedirectUrl="/catalog" forceRedirectUrl="/catalog">
                  <Button
                    size="sm"
                    className="rounded-full font-semibold px-3 sm:px-4 text-xs bg-brand-blue text-white hover:bg-brand-blue/90 shadow-xs cursor-pointer"
                  >
                    Sign up
                  </Button>
                </SignUpButton>
              </div>
            )}

            {/* Compact Preferences (Language & Theme) for Laptop & Desktop */}
            <div className="hidden sm:flex items-center gap-1 shrink-0 pl-1 border-l border-border/70">
              <LanguageToggle isCollapsed={true} />
              <ThemeToggle isCollapsed={true} />
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card/80 text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {/* Mobile Collapsible Navigation Drawer with Full-Featured Preferences */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="md:hidden border-b border-border/80 bg-card/95 backdrop-blur-xl px-4 py-5 space-y-4 shadow-xl overflow-hidden"
            >
              {/* Navigation Links for Landing vs App */}
              {pathname === "/" ? (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-3">
                    Navigation
                  </span>
                  <div className="grid grid-cols-1 gap-1 pt-1">
                    <a
                      href="#product"
                      onClick={(e) => handleScrollToSection(e, "#product")}
                      className="flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-xl text-foreground hover:bg-accent/60 transition-colors min-h-[44px]"
                    >
                      <span className="flex items-center gap-2.5">
                        <BookOpen className="h-4 w-4 text-brand-blue" />
                        {t("product")}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                    </a>
                    <a
                      href="#features"
                      onClick={(e) => handleScrollToSection(e, "#features")}
                      className="flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-xl text-foreground hover:bg-accent/60 transition-colors min-h-[44px]"
                    >
                      <span className="flex items-center gap-2.5">
                        <Layers className="h-4 w-4 text-brand-blue" />
                        {t("features")}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                    </a>
                    <a
                      href="#pricing"
                      onClick={(e) => handleScrollToSection(e, "#pricing")}
                      className="flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-xl text-foreground hover:bg-accent/60 transition-colors min-h-[44px]"
                    >
                      <span className="flex items-center gap-2.5">
                        <Sparkles className="h-4 w-4 text-brand-blue" />
                        {t("pricing")}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                    </a>
                    <a
                      href="#resources"
                      onClick={(e) => handleScrollToSection(e, "#resources")}
                      className="flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-xl text-foreground hover:bg-accent/60 transition-colors min-h-[44px]"
                    >
                      <span className="flex items-center gap-2.5">
                        <MessageSquare className="h-4 w-4 text-brand-blue" />
                        {t("resources")}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                    </a>
                  </div>
                </div>
              ) : (
                isLoaded && isSignedIn && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-3">
                      Library Console
                    </span>
                    <div className="grid grid-cols-1 gap-1 pt-1">
                      <Link
                        href="/catalog"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors min-h-[44px]",
                          pathname.startsWith("/catalog")
                            ? "bg-brand-blue text-white font-semibold shadow-xs"
                            : "text-foreground hover:bg-accent/60"
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          <BookOpen className="h-4 w-4" />
                          {t("catalog")}
                        </span>
                        <ChevronRight className="h-4 w-4 opacity-70" />
                      </Link>

                      <Link
                        href="/reservations"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors min-h-[44px]",
                          pathname.startsWith("/reservations")
                            ? "bg-brand-blue text-white font-semibold shadow-xs"
                            : "text-foreground hover:bg-accent/60"
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          <Bookmark className="h-4 w-4 fill-current" />
                          {t("holds")}
                        </span>
                        <ChevronRight className="h-4 w-4 opacity-70" />
                      </Link>

                      <Link
                        href="/loans"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors min-h-[44px]",
                          pathname.startsWith("/loans")
                            ? "bg-brand-blue text-white font-semibold shadow-xs"
                            : "text-foreground hover:bg-accent/60"
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          <BookMarked className="h-4 w-4" />
                          {t("loans")}
                        </span>
                        <ChevronRight className="h-4 w-4 opacity-70" />
                      </Link>

                      {isAssistantOrAdmin && (
                        <>
                          <Link
                            href="/assistant/books"
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors min-h-[44px]",
                              pathname.startsWith("/assistant/books")
                                ? "bg-brand-blue text-white font-semibold shadow-xs"
                                : "text-foreground hover:bg-accent/60"
                            )}
                          >
                            <span className="flex items-center gap-2.5">
                              <BookOpen className="h-4 w-4 text-brand-blue" />
                              {t("manageBooks")}
                            </span>
                            <ChevronRight className="h-4 w-4 opacity-70" />
                          </Link>

                          <Link
                            href="/assistant"
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors min-h-[44px]",
                              pathname === "/assistant" || pathname === "/assistant/desk"
                                ? "bg-brand-blue text-white font-semibold shadow-xs"
                                : "text-foreground hover:bg-accent/60"
                            )}
                          >
                            <span className="flex items-center gap-2.5">
                              <ClipboardList className="h-4 w-4 text-brand-blue" />
                              {t("circulation")}
                            </span>
                            <ChevronRight className="h-4 w-4 opacity-70" />
                          </Link>
                        </>
                      )}

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors min-h-[44px]",
                            pathname.startsWith("/admin")
                              ? "bg-brand-blue text-white font-semibold shadow-xs"
                              : "text-foreground hover:bg-accent/60"
                          )}
                        >
                          <span className="flex items-center gap-2.5">
                            <Shield className="h-4 w-4 text-brand-blue" />
                            {t("adminConsole")}
                          </span>
                          <ChevronRight className="h-4 w-4 opacity-70" />
                        </Link>
                      )}
                    </div>
                  </div>
                )
              )}

              {/* Preferences Divider */}
              <div className="pt-2 border-t border-border/70 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-3">
                  Preferences
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-1 rounded-xl border border-border/80 bg-background/50 flex items-center justify-center">
                    <LanguageToggle isCollapsed={false} />
                  </div>
                  <div className="p-1 rounded-xl border border-border/80 bg-background/50 flex items-center justify-center">
                    <ThemeToggle isCollapsed={false} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Dimmed backdrop overlay when mobile menu is open */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Layout Spacer so content below header is never covered */}
      <div className="h-16 shrink-0" aria-hidden="true" />
    </>
  );
}
