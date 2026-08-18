import { z } from "zod";

export const GetCatalogBooksSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(["title-asc", "title-desc", "newest", "rating"]).default("newest"),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(12),
});

export const BookIdParamSchema = z.string().min(1, "Book ID is required");

export type GetCatalogBooksInput = z.input<typeof GetCatalogBooksSchema>;
export type GetCatalogBooksOutput = z.output<typeof GetCatalogBooksSchema>;
