import { Request, Response, NextFunction } from "express";
import { AnalyticsService } from "../services/AnalyticsService";

export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const timeframe = (req.query.timeframe as string) || "90d";
      const data = await this.analyticsService.getCollectionAnalytics(timeframe);
      res.json({ ok: true, data });
    } catch (error) {
      next(error);
    }
  };
}
