import { Request, Response, NextFunction } from 'express';
import { CirculationService } from '../services/CirculationService';
import { checkoutSchema, checkinSchema } from '../schemas/circulation.schema';

const circulationService = new CirculationService();

export class CirculationController {
  async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const input = checkoutSchema.parse(req.body);
      const result = await circulationService.checkoutBookCopy(input, req.user!.id);
      res.json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async checkin(req: Request, res: Response, next: NextFunction) {
    try {
      const input = checkinSchema.parse(req.body);
      const result = await circulationService.checkinBookCopy(input, req.user!.id);
      res.json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async searchStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q as string) || '';
      const result = await circulationService.searchStudents(query);
      res.json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async searchCopies(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q as string) || '';
      const result = await circulationService.searchCopies(query);
      res.json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
