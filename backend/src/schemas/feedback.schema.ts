import { z } from "zod";

export const submitFeedbackSchema = z.object({
  bookId: z.string().min(1, "Book ID is required"),
  loanId: z.string().optional(),
  rating: z.number().int().min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars"),
  comment: z.string().max(1000, "Review comment cannot exceed 1000 characters").optional(),
});

export const moderateFeedbackSchema = z.object({
  feedbackId: z.string().min(1, "Feedback ID is required"),
  isModerated: z.boolean(),
});

export const adminFeedbackQuerySchema = z.object({
  status: z.string().optional().default("ALL").transform((val) => val.toUpperCase() as "ALL" | "MODERATED" | "PUBLISHED"),
  search: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;
export type ModerateFeedbackInput = z.infer<typeof moderateFeedbackSchema>;
export type AdminFeedbackQuery = z.infer<typeof adminFeedbackQuerySchema>;
