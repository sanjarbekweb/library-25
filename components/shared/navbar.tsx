"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { BookOpen, Shield, ClipboardList, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role as string | undefined;

  const isAssistantOrAdmin = userRole === "ASSISTANT" || userRole === "ADMIN";
  const isAdmin = userRole === "ADMIN";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-yellow text-black font-bold shadow-sm transition-transform group-hover:scale-105">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              ShelfSync
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground -mt-1">
              Library Platform
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-full transition-colors",
              pathname === "/"
                ? "bg-accent text-accent-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            Catalog
          </Link>

          <SignedIn>
            <Link
              href="/loans"
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5",
                pathname.startsWith("/loans")
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <BookMarked className="h-4 w-4" />
              My Loans
            </Link>

            {isAssistantOrAdmin && (
              <Link
                href="/assistant"
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5",
                  pathname.startsWith("/assistant")
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <ClipboardList className="h-4 w-4 text-brand-blue" />
                Circulation Desk
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5",
                  pathname.startsWith("/admin")
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Shield className="h-4 w-4 text-purple-600" />
                Admin
              </Link>
            )}
          </SignedIn>
        </nav>

        {/* Auth Action */}
        <div className="flex items-center gap-3">
          <SignedIn>
            <div className="flex items-center gap-3">
              {userRole && (
                <span className="hidden sm:inline-block text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-accent text-foreground border border-border">
                  {userRole}
                </span>
              )}
              <UserButton />
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm" className="rounded-full font-medium px-4">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
