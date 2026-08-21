"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { IconButton } from "@/components/animate-ui/components/buttons/icon";
import {
  ThemeToggler,
  type ThemeSelection,
  type Resolved,
} from "@/components/animate-ui/primitives/effects/theme-toggler";
import { useLanguage } from "@/components/providers/language-provider";

interface ThemeToggleProps {
  fullWidth?: boolean;
}

export function ThemeToggle({ fullWidth = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themeText = language === "uz" ? "Rejim" : language === "ru" ? "Тема" : "Theme";

  if (!mounted) {
    if (fullWidth) {
      return (
        <div className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-3">
            <Sun className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>{themeText}</span>
          </div>
        </div>
      );
    }

    return (
      <IconButton
        variant="outline"
        size="sm"
        className="rounded-full w-9 h-9 border border-border bg-card text-muted-foreground"
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4" />
      </IconButton>
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
        const modeLabel = isDark
          ? language === "uz" ? "Tungi rejim" : language === "ru" ? "Темная" : "Dark Mode"
          : language === "uz" ? "Yorug' rejim" : language === "ru" ? "Светлая" : "Light Mode";

        if (fullWidth) {
          return (
            <button
              type="button"
              onClick={() => toggleTheme(isDark ? "light" : "dark")}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all duration-200 cursor-pointer"
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Moon className="h-4 w-4 shrink-0 text-brand-blue" />
                ) : (
                  <Sun className="h-4 w-4 shrink-0 text-brand-blue" />
                )}
                <span>{themeText}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-medium text-muted-foreground capitalize border border-border/60">
                {modeLabel}
              </span>
            </button>
          );
        }

        return (
          <IconButton
            variant="outline"
            size="sm"
            onClick={() => toggleTheme(isDark ? "light" : "dark")}
            className="rounded-full w-9 h-9 border border-border bg-card text-foreground hover:bg-accent hover:border-foreground/20 transition-all cursor-pointer shadow-2xs"
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-brand-blue animate-in zoom-in-50 duration-200" />
            ) : (
              <Moon className="h-4 w-4 text-brand-blue animate-in zoom-in-50 duration-200" />
            )}
          </IconButton>
        );
      }}
    </ThemeToggler>
  );
}
