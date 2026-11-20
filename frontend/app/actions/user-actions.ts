"use server";

/**
 * @deprecated Legacy Server Action superseded by Express REST API.
 * Use `@/hooks/api/useUsers` and `/api/v1/users` instead.
 */

import { revalidatePath } from "next/cache";
import { updateUserRole, toggleUserStatus } from "@/lib/services/user-service";
import { UpdateUserRoleInput, ToggleUserStatusInput } from "@/lib/schemas/user-schema";
import { ServiceError } from "@/lib/errors";
import { getVerifiedHumanActor, assertAdmin } from "@/lib/auth/verified-actor";

export interface ServerActionResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Server Action for administrators to update a user's RBAC role.
 * Enforces server-side Clerk session verification & ADMIN role check.
 */
export async function updateUserRoleAction(
  input: UpdateUserRoleInput
): Promise<ServerActionResponse<{ id: string; role: string }>> {
  try {
    const actor = await getVerifiedHumanActor();
    assertAdmin(actor);

    const result = await updateUserRole(actor, input);

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
    const actor = await getVerifiedHumanActor();
    assertAdmin(actor);

    const result = await toggleUserStatus(actor, input);

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
