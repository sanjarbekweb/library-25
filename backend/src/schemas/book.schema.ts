import { z } from 'zod';

export const getBooksQuerySchema = z.object({
  cursor: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  sort: z.string().optional()
});

export const createBookSchema = z.object({
  title: z.string().min(1).max(200),
  author: z.string().min(1).max(200),
  isbn: z.string().optional(),
  category: z.string().min(1).max(100),
  description: z.string().optional(),
  coverImageUrl: z.string().url().optional(),
  publicationYear: z.number().int().optional()
});

export type GetBooksQuery = z.infer<typeof getBooksQuerySchema>;
export type CreateBookDto = z.infer<typeof createBookSchema>;
