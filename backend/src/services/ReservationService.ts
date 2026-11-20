import { ReservationRepository } from "../repositories/ReservationRepository";
import { CreateReservationInput, CancelReservationInput } from "../schemas/reservation.schema";
import { ApiError } from "../utils/ApiError";
import { User, UserRole } from "@prisma/client";

export class ReservationService {
  private repository: ReservationRepository;

  constructor() {
    this.repository = new ReservationRepository();
  }

  async createReservation(input: CreateReservationInput, actor: User) {
    if (!actor.isActive) {
      throw new ApiError(403, "Student account is suspended or inactive", "STUDENT_INACTIVE");
    }

    // Check if student already has a pending reservation for this book
    const existing = await this.repository.findActiveHoldForStudentAndBook(actor.id, input.bookId);
    if (existing) {
      throw new ApiError(409, "You already have an active pending reservation for this book", "RESERVATION_EXISTS");
    }

    // Find available copy
    const targetCopy = await this.repository.findAvailableCopy(input.bookId, input.copyId);
    if (!targetCopy) {
      throw new ApiError(409, "No physical copies of this book are currently available for reservation", "NO_COPIES_AVAILABLE");
    }

    // Calculate expiration instant
    const now = new Date();
    let expiresAt = new Date();
    if (input.holdUntilDate) {
      const customDate = new Date(input.holdUntilDate);
      const maxDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      if (customDate > maxDate) {
        expiresAt = maxDate;
      } else if (customDate < minDate) {
        expiresAt = minDate;
      } else {
        expiresAt = customDate;
      }
    } else if (input.holdDays) {
      const days = Math.min(Math.max(input.holdDays, 1), 7);
      expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    } else {
      expiresAt.setTime(now.getTime() + 48 * 60 * 60 * 1000);
    }

    try {
      const reservation = await this.repository.executeCreateReservation(targetCopy, actor, input, expiresAt);
      return reservation;
    } catch (err: any) {
      if (err.message === "RESERVATION_EXISTS") {
        throw new ApiError(409, "You already have an active pending reservation for this book", "RESERVATION_EXISTS");
      }
      if (err.message === "COPY_CONCURRENTLY_RESERVED") {
        throw new ApiError(409, "This book copy was concurrently claimed. Please refresh and select another copy.", "COPY_CONCURRENTLY_RESERVED");
      }
      throw err;
    }
  }

  async cancelReservation(input: CancelReservationInput, actor: User) {
    const reservation = await this.repository.findReservationWithCopy(input.reservationId);
    if (!reservation) {
      throw new ApiError(404, "Reservation record not found", "RESERVATION_NOT_FOUND");
    }

    // Check authorization: Student can only cancel their own reservation; Assistant/Admin can cancel any
    if (actor.role === UserRole.STUDENT && reservation.studentId !== actor.id) {
      throw new ApiError(403, "You are not authorized to cancel this reservation", "UNAUTHORIZED");
    }

    if (reservation.status !== "PENDING") {
      throw new ApiError(409, `Cannot cancel reservation with status ${reservation.status}`, "INVALID_STATE");
    }

    try {
      const result = await this.repository.executeCancelReservation(reservation, actor, input);
      return result;
    } catch (err: any) {
      if (err.message === "CONCURRENCY_CONFLICT") {
        throw new ApiError(409, "Reservation was concurrently updated, fulfilled, or cancelled", "CONCURRENCY_CONFLICT");
      }
      throw err;
    }
  }

  async getStudentReservations(studentId: string) {
    return this.repository.findStudentReservations(studentId);
  }

  async getReservationForBook(bookId: string, studentId: string) {
    return this.repository.findActiveHoldForStudentAndBook(studentId, bookId);
  }

  async getPendingHolds() {
    return this.repository.findPendingHolds();
  }
}
