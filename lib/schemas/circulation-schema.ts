import { z } from "zod";
import { CopyCondition, CopyStatus } from "@prisma/client";

export const CheckoutSchema = z.object({
  copyId: z.string().min(1, "Copy ID or Barcode is required"),
  studentId: z.string().min(1, "Student ID is required"),
  dueDays: z
    .number()
    .int()
    .min(1, "Due days must be at least 1")
    .max(90, "Due days cannot exceed 90")
    .default(14),
});

export const CheckinSchema = z.object({
  copyId: z.string().min(1, "Copy ID or Barcode is required"),
  condition: z.nativeEnum(CopyCondition).optional(),
  status: z.nativeEnum(CopyStatus).optional(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export const CirculationSearchSchema = z.object({
  query: z.string().trim().optional(),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
export type CheckinInput = z.infer<typeof CheckinSchema>;
export type CirculationSearchInput = z.infer<typeof CirculationSearchSchema>;
