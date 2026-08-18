import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  SyncUserSchema,
  UpdateUserSchema,
  AdminUserQuerySchema,
  UpdateUserRoleSchema,
  ToggleUserStatusSchema,
} from "@/lib/schemas/user-schema";
import { ServiceError } from "@/lib/errors";
import { Prisma, UserRole } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";

/**
 * Upserts a user from Clerk lifecycle events (user.created, user.updated).
 * Validates payload via Zod and syncs fields to PostgreSQL.
 */
export async function syncUserFromClerk(rawInput: unknown) {
  const parseResult = SyncUserSchema.safeParse(rawInput);
  if (!parseResult.success) {
    throw new ServiceError(
      "INVALID_USER_DATA",
      `User validation failed: ${parseResult.error.issues.map((i) => i.message).join(", ")}`,
      422
    );
  }

  const { clerkId, email, firstName, lastName, role } = parseResult.data;

  return prisma.user.upsert({
    where: { clerkId },
    update: {
      email,
      firstName,
      lastName,
      role,
    },
    create: {
      clerkId,
      email,
      firstName,
      lastName,
      role: role ?? "STUDENT",
    },
  });
}

/**
 * Updates user attributes or role assignment.
 */
export async function updateUser(rawInput: unknown) {
  const parseResult = UpdateUserSchema.safeParse(rawInput);
  if (!parseResult.success) {
    throw new ServiceError(
      "INVALID_USER_DATA",
      `Update validation failed: ${parseResult.error.issues.map((i) => i.message).join(", ")}`,
      422
    );
  }

  const { clerkId, ...updateData } = parseResult.data;

  const existingUser = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!existingUser) {
    throw new ServiceError("USER_NOT_FOUND", `User with Clerk ID ${clerkId} not found`, 404);
  }

  return prisma.user.update({
    where: { clerkId },
    data: updateData,
  });
}

/**
 * Deactivates or marks a user as inactive when deleted in Clerk (user.deleted).
 */
export async function deactivateUserFromClerk(clerkId: string) {
  if (!clerkId) {
    throw new ServiceError("MISSING_CLERK_ID", "Clerk ID is required for deactivation", 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!existingUser) {
    // If user is already absent or deleted, return gracefully
    return null;
  }

  return prisma.user.update({
    where: { clerkId },
    data: { isActive: false },
  });
}

/**
 * Fetches user profile by Clerk ID.
 */
export async function getUserByClerkId(clerkId: string) {
  if (!clerkId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { clerkId },
  });
}

/**
 * Ensures the currently authenticated Clerk user is automatically synced to PostgreSQL.
 * Provides instant JIT sync for local development where cloud webhooks cannot reach localhost.
 * Wrapped in React cache() to deduplicate execution per request lifecycle.
 */
export const syncCurrentAuthenticatedUser = cache(async () => {
  const { currentUser } = await import("@clerk/nextjs/server");
  const user = await currentUser();
  if (!user) return null;

  const primaryEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ||
    user.emailAddresses[0]?.emailAddress ||
    "";

  const role =
    (user.publicMetadata?.role as "STUDENT" | "ASSISTANT" | "ADMIN") ||
    "STUDENT";

  return prisma.user.upsert({
    where: { clerkId: user.id },
    update: {
      email: primaryEmail,
      firstName: user.firstName || "Student",
      lastName: user.lastName || "",
      role,
    },
    create: {
      clerkId: user.id,
      email: primaryEmail,
      firstName: user.firstName || "Student",
      lastName: user.lastName || "",
      role,
    },
  });
});

/**
 * Fetches user accounts with search, role/status filtering, pagination, and role distribution metrics.
 */
export async function getAdminUsers(rawInput?: unknown) {
  const parseResult = AdminUserQuerySchema.safeParse(rawInput || {});
  if (!parseResult.success) {
    throw new ServiceError(
      "INVALID_QUERY",
      `Invalid search filter parameters: ${parseResult.error.issues.map((i) => i.message).join(", ")}`,
      422
    );
  }

  const { query, role, status, page, limit } = parseResult.data;

  const where: Prisma.UserWhereInput = {};

  if (query && query.trim() !== "") {
    const q = query.trim();
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  if (role !== "ALL") {
    where.role = role as UserRole;
  }

  if (status === "ACTIVE") {
    where.isActive = true;
  } else if (status === "INACTIVE") {
    where.isActive = false;
  }

  const skip = (page - 1) * limit;

  const [users, total, totalCount, studentCount, assistantCount, adminCount, inactiveCount] =
    await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip,
        take: limit,
        select: {
          id: true,
          clerkId: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              loans: true,
              reservations: true,
              assistedLoans: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
      prisma.user.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "ASSISTANT" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { isActive: false } }),
    ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
    stats: {
      totalCount,
      studentCount,
      assistantCount,
      adminCount,
      inactiveCount,
    },
  };
}

/**
 * Updates a user's RBAC role and synchronizes with Clerk publicMetadata.
 */
export async function updateUserRole(adminClerkId: string, rawInput: unknown) {
  const parseResult = UpdateUserRoleSchema.safeParse(rawInput);
  if (!parseResult.success) {
    throw new ServiceError(
      "INVALID_INPUT",
      `Role update validation failed: ${parseResult.error.issues.map((i) => i.message).join(", ")}`,
      422
    );
  }

  const { targetUserId, role } = parseResult.data;

  // 1. Verify admin requester
  const adminUser = await prisma.user.findUnique({
    where: { clerkId: adminClerkId },
  });

  if (!adminUser || adminUser.role !== "ADMIN" || !adminUser.isActive) {
    throw new ServiceError("UNAUTHORIZED", "Only active administrators can modify user roles", 403);
  }

  // 2. Find target user
  const targetUser = await prisma.user.findFirst({
    where: {
      OR: [{ id: targetUserId }, { clerkId: targetUserId }],
    },
  });

  if (!targetUser) {
    throw new ServiceError("USER_NOT_FOUND", "Target user record not found", 404);
  }

  // Safety checks:
  // Cannot demote oneself
  if (targetUser.clerkId === adminClerkId && role !== "ADMIN") {
    throw new ServiceError("FORBIDDEN", "You cannot demote your own administrator account", 400);
  }

  // Cannot demote sole admin
  if (targetUser.role === "ADMIN" && role !== "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN", isActive: true } });
    if (adminCount <= 1) {
      throw new ServiceError("FORBIDDEN", "Cannot demote the sole active administrator account", 400);
    }
  }

  // 3. Update PostgreSQL User role
  const updatedUser = await prisma.user.update({
    where: { id: targetUser.id },
    data: { role },
    select: {
      id: true,
      clerkId: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  // 4. Sync role changes with Clerk Backend API (publicMetadata.role)
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(targetUser.clerkId, {
      publicMetadata: {
        role,
      },
    });
  } catch (err) {
    console.warn(`[Clerk Sync Warning] Failed to update Clerk publicMetadata for user ${targetUser.clerkId}:`, err);
  }

  return updatedUser;
}

/**
 * Toggles a user's active status (activate/deactivate account).
 */
export async function toggleUserStatus(adminClerkId: string, rawInput: unknown) {
  const parseResult = ToggleUserStatusSchema.safeParse(rawInput);
  if (!parseResult.success) {
    throw new ServiceError(
      "INVALID_INPUT",
      `Status toggle validation failed: ${parseResult.error.issues.map((i) => i.message).join(", ")}`,
      422
    );
  }

  const { targetUserId, isActive } = parseResult.data;

  // 1. Verify admin requester
  const adminUser = await prisma.user.findUnique({
    where: { clerkId: adminClerkId },
  });

  if (!adminUser || adminUser.role !== "ADMIN" || !adminUser.isActive) {
    throw new ServiceError("UNAUTHORIZED", "Only active administrators can modify account status", 403);
  }

  // 2. Find target user
  const targetUser = await prisma.user.findFirst({
    where: {
      OR: [{ id: targetUserId }, { clerkId: targetUserId }],
    },
  });

  if (!targetUser) {
    throw new ServiceError("USER_NOT_FOUND", "Target user record not found", 404);
  }

  // Cannot deactivate oneself
  if (targetUser.clerkId === adminClerkId && !isActive) {
    throw new ServiceError("FORBIDDEN", "You cannot deactivate your own administrator account", 400);
  }

  // Cannot deactivate sole admin
  if (targetUser.role === "ADMIN" && !isActive) {
    const activeAdminCount = await prisma.user.count({ where: { role: "ADMIN", isActive: true } });
    if (activeAdminCount <= 1) {
      throw new ServiceError("FORBIDDEN", "Cannot deactivate the sole active administrator account", 400);
    }
  }

  // 3. Update PostgreSQL User status
  const updatedUser = await prisma.user.update({
    where: { id: targetUser.id },
    data: { isActive },
    select: {
      id: true,
      clerkId: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return updatedUser;
}

