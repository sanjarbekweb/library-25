import { z } from "zod";

export const CreateReservationSchema = z.object({
  bookId: z.string().min(1, "Book ID is required"),
  holdDays: z.number().int().min(1, "Hold duration must be at least 1 day").max(7, "Hold duration cannot exceed 7 days").optional(),
  holdUntilDate: z.string().optional(),
});

export const CancelReservationSchema = z.object({
  reservationId: z.string().min(1, "Reservation ID is required"),
});

export type CreateReservationInput = z.infer<typeof CreateReservationSchema>;
export type CancelReservationInput = z.infer<typeof CancelReservationSchema>;
