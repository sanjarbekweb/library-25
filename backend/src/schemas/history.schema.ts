import { z } from "zod";
import { HistoryAction } from "@prisma/client";

export const copyHistoryQuerySchema = z.object({
  copyId: z.string().min(1, "Copy ID is required"),
});

export const barcodeLookupSchema = z.object({
  barcode: z.string().min(1, "Barcode is required").trim(),
});

export const auditLogFilterSchema = z.object({
  copyId: z.string().optional(),
  actorId: z.string().optional(),
  action: z.nativeEnum(HistoryAction).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type CopyHistoryQueryInput = z.infer<typeof copyHistoryQuerySchema>;
export type BarcodeLookupInput = z.infer<typeof barcodeLookupSchema>;
export type AuditLogFilterInput = z.infer<typeof auditLogFilterSchema>;
