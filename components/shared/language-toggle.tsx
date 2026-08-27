"use client";

import { useLanguage, Language } from "@/components/providers/language-provider";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  isCollapsed?: boolean;
}

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "uz", label: "O'zbekcha", flag: "🇺🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

export function LanguageToggle({ isCollapsed = false }: LanguageToggleProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="w-full h-10 flex items-center rounded-2xl text-xs font-semibold text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all duration-200 cursor-pointer group px-2.5"
          aria-label={t("language")}
          title={isCollapsed ? t("language") : undefined}
        >
          <div className="flex h-5 w-5 shrink-0 items-center justify-center">
            <Globe className="h-4 w-4 text-brand-blue shrink-0 transition-transform group-hover:rotate-12" />
          </div>
          <span
            className={cn(
              "ml-3 font-semibold text-foreground/90 whitespace-nowrap overflow-hidden transition-all duration-300",
              isCollapsed ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"
            )}
          >
            {t("language")}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isCollapsed ? "start" : "end"}
        side="right"
        className="w-44 rounded-2xl p-1.5 shadow-xl border border-border bg-card"
      >
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={cn(
              "flex items-center justify-between text-xs py-2 px-3 rounded-xl cursor-pointer font-medium transition-colors",
              language === lang.code
                ? "bg-accent font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <span className="text-sm">{lang.flag}</span>
              <span>{lang.label}</span>
            </span>
            {language === lang.code && <Check className="h-3.5 w-3.5 text-brand-blue" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
