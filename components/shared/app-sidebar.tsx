"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton, SignOutButton } from "@clerk/nextjs";
import {
  Compass,
  BookMarked,
  Bookmark,
  LogOut,
  BookOpen,
  ClipboardList,
  Shield,
  X,
  Bell,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { IconButton } from "@/components/animate-ui/components/buttons/icon";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AppSidebar({ mobileOpen = false, onCloseMobile }: AppSidebarProps) {
  const pathname = usePathname();
  const { isSignedIn, isLoaded, user } = useUser();
  const { t } = useLanguage();
  const userRole = user?.publicMetadata?.role as string | undefined;

  const isAssistantOrAdmin = userRole === "ASSISTANT" || userRole === "ADMIN";
  const isAdmin = userRole === "ADMIN";

  const roleString = (userRole || "STUDENT").toLowerCase();
  const localizedRole =
    roleString === "admin"
      ? t("admin")
      : roleString === "assistant"
      ? t("assistant")
      : t("student");

  const navItems = [
    {
      label: t("discover"),
      href: "/catalog",
      icon: Compass,
      active: pathname === "/catalog" || pathname === "/",
    },
    {
      label: t("myLibrary"),
      href: "/loans",
      icon: BookMarked,
      active: pathname.startsWith("/loans"),
    },
    {
      label: t("holds"),
      href: "/reservations",
      icon: Bookmark,
      active: pathname.startsWith("/reservations"),
    },
  ];

  const staffItems = isAssistantOrAdmin
    ? [
        {
          label: t("manageBooks"),
          href: "/assistant/books",
          icon: BookOpen,
          active: pathname.startsWith("/assistant/books"),
        },
        {
          label: t("circulation"),
          href: "/assistant/desk",
          icon: ClipboardList,
          active: pathname.startsWith("/assistant/desk") || pathname === "/assistant",
        },
      ]
    : [];

  const adminItems = isAdmin
    ? [
        {
          label: t("adminConsole"),
          href: "/admin",
          icon: Shield,
          active: pathname.startsWith("/admin"),
        },
      ]
    : [];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-60 flex-col justify-between border-r border-border bg-card p-4 sm:p-5 transition-transform duration-300 ease-in-out md:translate-x-0 overflow-y-auto",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="space-y-6">
          {/* Brand Logo Header */}
          <div className="flex items-center justify-between">
            <Link
              href={isSignedIn ? "/catalog" : "/"}
              className="flex items-center gap-2.5 group"
              onClick={onCloseMobile}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white font-bold shadow-sm transition-transform group-hover:scale-105">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-foreground">
                ShelfSync
              </span>
            </Link>

            {/* Mobile close button */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground md:hidden cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Main Navigation Links */}
          <nav className="space-y-1 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200",
                    item.active
                      ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Staff Navigation Links */}
            {staffItems.length > 0 && (
              <div className="pt-4 space-y-1">
                <p className="px-3 text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
                  {t("deskAndStaff")}
                </p>
                {staffItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200",
                        item.active
                          ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Admin Section */}
            {adminItems.length > 0 && (
              <div className="pt-4 space-y-1">
                <p className="px-3 text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
                  {t("management")}
                </p>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200",
                        item.active
                          ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>
        </div>

        {/* Bottom Utility Controls & User Profile */}
        <div className="space-y-3 border-t border-border/60 pt-4 mt-6">
          {/* Vertical Icon Buttons Stack */}
          <div className="flex flex-col items-center gap-2.5 py-1">
            <LanguageToggle />
            <ThemeToggle />
            <div className="relative">
              <IconButton
                variant="outline"
                size="sm"
                className="rounded-full w-9 h-9 border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer shadow-2xs"
                aria-label={t("notifications")}
                title={t("notifications")}
              >
                <Bell className="h-4 w-4" />
              </IconButton>
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive pointer-events-none" />
            </div>
          </div>

          {/* User Account Profile Card */}
          {isLoaded && isSignedIn ? (
            <div className="p-2.5 rounded-2xl bg-accent/40 border border-border/60 space-y-2">
              <div className="flex items-center gap-2.5">
                <UserButton />
                <div className="flex flex-col min-w-0 flex-1 text-left">
                  <span className="text-xs font-bold text-foreground truncate leading-tight">
                    {user?.fullName || user?.firstName || t("patron")}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground capitalize">
                    {localizedRole}
                  </span>
                </div>
              </div>

              <SignOutButton redirectUrl="/">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-2 py-1.5 rounded-xl text-[11px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-left cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{t("signOut")}</span>
                </button>
              </SignOutButton>
            </div>
          ) : (
            <div className="pt-1">
              <Link
                href="/sign-in"
                onClick={onCloseMobile}
                className="flex items-center justify-center w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-brand-blue text-white hover:bg-brand-blue/90 transition-all text-center cursor-pointer shadow-sm"
              >
                <span>{t("signIn")}</span>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
