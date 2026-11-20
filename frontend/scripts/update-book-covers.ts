import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { syncAllBooksToSearchIndex } from "../lib/search/sync";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const COVER_IMAGE_URLS = [
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixid=M3w4MjcwNjd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXJ8ZW58MHx8fHwxNzg3MTA5NTc3fDA&ixlib=rb-4.1.0&w=266&h=400&fit=max&q=80",
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixid=M3w4MjcwNjd8MHwxfHNlYXJjaHwyfHxib29rJTIwY292ZXJ8ZW58MHx8fHwxNzg3MTA5NTc3fDA&ixlib=rb-4.1.0&w=266&h=400&fit=max&q=80",
  "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?ixid=M3w4MjcwNjd8MHwxfHNlYXJjaHwzfHxib29rJTIwY292ZXJ8ZW58MHx8fHwxNzg3MTA5NTc3fDA&ixlib=rb-4.1.0&w=266&h=400&fit=max&q=80",
  "https://images.unsplash.com/photo-1641154748135-8032a61a3f80?ixid=M3w4MjcwNjd8MHwxfHNlYXJjaHw0fHxib29rJTIwY292ZXJ8ZW58MHx8fHwxNzg3MTA5NTc3fDA&ixlib=rb-4.1.0&w=266&h=400&fit=max&q=80",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixid=M3w4MjcwNjd8MHwxfHNlYXJjaHw1fHxib29rJTIwY292ZXJ8ZW58MHx8fHwxNzg3MTA5NTc3fDA&ixlib=rb-4.1.0&w=266&h=400&fit=max&q=80",
  "https://images.unsplash.com/photo-1629992101753-56d196c8aabb?ixid=M3w4MjcwNjd8MHwxfHNlYXJjaHw6fHxib29rJTIwY292ZXJ8ZW58MHx8fHwxNzg3MTA5NTc3fDA&ixlib=rb-4.1.0&w=266&h=400&fit=max&q=80",
  "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixid=M3w4MjcwNjd8MHwxfHNlYXJjaHw3fHxib29rJTIwY292ZXJ8ZW58MHx8fHwxNzg3MTA5NTc3fDA&ixlib=rb-4.1.0&w=266&h=400&fit=max&q=80",
  "https://images.unsplash.com/photo-1528459105426-b9548367069b?ixid=M3w4MjcwNjd8MHwxfHNlYXJjaHw8fHxib29rJTIwY292ZXJ8ZW58MHx8fHwxNzg3MTA5NTc3fDA&ixlib=rb-4.1.0&w=266&h=400&fit=max&q=80",
  "https://images.unsplash.com/photo-1537495329792-41ae41ad3bf0?ixid=M3w4MjcwNjd8MHwxfHNlYXJjaHw5fHxib29rJTIwY292ZXJ8ZW58MHx8fHwxNzg3MTA5NTc3fDA&ixlib=rb-4.1.0&w=266&h=400&fit=max&q=80",
  "https://images.unsplash.com/photo-1519764340700-3db40311f21e?ixid=M3w4MjcwNjd8MHwxfHNlYXJjaHwxMHx8Ym9vayUyMGNvdmVyfGVufDB8fHx8MTc4NzEwOTU3N3ww&ixlib=rb-4.1.0&w=266&h=400&fit=max&q=80",
  "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?ixid=M3w4MjcwNjd8MHwxfHNlYXJjaHwxMXx8Ym9vayUyMGNvdmVyfGVufDB8fHx8MTc4NzEwOTU3N3ww&ixlib=rb-4.1.0&w=266&h=400&fit=max&q=80",
  "https://images.unsplash.com/photo-1633477189729-9290b3261d0a?ixid=M3w4MjcwNjd8MHwxfHNlYXJjaHwxMnx8Ym9vayUyMGNvdmVyfGVufDB8fHx8MTc4NzEwOTU3N3ww&ixlib=rb-4.1.0&w=266&h=400&fit=max&q=80",
  "https://images.unsplash.com/photo-1705837861201-dd000d929a31?ixid=M3w4MjcwNjd8MHwxfHNlYXJjaHwxM3x8Ym9vayUyMGNvdmVyfGVufDB8fHx8MTc4NzEwOTU3N3ww&ixlib=rb-4.1.0&w=266&h=400&fit=max&q=80",
  "https://images.unsplash.com/photo-1521123845560-14093637aa7d?ixid=M3w4MjcwNjd8MHwxfHNlYXJjaHwxNHx8Ym9vayUyMGNvdmVyfGVufDB8fHx8MTc4NzEwOTU3N3ww&ixlib=rb-4.1.0&w=266&h=400&fit=max&q=80",
];

async function main() {
  console.log("Updating all book cover images with provided Unsplash URLs randomly...");
  const books = await prisma.book.findMany({ select: { id: true } });

  let updatedCount = 0;
  for (let i = 0; i < books.length; i++) {
    const randomUrl = COVER_IMAGE_URLS[Math.floor(Math.random() * COVER_IMAGE_URLS.length)];
    await prisma.book.update({
      where: { id: books[i].id },
      data: { coverImageUrl: randomUrl },
    });
    updatedCount++;
  }

  console.log(`Successfully updated ${updatedCount} books with new cover image URLs.`);

  console.log("Syncing search index...");
  await syncAllBooksToSearchIndex().catch((err) => {
    console.warn("Search index sync warning (ignorable if offline):", err);
  });

  console.log("Done!");
}

main()
  .catch((e) => {
    console.error("Error updating book covers:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
