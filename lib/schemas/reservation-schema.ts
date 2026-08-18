import { z } from "zod";

export const CreateReservationSchema = z.object({
  bookId: z.string().min(1, "Book ID is required"),
});

export const CancelReservationSchema = z.object({
  reservationId: z.string().min(1, "Reservation ID is required"),
});

export type CreateReservationInput = z.infer<typeof CreateReservationSchema>;
export type CancelReservationInput = z.infer<typeof CancelReservationSchema>;
