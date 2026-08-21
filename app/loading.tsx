import { AppShellLayout } from "@/components/shared/app-shell-layout";
import {
  BookbaseCatalogSkeleton,
  FeaturedBookPanelSkeleton,
} from "@/components/modules/catalog/catalog-skeleton";

export default function RootLoading() {
  return (
    <AppShellLayout rightPanel={<FeaturedBookPanelSkeleton />}>
      <BookbaseCatalogSkeleton />
    </AppShellLayout>
  );
}
