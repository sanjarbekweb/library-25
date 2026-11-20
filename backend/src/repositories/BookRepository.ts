import { Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { CreateBookDto, GetBooksQuery } from '../schemas/book.schema';

export class BookRepository {
  async findAll(query: GetBooksQuery) {
    const { cursor, page, limit, search, category, sort } = query;
    
    const where: Prisma.BookWhereInput = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (category && category !== 'all') {
      where.category = category;
    }

    let orderBy: Prisma.BookOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'title-asc') orderBy = { title: 'asc' };
    if (sort === 'title-desc') orderBy = { title: 'desc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const skip = cursor ? 1 : (page - 1) * limit;

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        take: limit,
        skip,
        cursor: cursor ? { id: cursor } : undefined,
        where,
        orderBy,
      }),
      prisma.book.count({ where })
    ]);

    return { books, total, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return prisma.book.findUnique({
      where: { id },
      include: {
        copies: true,
      }
    });
  }

  async create(data: CreateBookDto) {
    const { initialCopyCount, initialCopyCondition, ...bookData } = data as any;
    return prisma.book.create({
      data: {
        ...bookData,
        copies: {
          create: Array.from({ length: initialCopyCount || 1 }).map(() => ({
            barcode: `BC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            condition: initialCopyCondition || 'MINT',
            status: 'AVAILABLE'
          }))
        }
      },
      include: { copies: true }
    });
  }

  async addCopy(bookId: string, data: any) {
    return prisma.bookCopy.create({
      data: {
        bookId,
        barcode: data.barcode || `BC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        condition: data.condition || 'MINT',
        status: 'AVAILABLE'
      }
    });
  }
}
