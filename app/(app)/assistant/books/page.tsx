import { Suspense } from "react";
import { getManageableBooks } from "@/lib/services/book-management-service";
import { BookManagementConsole } from "@/components/modules/books/book-management-console";
import { Navbar } from "@/components/shared/navbar";

export const metadata = {
  title: "Book Catalog Management | ShelfSync Assistant",
  description: "Register new book titles, update metadata, generate barcodes, and manage physical copies.",
};

export default async function ManageBooksPage() {
  const books = await getManageableBooks();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <BookManagementConsole initialBooks={books} />
      </main>
    </div>
  );
}
