"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { updateUserRole, toggleUserStatus, getUserByClerkId } from "@/lib/services/user-service";
import { UpdateUserRoleInput, ToggleUserStatusInput } from "@/lib/schemas/user-schema";
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
 * Server Action for administrators to update a user's RBAC role.
 * Enforces server-side Clerk session verification & ADMIN role check.
 */
export async function updateUserRoleAction(
  input: UpdateUserRoleInput
): Promise<ServerActionResponse<{ id: string; role: string }>> {
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
          message: "Administrative privileges required to modify user roles.",
        },
      };
    }

    const result = await updateUserRole(userId, input);

    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return {
      ok: true,
      data: { id: result.id, role: result.role },
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

    console.error("[Update User Role Action Error]:", error);
    return {
      ok: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while updating user role.",
      },
    };
  }
}

/**
 * Server Action for administrators to activate or deactivate a user account.
 * Enforces server-side Clerk session verification & ADMIN role check.
 */
export async function toggleUserStatusAction(
  input: ToggleUserStatusInput
): Promise<ServerActionResponse<{ id: string; isActive: boolean }>> {
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
          message: "Administrative privileges required to modify account status.",
        },
      };
    }

    const result = await toggleUserStatus(userId, input);

    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return {
      ok: true,
      data: { id: result.id, isActive: result.isActive },
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

    console.error("[Toggle User Status Action Error]:", error);
    return {
      ok: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while toggling user account status.",
      },
    };
  }
}
