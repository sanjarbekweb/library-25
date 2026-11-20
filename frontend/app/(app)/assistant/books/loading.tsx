import { BookManagementSkeleton } from "@/components/modules/books/book-management-skeleton";

export default function AssistantBooksLoading() {
  return (
    <div className="max-w-7xl mx-auto">
      <BookManagementSkeleton />
    </div>
  );
}
