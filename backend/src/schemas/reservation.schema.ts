import { z } from "zod";

export const createReservationSchema = z.object({
  bookId: z.string().min(1, "Book ID is required"),
  copyId: z.string().optional(),
  holdDays: z.number().int().min(1, "Hold duration must be at least 1 day").max(7, "Hold duration cannot exceed 7 days").default(2),
  holdUntilDate: z.string().optional(),
  expectedVersion: z.number().int().nonnegative().optional(),
  idempotencyKey: z.string().min(1).max(128).optional(),
});

export const cancelReservationSchema = z.object({
  reservationId: z.string().min(1, "Reservation ID is required"),
  expectedVersion: z.number().int().nonnegative().optional(),
  idempotencyKey: z.string().min(1).max(128).optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type CancelReservationInput = z.infer<typeof cancelReservationSchema>;
