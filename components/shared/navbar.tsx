"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { BookOpen, Shield, ClipboardList, BookMarked, Bookmark, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded, user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userRole = user?.publicMetadata?.role as string | undefined;

  const isAssistantOrAdmin = userRole === "ASSISTANT" || userRole === "ADMIN";
  const isAdmin = userRole === "ADMIN";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full glass-frosted border-b border-hairline shadow-soft-floating">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Brand Logo */}
          <Link href={isSignedIn ? "/catalog" : "/"} className="flex items-center gap-2.5 group">
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

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                "px-3.5 py-2 text-sm font-medium rounded-full transition-colors",
                pathname === "/"
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              Home
            </Link>

            <Link
              href="/catalog"
              className={cn(
                "px-3.5 py-2 text-sm font-medium rounded-full transition-colors",
                pathname.startsWith("/catalog")
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              Catalog
            </Link>

            {isLoaded && isSignedIn && (
              <>
                <Link
                  href="/reservations"
                  className={cn(
                    "px-3.5 py-2 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5",
                    pathname.startsWith("/reservations")
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Bookmark className="h-4 w-4 text-brand-yellow fill-current" />
                  My Holds
                </Link>

                <Link
                  href="/loans"
                  className={cn(
                    "px-3.5 py-2 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5",
                    pathname.startsWith("/loans")
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <BookMarked className="h-4 w-4" />
                  My Loans
                </Link>

                {isAssistantOrAdmin && (
                  <>
                    <Link
                      href="/assistant/books"
                      className={cn(
                        "px-3.5 py-2 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5",
                        pathname.startsWith("/assistant/books")
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <BookOpen className="h-4 w-4 text-emerald-500" />
                      Manage Books
                    </Link>

                    <Link
                      href="/assistant"
                      className={cn(
                        "px-3.5 py-2 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5",
                        pathname === "/assistant" || pathname === "/assistant/desk"
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <ClipboardList className="h-4 w-4 text-brand-blue" />
                      Circulation Desk
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <Link
                    href="/admin"
                    className={cn(
                      "px-3.5 py-2 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5",
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
            )}
          </nav>

          {/* Auth Action & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {!isLoaded ? (
              <div className="h-8 w-20 skeleton-shimmer rounded-full" />
            ) : isSignedIn ? (
              <div className="flex items-center gap-3">
                {userRole && (
                  <span className="hidden sm:inline-block text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-accent text-foreground border border-border">
                    {userRole}
                  </span>
                )}
                <UserButton />
              </div>
            ) : (
              <SignInButton mode="modal">
                <Button size="sm" className="rounded-full font-medium px-4">
                  Sign In
                </Button>
              </SignInButton>
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
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-colors min-h-[44px]",
                pathname === "/"
                  ? "bg-accent text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-accent/50"
              )}
            >
              <BookOpen className="h-4 w-4 text-brand-yellow" />
              Home
            </Link>

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

            {isLoaded && isSignedIn && (
              <>
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
                  My Holds
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
                  My Loans
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
                      Circulation Desk
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
            )}
          </div>
        )}
      </header>
      
      {/* Layout Spacer so content below header is never covered */}
      <div className="h-16 shrink-0" aria-hidden="true" />
    </>
  );
}
