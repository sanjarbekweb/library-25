import { z } from "zod";

export const CreateReservationSchema = z.object({
  bookId: z.string().min(1, "Book ID is required"),
  copyId: z.string().min(1, "Copy ID must be non-empty").optional(),
  holdDays: z
    .number()
    .int()
    .min(1, "Hold duration must be at least 1 day")
    .max(7, "Hold duration cannot exceed 7 days")
    .optional(),
  holdUntilDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must follow YYYY-MM-DD calendar format")
    .optional(),
  expectedVersion: z.number().int().nonnegative().optional(),
  idempotencyKey: z.string().min(1).max(128).optional(),
});

export const CancelReservationSchema = z.object({
  reservationId: z.string().min(1, "Reservation ID is required"),
  expectedVersion: z.number().int().nonnegative().optional(),
  idempotencyKey: z.string().min(1).max(128).optional(),
});

export type CreateReservationInput = z.infer<typeof CreateReservationSchema>;
export type CancelReservationInput = z.infer<typeof CancelReservationSchema>;
