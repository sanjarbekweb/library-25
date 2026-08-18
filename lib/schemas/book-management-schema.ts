import { z } from "zod";

export const CopyConditionEnum = z.enum(["MINT", "GOOD", "FAIR", "DAMAGED"]);

export const CreateBookSchema = z.object({
  title: z
    .string()
    .min(1, "Book title is required")
    .max(255, "Title must not exceed 255 characters"),
  author: z
    .string()
    .min(1, "Author name is required")
    .max(255, "Author name must not exceed 255 characters"),
  isbn: z
    .string()
    .max(20, "ISBN must not exceed 20 characters")
    .optional()
    .or(z.literal("")),
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category must not exceed 100 characters"),
  description: z
    .string()
    .max(2000, "Description must not exceed 2000 characters")
    .optional()
    .or(z.literal("")),
  coverImageUrl: z
    .string()
    .url("Must be a valid image URL")
    .optional()
    .or(z.literal("")),
  publicationYear: z
    .number()
    .int()
    .min(1000)
    .max(new Date().getFullYear() + 1)
    .optional(),
  initialCopyCount: z
    .number()
    .int()
    .min(1, "At least 1 physical copy is required")
    .max(50, "Maximum 50 initial copies allowed")
    .default(1),
  initialCopyCondition: CopyConditionEnum.default("MINT"),
});

export const AddBookCopySchema = z.object({
  bookId: z.string().min(1, "Book ID is required"),
  barcode: z
    .string()
    .max(50, "Barcode must not exceed 50 characters")
    .optional()
    .or(z.literal("")),
  condition: CopyConditionEnum.default("MINT"),
});

export type CreateBookInput = z.infer<typeof CreateBookSchema>;
export type AddBookCopyInput = z.infer<typeof AddBookCopySchema>;
