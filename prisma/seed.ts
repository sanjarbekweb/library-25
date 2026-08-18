import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding ShelfSync database...\n");

  // ============================================
  // Users
  // ============================================
  const admin = await prisma.user.upsert({
    where: { clerkId: "clerk_admin_001" },
    update: {},
    create: {
      clerkId: "clerk_admin_001",
      email: "admin@shelfsync.school",
      firstName: "Sarah",
      lastName: "Martinez",
      role: "ADMIN",
    },
  });

  const assistant1 = await prisma.user.upsert({
    where: { clerkId: "clerk_assistant_001" },
    update: {},
    create: {
      clerkId: "clerk_assistant_001",
      email: "james.wilson@shelfsync.school",
      firstName: "James",
      lastName: "Wilson",
      role: "ASSISTANT",
    },
  });

  const assistant2 = await prisma.user.upsert({
    where: { clerkId: "clerk_assistant_002" },
    update: {},
    create: {
      clerkId: "clerk_assistant_002",
      email: "maria.chen@shelfsync.school",
      firstName: "Maria",
      lastName: "Chen",
      role: "ASSISTANT",
    },
  });

  const student1 = await prisma.user.upsert({
    where: { clerkId: "clerk_student_001" },
    update: {},
    create: {
      clerkId: "clerk_student_001",
      email: "alex.johnson@student.school",
      firstName: "Alex",
      lastName: "Johnson",
      role: "STUDENT",
    },
  });

  const student2 = await prisma.user.upsert({
    where: { clerkId: "clerk_student_002" },
    update: {},
    create: {
      clerkId: "clerk_student_002",
      email: "emma.davis@student.school",
      firstName: "Emma",
      lastName: "Davis",
      role: "STUDENT",
    },
  });

  const student3 = await prisma.user.upsert({
    where: { clerkId: "clerk_student_003" },
    update: {},
    create: {
      clerkId: "clerk_student_003",
      email: "noah.patel@student.school",
      firstName: "Noah",
      lastName: "Patel",
      role: "STUDENT",
    },
  });

  const student4 = await prisma.user.upsert({
    where: { clerkId: "clerk_student_004" },
    update: {},
    create: {
      clerkId: "clerk_student_004",
      email: "olivia.kim@student.school",
      firstName: "Olivia",
      lastName: "Kim",
      role: "STUDENT",
    },
  });

  const student5 = await prisma.user.upsert({
    where: { clerkId: "clerk_student_005" },
    update: {},
    create: {
      clerkId: "clerk_student_005",
      email: "liam.brown@student.school",
      firstName: "Liam",
      lastName: "Brown",
      role: "STUDENT",
    },
  });

  console.log(
    `✅ Users seeded: 1 admin, 2 assistants, 5 students`
  );

  // ============================================
  // Books
  // ============================================
  const books = await Promise.all([
    prisma.book.upsert({
      where: { isbn: "978-0-06-112008-4" },
      update: { coverImageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600&h=800&fit=max&q=80" },
      create: {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        isbn: "978-0-06-112008-4",
        category: "Fiction",
        description:
          "A classic novel about racial injustice in the American South, seen through the eyes of young Scout Finch.",
        publicationYear: 1960,
        coverImageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600&h=800&fit=max&q=80",
      },
    }),
    prisma.book.upsert({
      where: { isbn: "978-0-452-28423-4" },
      update: { coverImageUrl: "https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?w=600&h=800&fit=max&q=80" },
      create: {
        title: "1984",
        author: "George Orwell",
        isbn: "978-0-452-28423-4",
        category: "Science Fiction",
        description:
          "A dystopian novel set in a totalitarian society under constant surveillance, exploring themes of truth and freedom.",
        publicationYear: 1949,
        coverImageUrl: "https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?w=600&h=800&fit=max&q=80",
      },
    }),
    prisma.book.upsert({
      where: { isbn: "978-0-7432-7356-5" },
      update: { coverImageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=800&fit=max&q=80" },
      create: {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "978-0-7432-7356-5",
        category: "Fiction",
        description:
          "A tale of wealth, love, and the American Dream set in the Jazz Age of 1920s New York.",
        publicationYear: 1925,
        coverImageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=800&fit=max&q=80",
      },
    }),
    prisma.book.upsert({
      where: { isbn: "978-0-316-76948-0" },
      update: { coverImageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=800&fit=max&q=80" },
      create: {
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        isbn: "978-0-316-76948-0",
        category: "Fiction",
        description:
          "The story of teenager Holden Caulfield navigating identity, belonging, and growing up in 1950s New York.",
        publicationYear: 1951,
        coverImageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=800&fit=max&q=80",
      },
    }),
    prisma.book.upsert({
      where: { isbn: "978-0-06-093546-7" },
      update: { coverImageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&h=800&fit=max&q=80" },
      create: {
        title: "To Kill a Kingdom",
        author: "Alexandra Christo",
        isbn: "978-0-06-093546-7",
        category: "Fantasy",
        description:
          "A dark fantasy retelling of The Little Mermaid about a siren princess and a prince who hunts her kind.",
        publicationYear: 2018,
        coverImageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&h=800&fit=max&q=80",
      },
    }),
    prisma.book.upsert({
      where: { isbn: "978-0-14-028329-7" },
      update: { coverImageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&h=800&fit=max&q=80" },
      create: {
        title: "The Odyssey",
        author: "Homer",
        isbn: "978-0-14-028329-7",
        category: "Classics",
        description:
          "The epic ancient Greek poem following Odysseus on his ten-year journey home after the Trojan War.",
        publicationYear: -800,
        coverImageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&h=800&fit=max&q=80",
      },
    }),
    prisma.book.upsert({
      where: { isbn: "978-0-06-231609-7" },
      update: { coverImageUrl: "https://images.unsplash.com/photo-1604866830893-c13cafa515d5?w=600&h=800&fit=max&q=80" },
      create: {
        title: "Sapiens: A Brief History of Humankind",
        author: "Yuval Noah Harari",
        isbn: "978-0-06-231609-7",
        category: "Non-Fiction",
        description:
          "An exploration of the history of humanity from the Stone Age to the present, examining the forces that shaped our world.",
        publicationYear: 2011,
        coverImageUrl: "https://images.unsplash.com/photo-1604866830893-c13cafa515d5?w=600&h=800&fit=max&q=80",
      },
    }),
    prisma.book.upsert({
      where: { isbn: "978-0-439-02348-1" },
      update: { coverImageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=800&fit=max&q=80" },
      create: {
        title: "The Hunger Games",
        author: "Suzanne Collins",
        isbn: "978-0-439-02348-1",
        category: "Young Adult",
        description:
          "In a dystopian future, Katniss Everdeen must fight to survive in a televised death match called the Hunger Games.",
        publicationYear: 2008,
        coverImageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=800&fit=max&q=80",
      },
    }),
    prisma.book.upsert({
      where: { isbn: "978-0-545-01022-1" },
      update: { coverImageUrl: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=600&h=800&fit=max&q=80" },
      create: {
        title: "Harry Potter and the Deathly Hallows",
        author: "J.K. Rowling",
        isbn: "978-0-545-01022-1",
        category: "Fantasy",
        description:
          "The final installment in the Harry Potter series, where Harry faces Voldemort in a climactic battle for the wizarding world.",
        publicationYear: 2007,
        coverImageUrl: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=600&h=800&fit=max&q=80",
      },
    }),
    prisma.book.upsert({
      where: { isbn: "978-0-13-468599-1" },
      update: { coverImageUrl: "https://images.unsplash.com/photo-1513185041617-8ab03f83d6c5?w=600&h=800&fit=max&q=80" },
      create: {
        title: "The Pragmatic Programmer",
        author: "David Thomas & Andrew Hunt",
        isbn: "978-0-13-468599-1",
        category: "Technology",
        description:
          "A guide to becoming a better programmer through practical tips, techniques, and career advice.",
        publicationYear: 2019,
      },
    }),
  ]);

  console.log(`✅ Books seeded: ${books.length} titles`);

  // ============================================
  // Book Copies (2-3 copies per book)
  // ============================================
  const copyData: {
    bookIndex: number;
    barcode: string;
    condition: "MINT" | "GOOD" | "FAIR" | "DAMAGED";
    status: "AVAILABLE" | "RESERVED" | "BORROWED" | "MAINTENANCE" | "LOST";
  }[] = [
    // To Kill a Mockingbird — 3 copies
    { bookIndex: 0, barcode: "SS-TKAM-001", condition: "GOOD", status: "AVAILABLE" },
    { bookIndex: 0, barcode: "SS-TKAM-002", condition: "FAIR", status: "AVAILABLE" },
    { bookIndex: 0, barcode: "SS-TKAM-003", condition: "MINT", status: "AVAILABLE" },
    // 1984 — 2 copies
    { bookIndex: 1, barcode: "SS-1984-001", condition: "GOOD", status: "AVAILABLE" },
    { bookIndex: 1, barcode: "SS-1984-002", condition: "MINT", status: "AVAILABLE" },
    // The Great Gatsby — 2 copies
    { bookIndex: 2, barcode: "SS-TGG-001", condition: "GOOD", status: "AVAILABLE" },
    { bookIndex: 2, barcode: "SS-TGG-002", condition: "FAIR", status: "AVAILABLE" },
    // The Catcher in the Rye — 2 copies
    { bookIndex: 3, barcode: "SS-CITR-001", condition: "MINT", status: "AVAILABLE" },
    { bookIndex: 3, barcode: "SS-CITR-002", condition: "GOOD", status: "AVAILABLE" },
    // To Kill a Kingdom — 2 copies
    { bookIndex: 4, barcode: "SS-TKAK-001", condition: "MINT", status: "AVAILABLE" },
    { bookIndex: 4, barcode: "SS-TKAK-002", condition: "GOOD", status: "AVAILABLE" },
    // The Odyssey — 3 copies
    { bookIndex: 5, barcode: "SS-ODSY-001", condition: "FAIR", status: "AVAILABLE" },
    { bookIndex: 5, barcode: "SS-ODSY-002", condition: "GOOD", status: "AVAILABLE" },
    { bookIndex: 5, barcode: "SS-ODSY-003", condition: "MINT", status: "AVAILABLE" },
    // Sapiens — 2 copies
    { bookIndex: 6, barcode: "SS-SAPN-001", condition: "MINT", status: "AVAILABLE" },
    { bookIndex: 6, barcode: "SS-SAPN-002", condition: "GOOD", status: "AVAILABLE" },
    // The Hunger Games — 3 copies
    { bookIndex: 7, barcode: "SS-THG-001", condition: "GOOD", status: "AVAILABLE" },
    { bookIndex: 7, barcode: "SS-THG-002", condition: "MINT", status: "AVAILABLE" },
    { bookIndex: 7, barcode: "SS-THG-003", condition: "FAIR", status: "AVAILABLE" },
    // Harry Potter — 3 copies
    { bookIndex: 8, barcode: "SS-HPDH-001", condition: "MINT", status: "AVAILABLE" },
    { bookIndex: 8, barcode: "SS-HPDH-002", condition: "GOOD", status: "AVAILABLE" },
    { bookIndex: 8, barcode: "SS-HPDH-003", condition: "GOOD", status: "AVAILABLE" },
    // The Pragmatic Programmer — 2 copies
    { bookIndex: 9, barcode: "SS-TPP-001", condition: "MINT", status: "AVAILABLE" },
    { bookIndex: 9, barcode: "SS-TPP-002", condition: "GOOD", status: "AVAILABLE" },
  ];

  const copies = await Promise.all(
    copyData.map((copy) =>
      prisma.bookCopy.upsert({
        where: { barcode: copy.barcode },
        update: {},
        create: {
          bookId: books[copy.bookIndex].id,
          barcode: copy.barcode,
          condition: copy.condition,
          status: copy.status,
        },
      })
    )
  );

  console.log(`✅ Book copies seeded: ${copies.length} physical copies`);

  // ============================================
  // BookHistory entries (initial creation logs)
  // ============================================
  for (const copy of copies) {
    await prisma.bookHistory.create({
      data: {
        bookCopyId: copy.id,
        action: "CREATED",
        actorId: admin.id,
        newState: "AVAILABLE",
        notes: "Initial catalog entry during seed.",
      },
    });
  }

  console.log(
    `✅ BookHistory seeded: ${copies.length} creation audit records`
  );

  // ============================================
  // Summary
  // ============================================
  console.log("\n🎉 Seed complete!");
  console.log(`   Users: 8 (1 admin, 2 assistants, 5 students)`);
  console.log(`   Books: ${books.length} titles`);
  console.log(`   Copies: ${copies.length} physical copies`);
  console.log(`   History: ${copies.length} audit records`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
