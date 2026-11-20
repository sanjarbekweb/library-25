import { Request, Response, NextFunction } from 'express';
import { ReservationService } from '../services/ReservationService';
import { createReservationSchema, cancelReservationSchema } from '../schemas/reservation.schema';

const reservationService = new ReservationService();

export class ReservationController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createReservationSchema.parse(req.body);
      const result = await reservationService.createReservation(input, req.user!);
      res.status(201).json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const input = cancelReservationSchema.parse({
        reservationId: req.params.id,
        ...req.body,
      });
      const result = await reservationService.cancelReservation(input, req.user!);
      res.json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getMyReservations(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await reservationService.getStudentReservations(req.user!.id);
      res.json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getPendingHolds(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await reservationService.getPendingHolds();
      res.json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getByBookId(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await reservationService.getReservationForBook(req.params.bookId as string, req.user!.id);
      res.json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
