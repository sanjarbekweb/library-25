import { AppShellLayout } from "@/components/shared/app-shell-layout";
import { BookbaseCatalogSkeleton } from "@/components/modules/catalog/catalog-skeleton";

export default function RootLoading() {
  return (
    <AppShellLayout>
      <BookbaseCatalogSkeleton />
    </AppShellLayout>
  );
}
