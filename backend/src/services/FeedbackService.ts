import { FeedbackRepository } from "../repositories/FeedbackRepository";
import { SubmitFeedbackInput, ModerateFeedbackInput, AdminFeedbackQuery } from "../schemas/feedback.schema";
import { ApiError } from "../utils/ApiError";
import { errorMessage } from "../utils/errors";
import { User, UserRole } from "@prisma/client";

export class FeedbackService {
  private repository: FeedbackRepository;

  constructor() {
    this.repository = new FeedbackRepository();
  }

  async submitFeedback(input: SubmitFeedbackInput, actor: User) {
    if (!actor.isActive) {
      throw new ApiError(403, "Account is inactive or suspended", "STUDENT_INACTIVE");
    }

    try {
      const result = await this.repository.createFeedback(input, actor.id);
      return result;
    } catch (err: unknown) {
      if (errorMessage(err) === "INVALID_LOAN") {
        throw new ApiError(400, "The specified borrowing loan does not qualify for feedback", "INVALID_LOAN");
      }
      if (errorMessage(err) === "FEEDBACK_ALREADY_EXISTS") {
        throw new ApiError(409, "Feedback has already been submitted for this loan", "FEEDBACK_EXISTS");
      }
      throw err;
    }
  }

  async getBookReviews(bookId: string) {
    return this.repository.findFeedbacksByBook(bookId);
  }

  async getAdminFeedbacks(queryParams: AdminFeedbackQuery) {
    return this.repository.findAllAdmin(queryParams);
  }

  async toggleModeration(input: ModerateFeedbackInput, actor: User) {
    if (actor.role !== UserRole.ADMIN) {
      throw new ApiError(403, "Forbidden: Only administrators can moderate feedback", "UNAUTHORIZED_ROLE");
    }

    try {
      return await this.repository.toggleModeration(input.feedbackId, input.isModerated, actor);
    } catch (err: unknown) {
      if (errorMessage(err) === "FEEDBACK_NOT_FOUND") {
        throw new ApiError(404, "Feedback record not found", "FEEDBACK_NOT_FOUND");
      }
      throw err;
    }
  }

  async deleteFeedback(feedbackId: string, actor: User) {
    if (actor.role !== UserRole.ADMIN) {
      throw new ApiError(403, "Forbidden: Only administrators can delete reviews", "UNAUTHORIZED_ROLE");
    }

    try {
      return await this.repository.deleteFeedback(feedbackId, actor);
    } catch (err: unknown) {
      if (errorMessage(err) === "FEEDBACK_NOT_FOUND") {
        throw new ApiError(404, "Feedback record not found", "FEEDBACK_NOT_FOUND");
      }
      throw err;
    }
  }

  async getEligibleLoan(bookId: string, studentId: string) {
    return this.repository.findEligibleLoan(bookId, studentId);
  }
}
