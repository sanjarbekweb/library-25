import { getManageableBooks } from "@/lib/services/book-management-service";
import { BookManagementConsole } from "@/components/modules/books/book-management-console";

export const metadata = {
  title: "Book Catalog Management | ShelfSync Assistant",
  description: "Register new book titles, update metadata, generate barcodes, and manage physical copies.",
};

export default async function ManageBooksPage() {
  const books = await getManageableBooks();

  return (
    <div className="space-y-6">
      <BookManagementConsole initialBooks={books} />
    </div>
  );
}
