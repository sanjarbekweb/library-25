"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  Compass,
  BookMarked,
  Bookmark,
  BookOpen,
  ClipboardList,
  Shield,
  X,
  PanelLeftClose,
  LogIn,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { NotificationsToggle } from "@/components/shared/notifications-toggle";
import { useLanguage } from "@/components/providers/language-provider";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AppSidebar({ mobileOpen: propMobileOpen, onCloseMobile: propOnCloseMobile }: AppSidebarProps) {
  const pathname = usePathname();
  const { isSignedIn, isLoaded, user } = useUser();
  const { t } = useLanguage();
  const sidebar = useSidebar();

  const isCollapsed = sidebar.isCollapsed;
  const mobileOpen = propMobileOpen !== undefined ? propMobileOpen : sidebar.mobileOpen;
  const handleCloseMobile = propOnCloseMobile || sidebar.closeMobile;

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
          onClick={handleCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between border-r border-border bg-card p-3.5 transition-all duration-300 ease-in-out md:translate-x-0 overflow-y-auto overflow-x-hidden",
          isCollapsed ? "md:w-[68px]" : "md:w-64",
          // Mobile state: full width drawer
          mobileOpen
            ? "w-64 translate-x-0 shadow-2xl"
            : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="space-y-6">
          {/* Brand Logo Header & Collapse / Expand Interaction */}
          <div className="flex items-center justify-between h-10">
            {isCollapsed ? (
              /* When folded: click the libra25 logo icon to expand the sidebar */
              <button
                type="button"
                onClick={sidebar.toggleCollapse}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-white font-bold shadow-sm transition-transform hover:scale-105 cursor-pointer"
                title={t("expandSidebar")}
                aria-label={t("expandSidebar")}
              >
                <BookOpen className="h-5 w-5" />
              </button>
            ) : (
              /* When expanded: logo links to home/catalog, collapse button is on the top right */
              <>
                <Link
                  href={isSignedIn ? "/catalog" : "/"}
                  className="flex items-center gap-3 group min-w-0"
                  onClick={handleCloseMobile}
                  title="libra25"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-white font-bold shadow-sm transition-transform group-hover:scale-105">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <span className="font-display text-xl font-bold tracking-tight text-foreground whitespace-nowrap overflow-hidden transition-all duration-300">
                    libra25
                  </span>
                </Link>

                {/* Desktop collapse button */}
                <button
                  type="button"
                  onClick={sidebar.toggleCollapse}
                  className="hidden md:flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors cursor-pointer shrink-0 ml-auto"
                  title={t("collapseSidebar")}
                  aria-label={t("collapseSidebar")}
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Mobile close button */}
            <button
              type="button"
              onClick={handleCloseMobile}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground md:hidden cursor-pointer ml-auto"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main Navigation Links */}
          <nav className="space-y-1 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleCloseMobile}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "w-full h-10 flex items-center rounded-2xl text-xs font-semibold transition-all duration-200 px-2.5 group",
                    item.active
                      ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                    <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                  </div>
                  <span
                    className={cn(
                      "ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 font-semibold truncate",
                      isCollapsed ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Staff Navigation Links */}
            {staffItems.length > 0 && (
              <div className="pt-2 space-y-1">
                {isCollapsed ? (
                  <div className="hidden md:block my-2 border-t border-border/60 mx-1" />
                ) : (
                  <p className="px-2.5 text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold truncate">
                    {t("deskAndStaff")}
                  </p>
                )}
                {/* Mobile header always visible */}
                <p className="px-2.5 text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold md:hidden">
                  {t("deskAndStaff")}
                </p>

                {staffItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleCloseMobile}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        "w-full h-10 flex items-center rounded-2xl text-xs font-semibold transition-all duration-200 px-2.5 group",
                        item.active
                          ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                      )}
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                        <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                      </div>
                      <span
                        className={cn(
                          "ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 font-semibold truncate",
                          isCollapsed ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Admin Section */}
            {adminItems.length > 0 && (
              <div className="pt-2 space-y-1">
                {isCollapsed ? (
                  <div className="hidden md:block my-2 border-t border-border/60 mx-1" />
                ) : (
                  <p className="px-2.5 text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold truncate">
                    {t("management")}
                  </p>
                )}
                {/* Mobile header always visible */}
                <p className="px-2.5 text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold md:hidden">
                  {t("management")}
                </p>

                {adminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleCloseMobile}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        "w-full h-10 flex items-center rounded-2xl text-xs font-semibold transition-all duration-200 px-2.5 group",
                        item.active
                          ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                      )}
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                        <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                      </div>
                      <span
                        className={cn(
                          "ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 font-semibold truncate",
                          isCollapsed ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>
        </div>

        {/* Bottom Utility Controls & User Profile */}
        <div className="space-y-2.5 border-t border-border/60 pt-3 mt-4">
          {/* Utility Controls with Stationary Icons */}
          <div className="flex flex-col gap-1 w-full">
            <NotificationsToggle isCollapsed={isCollapsed} />
            <ThemeToggle isCollapsed={isCollapsed} />
            <LanguageToggle isCollapsed={isCollapsed} />
          </div>

          {/* User Account Profile Card (Sign out accessible via UserButton modal) */}
          {isLoaded && isSignedIn ? (
            isCollapsed ? (
              <div className="hidden md:flex items-center justify-center py-1">
                <div className="flex h-8 w-8 items-center justify-center">
                  <UserButton />
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-2xl bg-accent/40 border border-border/60">
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
              </div>
            )
          ) : (
            <div className="pt-1">
              <Link
                href="/sign-in"
                onClick={handleCloseMobile}
                title={t("signIn")}
                className={cn(
                  "flex items-center justify-center rounded-2xl text-xs font-bold bg-brand-blue text-white hover:bg-brand-blue/90 transition-all text-center cursor-pointer shadow-sm",
                  isCollapsed
                    ? "md:w-10 md:h-10 md:p-0 w-full px-3.5 py-2.5"
                    : "w-full px-3.5 py-2.5"
                )}
              >
                <LogIn className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-1.5", isCollapsed && "md:mr-0")} />
                <span className={cn(isCollapsed && "md:hidden")}>{t("signIn")}</span>
              </Link>
            </div>
          )}

          {/* Always show full user profile on mobile */}
          {isLoaded && isSignedIn && isCollapsed && (
            <div className="p-2.5 rounded-2xl bg-accent/40 border border-border/60 md:hidden">
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
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
