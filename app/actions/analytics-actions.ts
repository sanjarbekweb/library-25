"use server";

import { auth } from "@clerk/nextjs/server";
import { getCollectionAnalytics, AnalyticsData } from "@/lib/services/analytics-service";
import { getUserByClerkId } from "@/lib/services/user-service";
import { AnalyticsTimeframeEnum, AnalyticsTimeframe } from "@/lib/schemas/analytics-schema";
import { ServiceError } from "@/lib/errors";

export interface ServerActionResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

async function verifyAdminRole(userId: string, sessionClaims: any): Promise<boolean> {
  let role = sessionClaims?.metadata?.role;
  if (!role) {
    const dbUser = await getUserByClerkId(userId);
    role = dbUser?.role;
  }
  return role === "ADMIN";
}

/**
 * Server Action to fetch aggregate collection growth and circulation analytics data.
 * Requires authenticated Clerk session with ADMIN role.
 */
export async function getAnalyticsDataAction(
  timeframe: AnalyticsTimeframe = "90d"
): Promise<ServerActionResponse<AnalyticsData>> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return {
        ok: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "You must be signed in as an administrator.",
        },
      };
    }

    const isAdmin = await verifyAdminRole(userId, sessionClaims);
    if (!isAdmin) {
      return {
        ok: false,
        error: {
          code: "FORBIDDEN",
          message: "Administrative privileges required to access analytics data.",
        },
      };
    }

    const parsedTimeframe = AnalyticsTimeframeEnum.safeParse(timeframe);
    const validTimeframe = parsedTimeframe.success ? parsedTimeframe.data : "90d";

    const data = await getCollectionAnalytics(validTimeframe);

    return {
      ok: true,
      data,
    };
  } catch (error) {
    if (error instanceof ServiceError) {
      return {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }

    console.error("[Get Analytics Data Action Error]:", error);
    return {
      ok: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while generating analytics.",
      },
    };
  }
}
