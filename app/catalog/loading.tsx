import { Navbar } from "@/components/shared/navbar";
import { CatalogSkeleton } from "@/components/modules/catalog/catalog-skeleton";

export default function CatalogLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <CatalogSkeleton count={12} />
      </main>
    </div>
  );
}
