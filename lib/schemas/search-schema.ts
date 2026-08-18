import { z } from "zod";

export const SearchQuerySchema = z.object({
  q: z.string().default(""),
  category: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export type SearchQueryInput = z.infer<typeof SearchQuerySchema>;
