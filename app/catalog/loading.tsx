import { AppShellLayout } from "@/components/shared/app-shell-layout";
import { BookbaseCatalogSkeleton } from "@/components/modules/catalog/catalog-skeleton";

export default function CatalogLoading() {
  return (
    <AppShellLayout>
      <BookbaseCatalogSkeleton />
    </AppShellLayout>
  );
}
