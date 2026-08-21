"use client";

import { useLanguage, Language } from "@/components/providers/language-provider";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "uz", label: "O'zbekcha", flag: "🇺🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full w-9 h-9 p-0 border border-border bg-card text-foreground hover:bg-accent hover:border-foreground/20 transition-all cursor-pointer shadow-2xs flex items-center justify-center"
          aria-label="Switch language"
          title="Switch language"
        >
          <Globe className="h-4 w-4 text-brand-blue" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-40 rounded-2xl p-1.5 shadow-xl border border-border bg-card">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={cn(
              "flex items-center justify-between text-xs py-2 px-3 rounded-xl cursor-pointer font-medium transition-colors",
              language === lang.code ? "bg-accent font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </span>
            {language === lang.code && <Check className="h-3.5 w-3.5 text-brand-blue" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
