"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { BookOpen, Shield, ClipboardList, BookMarked, Bookmark, Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSearchVisibility } from "@/lib/hooks/use-search-visibility";
import { SearchHeader } from "@/components/modules/search/search-header";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, isLoaded, user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const isSearchObscured = useSearchVisibility("catalog-search-bar");
  const userRole = user?.publicMetadata?.role as string | undefined;

  const isAssistantOrAdmin = userRole === "ASSISTANT" || userRole === "ADMIN";
  const isAdmin = userRole === "ADMIN";

  // Collapse expanded search if main catalog search becomes visible again
  useEffect(() => {
    if (!isSearchObscured) {
      setIsSearchExpanded(false);
    }
  }, [isSearchObscured]);

  // Handle escape key to close search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchExpanded) {
        setIsSearchExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchExpanded]);

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
      <header className="fixed top-0 left-0 right-0 z-50 w-full glass-frosted border-b border-hairline shadow-soft-floating">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Brand Logo - Fixed Left */}
          <Link href={isSignedIn ? "/catalog" : "/"} className="flex items-center gap-2.5 group shrink-0 transition-transform duration-300">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-yellow text-black font-bold shadow-sm transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                ShelfSync
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground -mt-1">
                Library
              </span>
            </div>
          </Link>

          {/* Center Navigation & Search Bar Area with Fluid Layout Transitions */}
          <div className="flex-1 flex items-center justify-center px-2 sm:px-6 min-w-0">
            {/* Desktop Navigation Links (Smoothly fades & collapses when search expands) */}
            <nav
              className={cn(
                "hidden md:flex items-center gap-1 transition-all duration-300 ease-in-out transform-gpu origin-center",
                isSearchExpanded
                  ? "max-w-0 opacity-0 scale-95 pointer-events-none overflow-hidden"
                  : "max-w-2xl opacity-100 scale-100"
              )}
            >
              {pathname === "/" ? (
                /* Landing Page Section Navigation Buttons */
                <>
                  <a
                    href="#product"
                    className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-full transition-all duration-300 ease-out hover:scale-105"
                  >
                    Product
                  </a>
                  <a
                    href="#features"
                    className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-full transition-all duration-300 ease-out hover:scale-105"
                  >
                    Features
                  </a>
                  <a
                    href="#pricing"
                    className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-full transition-all duration-300 ease-out hover:scale-105"
                  >
                    Pricing
                  </a>
                  <a
                    href="#resources"
                    className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-full transition-all duration-300 ease-out hover:scale-105"
                  >
                    Resources
                  </a>
                </>
              ) : (
                /* Functional Application Navigation Links */
                isLoaded && isSignedIn && (
                  <>
                    <Link
                      href="/catalog"
                      className={cn(
                        "px-2.5 xl:px-3.5 py-1.5 xl:py-2 text-xs xl:text-sm font-medium rounded-full transition-colors",
                        pathname.startsWith("/catalog")
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      Catalog
                    </Link>

                    <Link
                      href="/reservations"
                      className={cn(
                        "px-2.5 xl:px-3.5 py-1.5 xl:py-2 text-xs xl:text-sm font-medium rounded-full transition-colors flex items-center gap-1.5",
                        pathname.startsWith("/reservations")
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <Bookmark className="h-4 w-4 text-brand-yellow fill-current" />
                      Holds
                    </Link>

                    <Link
                      href="/loans"
                      className={cn(
                        "px-2.5 xl:px-3.5 py-1.5 xl:py-2 text-xs xl:text-sm font-medium rounded-full transition-colors flex items-center gap-1.5",
                        pathname.startsWith("/loans")
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <BookMarked className="h-4 w-4" />
                      Loans
                    </Link>

                    {isAssistantOrAdmin && (
                      <>
                        <Link
                          href="/assistant/books"
                          className={cn(
                            "px-2.5 xl:px-3.5 py-1.5 xl:py-2 text-xs xl:text-sm font-medium rounded-full transition-colors flex items-center gap-1.5",
                            pathname.startsWith("/assistant/books")
                              ? "bg-accent text-accent-foreground font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          )}
                        >
                          <BookOpen className="h-4 w-4 text-emerald-500" />
                          <span className="hidden xl:inline">Manage </span>Books
                        </Link>

                        <Link
                          href="/assistant"
                          className={cn(
                            "px-2.5 xl:px-3.5 py-1.5 xl:py-2 text-xs xl:text-sm font-medium rounded-full transition-colors flex items-center gap-1.5",
                            pathname === "/assistant" || pathname === "/assistant/desk"
                              ? "bg-accent text-accent-foreground font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          )}
                        >
                          <ClipboardList className="h-4 w-4 text-brand-blue" />
                          Circulation
                        </Link>
                      </>
                    )}

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className={cn(
                          "px-2.5 xl:px-3.5 py-1.5 xl:py-2 text-xs xl:text-sm font-medium rounded-full transition-colors flex items-center gap-1.5",
                          pathname.startsWith("/admin")
                            ? "bg-accent text-accent-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        )}
                      >
                        <Shield className="h-4 w-4 text-brand-blue" />
                        Admin
                      </Link>
                    )}
                  </>
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
                placeholder="Search catalog by title, author, or ISBN (typo-tolerant)..."
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
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Animated Search Button Wrapper - Smoothly animates width/position when search bar is obscured */}
            <div
              className={cn(
                "flex items-center overflow-hidden transition-all duration-500 ease-in-out transform-gpu",
                isSearchObscured && !isSearchExpanded
                  ? "max-w-[180px] opacity-100 scale-100 translate-x-0"
                  : "max-w-0 opacity-0 scale-95 translate-x-2 pointer-events-none"
              )}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSearchExpanded(true)}
                aria-label="Open search bar"
                className="rounded-full flex items-center gap-2 border-border bg-card/90 hover:bg-accent text-foreground shadow-2xs transition-all duration-300 min-h-[40px] px-3 sm:px-3.5 whitespace-nowrap"
              >
                <Search className="h-4 w-4 text-brand-blue shrink-0" />
                <span className="hidden sm:inline text-xs font-semibold">Search catalog...</span>
              </Button>
            </div>

            {!isLoaded ? (
              <div className="h-8 w-20 skeleton-shimmer rounded-full" />
            ) : isSignedIn ? (
              <div className="flex items-center gap-3 transition-transform duration-300">
                {userRole && (
                  <span className="hidden sm:inline-block text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-accent text-foreground border border-border">
                    {userRole}
                  </span>
                )}
                <UserButton />
              </div>
            ) : (
              <div className="flex items-center gap-2 transition-transform duration-300">
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="rounded-full font-medium px-3.5 text-xs text-foreground">
                    Sign in
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button size="sm" variant="gradient" className="rounded-full font-semibold px-4 text-xs">
                    Request a Demo
                  </Button>
                </SignInButton>
              </div>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle mobile menu"
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground hover:bg-accent transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Collapsible Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-card/98 backdrop-blur-md px-4 py-4 space-y-2 animate-in fade-in slide-in-from-top-2">
            {pathname === "/" ? (
              <>
                <a
                  href="#product"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl text-foreground hover:bg-accent/50"
                >
                  Product
                </a>
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl text-foreground hover:bg-accent/50"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl text-foreground hover:bg-accent/50"
                >
                  Pricing
                </a>
                <a
                  href="#resources"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl text-foreground hover:bg-accent/50"
                >
                  Resources
                </a>
              </>
            ) : (
              isLoaded && isSignedIn && (
                <>
                  <Link
                    href="/catalog"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-colors min-h-[44px]",
                      pathname.startsWith("/catalog")
                        ? "bg-accent text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-accent/50"
                    )}
                  >
                    <BookOpen className="h-4 w-4 text-brand-blue" />
                    Catalog
                  </Link>

                  <Link
                    href="/reservations"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-colors min-h-[44px]",
                      pathname.startsWith("/reservations")
                        ? "bg-accent text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-accent/50"
                    )}
                  >
                    <Bookmark className="h-4 w-4 text-brand-yellow fill-current" />
                    Holds
                  </Link>

                  <Link
                    href="/loans"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-colors min-h-[44px]",
                      pathname.startsWith("/loans")
                        ? "bg-accent text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-accent/50"
                    )}
                  >
                    <BookMarked className="h-4 w-4" />
                    Loans
                  </Link>

                  {isAssistantOrAdmin && (
                    <>
                      <Link
                        href="/assistant/books"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-colors min-h-[44px]",
                          pathname.startsWith("/assistant/books")
                            ? "bg-accent text-foreground font-semibold"
                            : "text-muted-foreground hover:bg-accent/50"
                        )}
                      >
                        <BookOpen className="h-4 w-4 text-emerald-500" />
                        Manage Books
                      </Link>

                      <Link
                        href="/assistant"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-colors min-h-[44px]",
                          pathname === "/assistant" || pathname === "/assistant/desk"
                            ? "bg-accent text-foreground font-semibold"
                            : "text-muted-foreground hover:bg-accent/50"
                        )}
                      >
                        <ClipboardList className="h-4 w-4 text-brand-blue" />
                        Circulation
                      </Link>
                    </>
                  )}

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-colors min-h-[44px]",
                        pathname.startsWith("/admin")
                          ? "bg-accent text-foreground font-semibold"
                          : "text-muted-foreground hover:bg-accent/50"
                      )}
                    >
                      <Shield className="h-4 w-4 text-brand-blue" />
                      Admin Console
                    </Link>
                  )}
                </>
              )
            )}
          </div>
        )}
      </header>

      {/* Layout Spacer so content below header is never covered */}
      <div className="h-16 shrink-0" aria-hidden="true" />
    </>
  );
}
