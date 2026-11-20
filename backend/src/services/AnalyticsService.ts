import { AnalyticsRepository } from "../repositories/AnalyticsRepository";
import { AnalyticsTimeframe, analyticsTimeframeEnum } from "../schemas/analytics.schema";
import { ApiError } from "../utils/ApiError";

export class AnalyticsService {
  constructor(private analyticsRepository: AnalyticsRepository) {}

  async getCollectionAnalytics(timeframeInput: string = "90d") {
    const parsed = analyticsTimeframeEnum.safeParse(timeframeInput);
    const timeframe: AnalyticsTimeframe = parsed.success ? parsed.data : "90d";

    try {
      return await this.analyticsRepository.getCollectionAnalytics(timeframe);
    } catch (error: any) {
      throw new ApiError(500, error?.message || "Failed to generate analytics", "ANALYTICS_ERROR");
    }
  }
}
