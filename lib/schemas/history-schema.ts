import { z } from "zod";
import { HistoryAction } from "@prisma/client";

export const CopyHistoryQuerySchema = z.object({
  copyId: z.string().min(1, "Copy ID is required"),
});

export type CopyHistoryQueryInput = z.infer<typeof CopyHistoryQuerySchema>;

export const BarcodeLookupSchema = z.object({
  barcode: z.string().min(1, "Barcode is required").trim(),
});

export type BarcodeLookupInput = z.infer<typeof BarcodeLookupSchema>;

export const AuditLogFilterSchema = z.object({
  copyId: z.string().optional(),
  actorId: z.string().optional(),
  action: z.nativeEnum(HistoryAction).optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

export type AuditLogFilterInput = z.infer<typeof AuditLogFilterSchema>;
