"use client";

import { Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { SearchHeader } from "@/components/modules/search/search-header";
import { IconButton } from "@/components/animate-ui/components/buttons/icon";
import { useLanguage } from "@/components/providers/language-provider";
import { useSidebar } from "@/components/providers/sidebar-provider";

interface AppHeaderProps {
  onOpenMobile?: () => void;
}

export function AppHeader({ onOpenMobile }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const sidebar = useSidebar();

  const handleOpenMobile = onOpenMobile || sidebar.toggleMobile;
  const isCatalogPage = pathname === "/catalog" || pathname === "/";

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/catalog");
    }
  };

  // On non-catalog pages, hide desktop header entirely (only render on mobile for drawer menu)
  if (!isCatalogPage) {
    return (
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border/80 bg-background/95 backdrop-blur-md px-4 md:hidden">
        <IconButton
          variant="ghost"
          size="sm"
          onClick={handleOpenMobile}
          className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent shrink-0 cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </IconButton>
      </header>
    );
  }

  // On catalog page, render global search bar
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-4 border-b border-border/80 bg-background/95 backdrop-blur-md px-4 sm:px-6">
      <div className="flex flex-1 items-center gap-3 max-w-2xl">
        {/* Mobile hamburger menu */}
        <IconButton
          variant="ghost"
          size="sm"
          onClick={handleOpenMobile}
          className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent md:hidden shrink-0 cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </IconButton>

        <div className="flex-1">
          <SearchHeader
            placeholder={t("searchPlaceholder")}
            onSearchSubmit={handleSearchSubmit}
            className="w-full max-w-xl"
          />
        </div>
      </div>
    </header>
  );
}
