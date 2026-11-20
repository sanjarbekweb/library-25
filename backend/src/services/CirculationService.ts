import { CirculationRepository } from "../repositories/CirculationRepository";
import { CheckoutInput, CheckinInput } from "../schemas/circulation.schema";
import { CopyCondition, CopyStatus } from "@prisma/client";
import { addDays } from "date-fns";
import { ApiError } from "../utils/ApiError";

export class CirculationService {
  private repository: CirculationRepository;

  constructor() {
    this.repository = new CirculationRepository();
  }

  async checkoutBookCopy(input: CheckoutInput, actorId: string) {
    const assistant = await this.repository.findAssistantById(actorId);
    if (!assistant || (assistant.role !== "ASSISTANT" && assistant.role !== "ADMIN")) {
      throw new ApiError(403, "Forbidden: Only librarians and administrators can issue book checkouts", "UNAUTHORIZED_ROLE");
    }

    const student = await this.repository.findStudentById(input.studentId);
    if (!student) {
      throw new ApiError(404, "Student record not found", "STUDENT_NOT_FOUND");
    }
    if (!student.isActive) {
      throw new ApiError(403, "Student account is suspended or inactive", "STUDENT_INACTIVE");
    }

    const copyIdTrimmed = input.copyId.trim();
    const copy = await this.repository.findCopyByBarcodeOrId(copyIdTrimmed);

    if (!copy) {
      throw new ApiError(404, "Physical copy not found with the provided identifier or barcode", "COPY_NOT_FOUND");
    }
    if (copy.status === "BORROWED") {
      throw new ApiError(409, "Copy is already borrowed by another student", "COPY_ALREADY_BORROWED");
    }
    if (copy.status === "MAINTENANCE" || copy.status === "LOST") {
      throw new ApiError(409, `Copy is currently unavailable for borrowing (${copy.status.toLowerCase()})`, "COPY_UNAVAILABLE");
    }

    const activeCopyReservation = copy.reservations[0];
    if (
      copy.status === "RESERVED" &&
      (copy.currentHolderId ? copy.currentHolderId !== student.id : (activeCopyReservation && activeCopyReservation.studentId !== student.id))
    ) {
      throw new ApiError(409, "Copy is reserved for another student", "COPY_RESERVED_OTHER");
    }

    const dueDate = addDays(new Date(), input.dueDays);
    try {
      const result = await this.repository.executeCheckout(copy, student, assistant, input, dueDate);
      return result;
    } catch (err: any) {
      if (err.message === "COPY_CONCURRENTLY_ACQUIRED") {
        throw new ApiError(409, "Copy was concurrently borrowed or state changed. Please refresh and try again.", "COPY_CLAIM_CONFLICT");
      }
      throw err;
    }
  }

  async checkinBookCopy(input: CheckinInput, actorId: string) {
    const assistant = await this.repository.findAssistantById(actorId);
    if (!assistant || (assistant.role !== "ASSISTANT" && assistant.role !== "ADMIN")) {
      throw new ApiError(403, "Forbidden: Only librarians and administrators can process book returns", "UNAUTHORIZED_ROLE");
    }

    const copyIdTrimmed = input.copyId.trim();
    const copy = await this.repository.findCopyByBarcodeOrId(copyIdTrimmed);

    if (!copy) {
      throw new ApiError(404, "Physical copy not found with the provided identifier or barcode", "COPY_NOT_FOUND");
    }

    const activeLoan = copy.loans[0];
    if (!activeLoan) {
      throw new ApiError(400, "No active or overdue loan found for this book copy", "NO_ACTIVE_LOAN");
    }

    const targetCondition = input.condition || copy.condition;
    let targetStatus: CopyStatus = CopyStatus.AVAILABLE;

    if (input.status) {
      targetStatus = input.status;
    } else if (targetCondition === CopyCondition.DAMAGED) {
      targetStatus = CopyStatus.MAINTENANCE;
    }

    try {
      const result = await this.repository.executeCheckin(copy, activeLoan, assistant, input, targetStatus, targetCondition);
      return result;
    } catch (err: any) {
      if (err.message === "COPY_CONCURRENTLY_MODIFIED") {
        throw new ApiError(409, "Copy was modified concurrently. Please refresh the circulation desk.", "COPY_CONCURRENT_CONFLICT");
      }
      if (err.message === "LOAN_ALREADY_CLOSED") {
        throw new ApiError(409, "This loan was already marked as returned or closed.", "LOAN_RETURN_CONFLICT");
      }
      throw err;
    }
  }

  async searchStudents(query: string) {
    const students = await this.repository.searchStudents(query);
    return students.map((s) => ({
      id: s.id,
      clerkId: s.clerkId,
      email: s.email,
      firstName: s.firstName,
      lastName: s.lastName,
      role: s.role,
      isActive: s.isActive,
      activeLoansCount: s._count.loans,
      activeReservationsCount: s._count.reservations,
    }));
  }

  async searchCopies(query: string) {
    const copies = await this.repository.searchCopies(query);
    return copies.map((c) => ({
      id: c.id,
      barcode: c.barcode,
      condition: c.condition,
      status: c.status,
      version: c.version,
      bookId: c.book.id,
      bookTitle: c.book.title,
      bookAuthor: c.book.author,
      bookIsbn: c.book.isbn,
      coverImageUrl: c.book.coverImageUrl,
      category: c.book.category,
      currentHolderName: c.currentHolder ? `${c.currentHolder.firstName} ${c.currentHolder.lastName}` : null,
      currentHolderId: c.currentHolderId,
      activeLoanId: c.loans[0]?.id || null,
      dueDate: c.loans[0]?.dueDate || null,
      borrowedAt: c.loans[0]?.borrowedAt || null,
    }));
  }
}
