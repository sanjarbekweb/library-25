import { getCatalogBooks, getCategories, getTopDemandBooks } from "@/lib/services/book-service";
import { syncCurrentAuthenticatedUser } from "@/lib/services/user-service";
import { BookbaseCatalogView } from "@/components/modules/catalog/bookbase-catalog-view";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "Discover Books & Library Catalog",
  description:
    "Explore physical book titles, live copy inventory availability, categories, and verified student reviews in the ShelfSync catalog.",
};

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const category = params.category || "all";
  const search = params.search || "";
  const sort = (params.sort || "newest") as
    | "title-asc"
    | "title-desc"
    | "newest"
    | "rating";

  const [, categories, catalogData, topDemandBooks] = await Promise.all([
    syncCurrentAuthenticatedUser(),
    getCategories(),
    getCatalogBooks({ category, search, sort, page, limit: 12 }),
    getTopDemandBooks(4),
  ]);

  const { books, total, totalPages } = catalogData;

  return (
    <BookbaseCatalogView
      recommendedBooks={topDemandBooks}
      categoryBooks={books}
      categories={categories}
      currentCategory={category}
      currentSearch={search}
      currentSort={sort}
      currentPage={page}
      totalPages={totalPages}
      totalCount={total}
    />
  );
}
