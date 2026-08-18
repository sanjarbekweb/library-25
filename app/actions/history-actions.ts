"use server";

import { auth } from "@clerk/nextjs/server";
import {
  getCopyHistory,
  getCopyTraceabilityByBarcode,
  getUserLoansAndHistory,
  getAllAuditLogs,
  StudentLoansOverview,
  CopyTraceabilityDetail,
  BookHistoryItem,
} from "@/lib/services/history-service";
import { getUserByClerkId } from "@/lib/services/user-service";
import { ServiceError } from "@/lib/errors";
import { AuditLogFilterInput } from "@/lib/schemas/history-schema";

export type ActionResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

async function verifyAssistantOrAdminRole(userId: string, sessionClaims: any): Promise<boolean> {
  let role = (sessionClaims?.metadata as { role?: string })?.role;
  if (!role) {
    const dbUser = await getUserByClerkId(userId);
    role = dbUser?.role;
  }
  return role === "ASSISTANT" || role === "ADMIN";
}

/**
 * Fetch authenticated student's loans, active checkouts, and historical returns.
 */
export async function getStudentLoansAction(): Promise<ActionResponse<StudentLoansOverview>> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        ok: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "You must be signed in to view your loan history.",
        },
      };
    }

    const overview = await getUserLoansAndHistory(userId);
    return { ok: true, data: overview };
  } catch (error: unknown) {
    if (error instanceof ServiceError) {
      return {
        ok: false,
        error: { code: error.code, message: error.message },
      };
    }
    const message = error instanceof Error ? error.message : "Failed to load loan history";
    return {
      ok: false,
      error: { code: "INTERNAL_ERROR", message },
    };
  }
}

/**
 * Fetch physical copy traceability and immutable audit log by barcode.
 * Security: Restricted to ASSISTANT and ADMIN roles.
 */
export async function getCopyTraceabilityByBarcodeAction(
  barcode: string
): Promise<ActionResponse<CopyTraceabilityDetail>> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return {
        ok: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "You must be signed in to perform copy traceability lookups.",
        },
      };
    }

    const isAuthorized = await verifyAssistantOrAdminRole(userId, sessionClaims);
    if (!isAuthorized) {
      return {
        ok: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to view physical copy traceability audit trails.",
        },
      };
    }

    const detail = await getCopyTraceabilityByBarcode(barcode);
    return { ok: true, data: detail };
  } catch (error: unknown) {
    if (error instanceof ServiceError) {
      return {
        ok: false,
        error: { code: error.code, message: error.message },
      };
    }
    const message = error instanceof Error ? error.message : "Failed to perform traceability lookup";
    return {
      ok: false,
      error: { code: "INTERNAL_ERROR", message },
    };
  }
}

/**
 * Fetch time-sequenced history logs for a specific copy ID.
 */
export async function getCopyHistoryAction(
  copyId: string
): Promise<ActionResponse<BookHistoryItem[]>> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return {
        ok: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication required.",
        },
      };
    }

    const isAuthorized = await verifyAssistantOrAdminRole(userId, sessionClaims);
    if (!isAuthorized) {
      return {
        ok: false,
        error: {
          code: "FORBIDDEN",
          message: "Permission denied.",
        },
      };
    }

    const history = await getCopyHistory(copyId);
    return { ok: true, data: history };
  } catch (error: unknown) {
    if (error instanceof ServiceError) {
      return {
        ok: false,
        error: { code: error.code, message: error.message },
      };
    }
    const message = error instanceof Error ? error.message : "Failed to fetch copy history";
    return {
      ok: false,
      error: { code: "INTERNAL_ERROR", message },
    };
  }
}

/**
 * Fetch system audit logs with optional filter parameters.
 */
export async function getAllAuditLogsAction(
  filter?: AuditLogFilterInput
): Promise<ActionResponse<BookHistoryItem[]>> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return {
        ok: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication required.",
        },
      };
    }

    const isAuthorized = await verifyAssistantOrAdminRole(userId, sessionClaims);
    if (!isAuthorized) {
      return {
        ok: false,
        error: {
          code: "FORBIDDEN",
          message: "Permission denied.",
        },
      };
    }

    const logs = await getAllAuditLogs(filter);
    return { ok: true, data: logs };
  } catch (error: unknown) {
    if (error instanceof ServiceError) {
      return {
        ok: false,
        error: { code: error.code, message: error.message },
      };
    }
    const message = error instanceof Error ? error.message : "Failed to fetch audit logs";
    return {
      ok: false,
      error: { code: "INTERNAL_ERROR", message },
    };
  }
}
