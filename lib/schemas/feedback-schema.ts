import { z } from "zod";

/**
 * Zod validation schema for submitting book feedback/review.
 * Enforces valid loan ID, rating between 1 and 5 stars, and optional comment length limit.
 */
export const SubmitFeedbackSchema = z.object({
  loanId: z.string().min(1, "Loan ID is required"),
  rating: z
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating cannot exceed 5 stars"),
  comment: z
    .string()
    .max(1000, "Review comment cannot exceed 1000 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : null)),
});

export type SubmitFeedbackInput = z.infer<typeof SubmitFeedbackSchema>;

/**
 * Zod validation schema for admin moderation actions (publishing or hiding feedback).
 */
export const ModerateFeedbackSchema = z.object({
  feedbackId: z.string().min(1, "Feedback ID is required"),
  isModerated: z.boolean(),
});

export type ModerateFeedbackInput = z.infer<typeof ModerateFeedbackSchema>;

/**
 * Zod validation schema for deleting a feedback entry by admin.
 */
export const DeleteFeedbackSchema = z.object({
  feedbackId: z.string().min(1, "Feedback ID is required"),
});

export type DeleteFeedbackInput = z.infer<typeof DeleteFeedbackSchema>;

/**
 * Zod validation schema for querying feedback in admin moderation panel.
 */
export const AdminFeedbackQuerySchema = z.object({
  status: z.enum(["all", "published", "moderated"]).default("all"),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(20),
});

export type AdminFeedbackQueryInput = z.infer<typeof AdminFeedbackQuerySchema>;
