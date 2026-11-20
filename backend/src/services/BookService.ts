import { BookRepository } from '../repositories/BookRepository';
import { CreateBookDto, GetBooksQuery } from '../schemas/book.schema';
import { ApiError } from '../utils/ApiError';

export class BookService {
  private bookRepo = new BookRepository();

  async getBooks(query: GetBooksQuery) {
    const { books, total, totalPages } = await this.bookRepo.findAll(query);
    
    return {
      data: books,
      meta: {
        total,
        totalPages,
        page: query.page,
        limit: query.limit
      }
    };
  }

  async getBookById(id: string) {
    const book = await this.bookRepo.findById(id);
    if (!book) {
      throw new ApiError(404, 'Book not found');
    }
    return book;
  }

  async createBook(data: CreateBookDto) {
    return this.bookRepo.create(data);
  }

  async addCopy(bookId: string, data: any) {
    // We should parse data with schema here usually, or rely on controller
    const book = await this.bookRepo.findById(bookId);
    if (!book) throw new ApiError(404, 'Book not found');
    return this.bookRepo.addCopy(bookId, data);
  }
}
