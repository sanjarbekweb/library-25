import { AnalyticsRepository } from "../repositories/AnalyticsRepository";
import { AnalyticsTimeframe, analyticsTimeframeEnum } from "../schemas/analytics.schema";

export class AnalyticsService {
  constructor(private analyticsRepository: AnalyticsRepository) {}

  async getCollectionAnalytics(timeframeInput: string = "90d") {
    const parsed = analyticsTimeframeEnum.safeParse(timeframeInput);
    const timeframe: AnalyticsTimeframe = parsed.success ? parsed.data : "90d";

    return this.analyticsRepository.getCollectionAnalytics(timeframe);
  }
}
