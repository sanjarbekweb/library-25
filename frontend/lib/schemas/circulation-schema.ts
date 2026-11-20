import { z } from "zod";
import { CopyCondition, CopyStatus } from "@prisma/client";

export const CheckoutSchema = z.object({
  copyId: z.string().min(1, "Copy ID or Barcode is required"),
  studentId: z.string().min(1, "Student ID is required"),
  dueDays: z
    .number()
    .int()
    .min(1, "Due days must be at least 1")
    .max(30, "Due days cannot exceed 30")
    .default(14),
  expectedVersion: z.number().int().nonnegative().optional(),
  idempotencyKey: z.string().min(1).max(128).optional(),
});

export const CheckinSchema = z.object({
  copyId: z.string().min(1, "Copy ID or Barcode is required"),
  condition: z.nativeEnum(CopyCondition).optional(),
  status: z.nativeEnum(CopyStatus).optional(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  expectedVersion: z.number().int().nonnegative().optional(),
  idempotencyKey: z.string().min(1).max(128).optional(),
});

export const CirculationSearchSchema = z.object({
  query: z.string().trim().optional(),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
export type CheckinInput = z.infer<typeof CheckinSchema>;
export type CirculationSearchInput = z.infer<typeof CirculationSearchSchema>;
