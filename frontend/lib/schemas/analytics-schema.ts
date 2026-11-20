import { z } from "zod";

export const AnalyticsTimeframeEnum = z.enum(["30d", "90d", "6m", "1y", "all"]);
export type AnalyticsTimeframe = z.infer<typeof AnalyticsTimeframeEnum>;

export const AnalyticsQuerySchema = z.object({
  timeframe: AnalyticsTimeframeEnum.default("90d"),
});

export type AnalyticsQueryInput = z.infer<typeof AnalyticsQuerySchema>;
