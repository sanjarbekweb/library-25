"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import {
  ThemeToggler,
  type ThemeSelection,
  type Resolved,
} from "@/components/animate-ui/primitives/effects/theme-toggler";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  isCollapsed?: boolean;
}

export function ThemeToggle({ isCollapsed = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themeText = t("theme");

  if (!mounted) {
    return (
      <div className="w-full h-10 flex items-center rounded-2xl text-xs font-semibold text-muted-foreground px-2.5">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <Sun className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
        <span
          className={cn(
            "ml-3 font-semibold text-foreground/90 whitespace-nowrap overflow-hidden transition-all duration-300",
            isCollapsed ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"
          )}
        >
          {themeText}
        </span>
      </div>
    );
  }

  const effectiveTheme = (theme || "system") as ThemeSelection;
  const currentResolved = (resolvedTheme || "light") as Resolved;

  return (
    <ThemeToggler
      theme={effectiveTheme}
      resolvedTheme={currentResolved}
      setTheme={(t) => setTheme(t)}
      direction="ltr"
    >
      {({ resolved, toggleTheme }) => {
        const isDark = resolved === "dark";

        return (
          <button
            type="button"
            onClick={() => toggleTheme(isDark ? "light" : "dark")}
            className="w-full h-10 flex items-center rounded-2xl text-xs font-semibold text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all duration-200 cursor-pointer group px-2.5"
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            title={isCollapsed ? themeText : undefined}
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center">
              {isDark ? (
                <Moon className="h-4 w-4 shrink-0 text-brand-blue transition-transform group-hover:-rotate-12" />
              ) : (
                <Sun className="h-4 w-4 shrink-0 text-brand-blue transition-transform group-hover:rotate-45" />
              )}
            </div>
            <span
              className={cn(
                "ml-3 font-semibold text-foreground/90 whitespace-nowrap overflow-hidden transition-all duration-300",
                isCollapsed ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"
              )}
            >
              {themeText}
            </span>
          </button>
        );
      }}
    </ThemeToggler>
  );
}
