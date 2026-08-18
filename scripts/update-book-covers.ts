import "dotenv/config";
import { prisma } from "../lib/prisma";

const imageCovers = [
  "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1604866830893-c13cafa515d5?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1513185041617-8ab03f83d6c5?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1517770413964-df8ca61194a6?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1510172951991-856a654063f9?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1591951425600-d09958978584?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1705721357357-ab87523248f7?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1576872381149-7847515ce5d8?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1608099269227-82de5da1e4a8?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1667312939934-60fc3bfa4ec0?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1526243741027-444d633d7365?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1546521343-4eb2c01aa44b?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1529590003495-b2646e2718bf?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=600&h=800&fit=max&q=80",
  "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=600&h=800&fit=max&q=80",
];

async function updateBookCovers() {
  console.log("Updating book covers in database...");
  const books = await prisma.book.findMany({
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${books.length} books in database.`);

  let updatedCount = 0;
  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const coverUrl = imageCovers[i % imageCovers.length];

    await prisma.book.update({
      where: { id: book.id },
      data: { coverImageUrl: coverUrl },
    });
    console.log(`Updated book [${book.title}] with cover: ${coverUrl}`);
    updatedCount++;
  }

  console.log(`Successfully updated ${updatedCount} books with Unsplash covers.`);
}

updateBookCovers()
  .catch((e) => {
    console.error("Error updating book covers:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
