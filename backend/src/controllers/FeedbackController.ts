import { Request, Response, NextFunction } from 'express';
import { FeedbackService } from '../services/FeedbackService';
import {
  submitFeedbackSchema,
  moderateFeedbackSchema,
  adminFeedbackQuerySchema,
} from '../schemas/feedback.schema';

const feedbackService = new FeedbackService();

export class FeedbackController {
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const input = submitFeedbackSchema.parse(req.body);
      const result = await feedbackService.submitFeedback(input, req.user!);
      res.status(201).json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getByBook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await feedbackService.getBookReviews(req.params.bookId as string);
      res.json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const query = adminFeedbackQuerySchema.parse(req.query);
      const result = await feedbackService.getAdminFeedbacks(query);
      res.json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async moderate(req: Request, res: Response, next: NextFunction) {
    try {
      const input = moderateFeedbackSchema.parse({
        feedbackId: req.params.id,
        ...req.body,
      });
      const result = await feedbackService.toggleModeration(input, req.user!);
      res.json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await feedbackService.deleteFeedback(req.params.id as string, req.user!);
      res.json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getEligible(req: Request, res: Response, next: NextFunction) {
    try {
      const bookId = req.query.bookId as string;
      if (!bookId) {
        return res.json({ ok: true, data: null });
      }
      const result = await feedbackService.getEligibleLoan(bookId, req.user!.id);
      res.json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
