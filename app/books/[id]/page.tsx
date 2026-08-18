import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getBookDetails } from "@/lib/services/book-service";
import { getStudentReservationForBook } from "@/lib/services/reservation-service";
import { getEligibleLoanForBookFeedback } from "@/lib/services/feedback-service";
import { BookDetailView } from "@/components/modules/books/book-detail-view";
import { Navbar } from "@/components/shared/navbar";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookDetails(id);

  if (!book) {
    return {
      title: "Book Not Found",
      description: "The requested library book could not be found in the catalog.",
    };
  }

  const title = `${book.title} by ${book.author}`;
  const description =
    book.description ||
    `Explore ${book.title} by ${book.author} in the ShelfSync School Library Catalog. Check real-time copy availability, publication details, and verified student reviews.`;

  return {
    title,
    description,
    openGraph: {
      title: `${book.title} | ShelfSync Library`,
      description,
      type: "book",
      authors: [book.author],
      isbn: book.isbn || undefined,
      images: book.coverImageUrl
        ? [{ url: book.coverImageUrl, alt: book.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${book.title} | ShelfSync Library`,
      description,
      images: book.coverImageUrl ? [book.coverImageUrl] : [],
    },
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { userId } = await auth();

  const [book, existingReservation, eligibleLoan] = await Promise.all([
    getBookDetails(id),
    userId ? getStudentReservationForBook(id, userId) : Promise.resolve(null),
    userId ? getEligibleLoanForBookFeedback(id, userId) : Promise.resolve(null),
  ]);

  if (!book) {
    notFound();
  }

  // Schema.org Book JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: {
      "@type": "Person",
      name: book.author,
    },
    isbn: book.isbn || undefined,
    genre: book.category,
    datePublished: book.publicationYear ? String(book.publicationYear) : undefined,
    image: book.coverImageUrl || undefined,
    description: book.description || undefined,
    ...(book.averageRating && book.totalReviews > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: book.averageRating,
            reviewCount: book.totalReviews,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      availability:
        book.copyBreakdown.available > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      price: "0.00",
      priceCurrency: "USD",
      itemCondition: "https://schema.org/UsedCondition",
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <BookDetailView
          book={book}
          isSignedIn={!!userId}
          existingReservationId={existingReservation?.id}
          eligibleLoanIdForFeedback={eligibleLoan?.loanId}
        />
      </main>
    </div>
  );
}
