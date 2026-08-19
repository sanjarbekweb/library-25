import "dotenv/config";
import { PrismaClient, CopyCondition, CopyStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const BOOKS_DATA = [
  {
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    category: "Computer Science",
    publicationYear: 2008,
    description:
      "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
    copiesCount: 5,
  },
  {
    title: "Design Patterns: Elements of Reusable Object-Oriented Software",
    author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    isbn: "978-0201633610",
    category: "Computer Science",
    publicationYear: 1994,
    description:
      "Four top-class software designers present a catalog of simple and succinct solutions to commonly occurring design problems. These 23 patterns allow designers to create more flexible, elegant, and reusable designs.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
    copiesCount: 4,
  },
  {
    title: "The Pragmatic Programmer: Your Journey to Mastery",
    author: "David Thomas, Andrew Hunt",
    isbn: "978-0135957059",
    category: "Computer Science",
    publicationYear: 2019,
    description:
      "Illustrates the best approaches and major pitfalls of many different aspects of software development. Whether you're a new coder or an experienced programmer, you'll come away with fresh ideas.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    copiesCount: 5,
  },
  {
    title: "Introduction to Algorithms (4th Edition)",
    author: "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
    isbn: "978-0262046305",
    category: "Computer Science",
    publicationYear: 2022,
    description:
      "The leading textbook on algorithms worldwide. Covers a wide range of algorithms in depth, yet makes their design and analysis accessible to all levels of readers.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80",
    copiesCount: 6,
  },
  {
    title: "Structure and Interpretation of Computer Programs",
    author: "Harold Abelson, Gerald Jay Sussman",
    isbn: "978-0262510875",
    category: "Computer Science",
    publicationYear: 1996,
    description:
      "Teaches computer programming as a way to structure thought and manage complexity. A foundational work for computer science education.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80",
    copiesCount: 4,
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "978-0061120084",
    category: "Literature & Fiction",
    publicationYear: 1960,
    description:
      "Set in the small Southern town of Maycomb, Alabama, during the Depression, this Pulitzer Prize-winning masterpiece tells the story of lawyer Atticus Finch and his children, Scout and Jem.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    copiesCount: 5,
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "978-0451524935",
    category: "Literature & Fiction",
    publicationYear: 1949,
    description:
      "Written in 1948, 1984 is George Orwell's terrifying vision of a totalitarian future where everything and everyone is under the surveillance of Big Brother.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80",
    copiesCount: 6,
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0743273565",
    category: "Literature & Fiction",
    publicationYear: 1925,
    description:
      "The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan. A portrait of the Jazz Age in all its decadence and excess.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
    copiesCount: 4,
  },
  {
    title: "Crime and Punishment",
    author: "Fyodor Dostoevsky",
    isbn: "978-0143058441",
    category: "Literature & Fiction",
    publicationYear: 1866,
    description:
      "Raskolnikov, a destitute and desperate former student, wanders through the slums of St Petersburg and commits a random murder without remorse or regret.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80",
    copiesCount: 5,
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "978-0141439518",
    category: "Literature & Fiction",
    publicationYear: 1813,
    description:
      "Follows the turbulent relationship between Elizabeth Bennet, the daughter of a country gentleman, and Fitzwilliam Darcy, a rich aristocratic landowner.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop&q=80",
    copiesCount: 4,
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    isbn: "978-0062316097",
    category: "History & Philosophy",
    publicationYear: 2014,
    description:
      "Explores how Homo sapiens came to dominate the Earth, examining the Cognitive, Agricultural, and Scientific Revolutions that shaped human history.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80",
    copiesCount: 5,
  },
  {
    title: "Guns, Germs, and Steel: The Fates of Human Societies",
    author: "Jared Diamond",
    isbn: "978-0393317558",
    category: "History & Philosophy",
    publicationYear: 1997,
    description:
      "Argues that environmental and geographical factors, rather than genetic differences, shaped the modern world's disparities in power and technology.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=600&auto=format&fit=crop&q=80",
    copiesCount: 4,
  },
  {
    title: "Meditations",
    author: "Marcus Aurelius",
    isbn: "978-0812968255",
    category: "History & Philosophy",
    publicationYear: 180,
    description:
      "Private reflections of the Roman Emperor Marcus Aurelius on Stoic philosophy, self-discipline, duty, and human nature.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=80",
    copiesCount: 5,
  },
  {
    title: "The Silk Roads: A New History of the World",
    author: "Peter Frankopan",
    isbn: "978-1101912379",
    category: "History & Philosophy",
    publicationYear: 2015,
    description:
      "A major reassessment of world history, focusing on the central role played by the Silk Roads connecting East and West.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80",
    copiesCount: 4,
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    isbn: "978-0553380163",
    category: "Physics & Science",
    publicationYear: 1988,
    description:
      "Explains complex concepts in cosmology, quantum mechanics, black holes, and the Big Bang for non-specialist readers.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    copiesCount: 5,
  },
  {
    title: "The Gene: An Intimate History",
    author: "Siddhartha Mukherjee",
    isbn: "978-1476733500",
    category: "Physics & Science",
    publicationYear: 2016,
    description:
      "The story of the quest to decipher the master-code of human biology and heredity, weaving history, science, and personal experience.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80",
    copiesCount: 4,
  },
  {
    title: "Astrophysics for People in a Hurry",
    author: "Neil deGrasse Tyson",
    isbn: "978-0393609394",
    category: "Physics & Science",
    publicationYear: 2017,
    description:
      "A quick, witty introduction to fundamental cosmic concepts, from black holes to quantum mechanics and dark matter.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80",
    copiesCount: 5,
  },
  {
    title: "Calculus: Early Transcendentals (9th Edition)",
    author: "James Stewart",
    isbn: "978-1337613927",
    category: "Mathematics",
    publicationYear: 2020,
    description:
      "The world's leading calculus textbook, renowned for mathematical precision, clear explanations, and real-world application problems.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
    copiesCount: 6,
  },
  {
    title: "Linear Algebra Done Right (3rd Edition)",
    author: "Sheldon Axler",
    isbn: "978-3319110790",
    category: "Mathematics",
    publicationYear: 2015,
    description:
      "A proof-based approach to linear algebra that focuses on vector spaces and linear maps, avoiding early determinant calculations.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80",
    copiesCount: 5,
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    isbn: "978-0374533557",
    category: "Self-Development",
    publicationYear: 2011,
    description:
      "Nobel laureate Daniel Kahneman explains the two systems that drive the way we think: System 1 (fast, emotional) and System 2 (slow, logical).",
    coverImageUrl:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80",
    copiesCount: 5,
  },
  {
    title: "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    author: "James Clear",
    isbn: "978-0735211292",
    category: "Self-Development",
    publicationYear: 2018,
    description:
      "A practical guide on how small changes can lead to remarkable results using concepts from biology, psychology, and neuroscience.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&auto=format&fit=crop&q=80",
    copiesCount: 6,
  },
  {
    title: "Deep Work: Rules for Focused Success in a Distracted World",
    author: "Cal Newport",
    isbn: "978-1455586691",
    category: "Self-Development",
    publicationYear: 2016,
    description:
      "Cal Newport demonstrates how mastering deep work skills enables individuals to quickly comprehend complicated information and produce better results in less time.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
    copiesCount: 5,
  },
  {
    title: "Principles: Life and Work",
    author: "Ray Dalio",
    isbn: "978-1501124020",
    category: "Business & Economics",
    publicationYear: 2017,
    description:
      "Ray Dalio shares the unconventional principles he developed, refined, and used over the past forty years to create unique results in both life and business.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
    copiesCount: 4,
  },
  {
    title: "Zero to One: Notes on Startups, or How to Build the Future",
    author: "Peter Thiel, Blake Masters",
    isbn: "978-0804139298",
    category: "Business & Economics",
    publicationYear: 2014,
    description:
      "Presents a unique approach to innovation: learning to ask the questions that lead you to find value in unexpected places.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80",
    copiesCount: 5,
  },
  {
    title: "The Intelligent Investor",
    author: "Benjamin Graham",
    isbn: "978-0060555665",
    category: "Business & Economics",
    publicationYear: 1949,
    description:
      "The classic text on value investing, providing time-tested strategies for protecting investors from substantial error and teaching long-term thinking.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80",
    copiesCount: 4,
  },
];

const CONDITIONS: CopyCondition[] = ["MINT", "GOOD", "MINT", "GOOD", "FAIR"];

async function main() {
  console.log("🚀 Starting database seeding for ShelfSync...");

  let totalBooksCreated = 0;
  let totalCopiesCreated = 0;

  for (let i = 0; i < BOOKS_DATA.length; i++) {
    const item = BOOKS_DATA[i];
    const bookIndexStr = String(i + 1).padStart(2, "0");

    // Upsert book by ISBN
    const book = await prisma.book.upsert({
      where: { isbn: item.isbn },
      update: {
        title: item.title,
        author: item.author,
        category: item.category,
        description: item.description,
        coverImageUrl: item.coverImageUrl,
        publicationYear: item.publicationYear,
      },
      create: {
        title: item.title,
        author: item.author,
        isbn: item.isbn,
        category: item.category,
        description: item.description,
        coverImageUrl: item.coverImageUrl,
        publicationYear: item.publicationYear,
      },
    });

    totalBooksCreated++;

    // Create physical copies for the book if not already existing
    const existingCopiesCount = await prisma.bookCopy.count({
      where: { bookId: book.id },
    });

    if (existingCopiesCount < item.copiesCount) {
      const copiesToCreate = item.copiesCount - existingCopiesCount;
      const copiesData = [];

      for (let c = 1; c <= copiesToCreate; c++) {
        const copyNum = existingCopiesCount + c;
        const copyNumStr = String(copyNum).padStart(2, "0");
        const barcode = `BK-${bookIndexStr}${item.isbn.slice(-4)}-${copyNumStr}`;
        const condition = CONDITIONS[(c - 1) % CONDITIONS.length];

        copiesData.push({
          bookId: book.id,
          barcode,
          condition,
          status: "AVAILABLE" as CopyStatus,
        });
      }

      await prisma.bookCopy.createMany({
        data: copiesData,
        skipDuplicates: true,
      });

      totalCopiesCreated += copiesToCreate;
    }

    console.log(
      `  [${bookIndexStr}/${BOOKS_DATA.length}] Seeded: "${book.title}" (${item.copiesCount} copies)`
    );
  }

  console.log(
    `\n✅ Database seeding completed successfully!`
  );
  console.log(`   📚 Total Books: ${totalBooksCreated}`);
  console.log(`   🏷️  Total Copies: ${totalCopiesCreated} newly created copies`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
