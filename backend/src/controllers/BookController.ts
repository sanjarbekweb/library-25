import { Request, Response, NextFunction } from 'express';
import { BookService } from '../services/BookService';
import { createBookSchema, getBooksQuerySchema } from '../schemas/book.schema';

const bookService = new BookService();

export class BookController {
  async getBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getBooksQuerySchema.parse(req.query);
      const result = await bookService.getBooks(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getBookById(req: Request, res: Response, next: NextFunction) {
    try {
      const book = await bookService.getBookById(req.params.id as string);
      res.json({ data: book });
    } catch (error) {
      next(error);
    }
  }

  async createBook(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createBookSchema.parse(req.body);
      const book = await bookService.createBook(data);
      res.status(201).json({ data: book });
    } catch (error) {
      next(error);
    }
  }

  async addCopy(req: Request, res: Response, next: NextFunction) {
    try {
      const copy = await bookService.addCopy(req.params.id as string, req.body);
      res.status(201).json({ data: copy, message: "Copy added successfully" });
    } catch (error) {
      next(error);
    }
  }
}
