import { Request, Response, NextFunction } from "express";
import { HistoryService } from "../services/HistoryService";
import { ApiError } from "../utils/ApiError";

export class HistoryController {
  constructor(private historyService: HistoryService) {}

  getMyLoans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication required", "UNAUTHENTICATED");
      }
      const data = await this.historyService.getUserLoansAndHistory(req.user.id);
      res.json({ ok: true, data });
    } catch (error) {
      next(error);
    }
  };

  getCopyTraceability = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const barcode = req.params.barcode as string;
      const data = await this.historyService.getCopyTraceabilityByBarcode(barcode);
      res.json({ ok: true, data });
    } catch (error) {
      next(error);
    }
  };

  getCopyHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const copyId = req.params.copyId as string;
      const data = await this.historyService.getCopyHistory(copyId);
      res.json({ ok: true, data });
    } catch (error) {
      next(error);
    }
  };

  getAllAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.historyService.getAllAuditLogs(req.query as any);
      res.json({ ok: true, data });
    } catch (error) {
      next(error);
    }
  };
}
