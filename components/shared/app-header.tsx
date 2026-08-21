"use client";

import { Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { SearchHeader } from "@/components/modules/search/search-header";
import { IconButton } from "@/components/animate-ui/components/buttons/icon";
import { useLanguage } from "@/components/providers/language-provider";

interface AppHeaderProps {
  onOpenMobile?: () => void;
}

export function AppHeader({ onOpenMobile }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  const isCatalogPage = pathname === "/catalog" || pathname === "/";

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/catalog");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-4 border-b border-border/80 bg-background/95 backdrop-blur-md px-4 sm:px-6">
      {/* Left: Mobile Menu Trigger + Global Pill Search (Catalog Page Only) */}
      <div className="flex flex-1 items-center gap-3 max-w-2xl">
        <IconButton
          variant="ghost"
          size="sm"
          onClick={onOpenMobile}
          className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent md:hidden shrink-0 cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </IconButton>

        {isCatalogPage ? (
          <div className="flex-1">
            <SearchHeader
              placeholder={t("searchPlaceholder")}
              onSearchSubmit={handleSearchSubmit}
              className="w-full max-w-xl"
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </header>
  );
}
