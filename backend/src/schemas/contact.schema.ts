import { z } from "zod";

export const contactCategoryEnum = z.enum([
  "FEEDBACK",
  "FEATURE_REQUEST",
  "BUG_REPORT",
  "GENERAL_INQUIRY",
]);

export type ContactCategory = z.infer<typeof contactCategoryEnum>;

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
  emailOrHandle: z
    .string()
    .trim()
    .min(3, "Please provide an email or Telegram handle")
    .max(150, "Contact info cannot exceed 150 characters"),
  category: contactCategoryEnum.default("FEEDBACK"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters long")
    .max(2000, "Message cannot exceed 2000 characters"),
  honeypot: z.string().max(100).optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
