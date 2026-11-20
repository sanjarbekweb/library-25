import { z } from "zod";

export const analyticsTimeframeEnum = z.enum(["30d", "90d", "6m", "1y", "all"]);
export type AnalyticsTimeframe = z.infer<typeof analyticsTimeframeEnum>;

export const analyticsQuerySchema = z.object({
  timeframe: analyticsTimeframeEnum.default("90d"),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
