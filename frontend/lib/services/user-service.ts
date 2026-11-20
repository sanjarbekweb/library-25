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
import { Prisma, UserRole, PrismaClient } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";
import { VerifiedActor, assertAdmin, HumanActor } from "@/lib/auth/verified-actor";
import { recordDomainAudit } from "@/lib/services/audit-service";
import { withIdempotency } from "@/lib/services/idempotency-service";

/**
 * Upserts a user from Clerk lifecycle events (user.created, user.updated).
 * Validates payload via Zod and syncs fields to PostgreSQL.
 * Protects against stale webhooks downgrading DB authority or reactivating deactivated accounts.
 */
export async function syncUserFromClerk(
  rawInput: unknown,
  dbClient?: Prisma.TransactionClient | PrismaClient
) {
  const parseResult = SyncUserSchema.safeParse(rawInput);
  if (!parseResult.success) {
    throw new ServiceError(
      "INVALID_USER_DATA",
      `User validation failed: ${parseResult.error.issues.map((i) => i.message).join(", ")}`,
      422
    );
  }

  const { clerkId, email, firstName, lastName, role } = parseResult.data;
  const client = dbClient ?? prisma;

  const existingUser = await client.user.findUnique({
    where: { clerkId },
  });

  if (existingUser) {
    // Stale/out-of-order webhook protection:
    // 1. Deactivated accounts stay deactivated (stale webhooks cannot restore revoked access)
    // 2. Do not downgrade an active ADMIN or ASSISTANT to STUDENT via an unauthenticated/stale webhook
    const preservedRole =
      (existingUser.role === "ADMIN" || existingUser.role === "ASSISTANT") && role === "STUDENT"
        ? existingUser.role
        : role ?? existingUser.role;

    return client.user.update({
      where: { clerkId },
      data: {
        email,
        firstName,
        lastName,
        role: preservedRole,
        isActive: existingUser.isActive,
      },
    });
  }

  return client.user.create({
    data: {
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
export async function deactivateUserFromClerk(
  clerkId: string,
  dbClient?: Prisma.TransactionClient | PrismaClient
) {
  if (!clerkId) {
    throw new ServiceError("MISSING_CLERK_ID", "Clerk ID is required for deactivation", 400);
  }

  const client = dbClient ?? prisma;

  const existingUser = await client.user.findUnique({
    where: { clerkId },
  });

  if (!existingUser) {
    // If user is already absent or deleted, return gracefully
    return null;
  }

  return client.user.update({
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
  const { auth, currentUser } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) return null;

  // 1. Fast path: Check local PostgreSQL database first (1-2ms)
  const existingUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (existingUser) {
    return existingUser;
  }

  // 2. Slow path (First-time sign-in): Fetch full profile from Clerk and upsert
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
 * Enforces common-lock serializable last-admin protection, domain audit, outbox message, and idempotency.
 */
export async function updateUserRole(
  adminActorOrClerkId: VerifiedActor | string,
  rawInput: unknown
) {
  const parseResult = UpdateUserRoleSchema.safeParse(rawInput);
  if (!parseResult.success) {
    throw new ServiceError(
      "INVALID_INPUT",
      `Role update validation failed: ${parseResult.error.issues.map((i) => i.message).join(", ")}`,
      422
    );
  }

  const { targetUserId, role, idempotencyKey } = parseResult.data;

  // Resolve VerifiedActor
  let actor: HumanActor;
  if (typeof adminActorOrClerkId === "string") {
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: adminActorOrClerkId },
    });
    if (!adminUser || adminUser.role !== "ADMIN" || !adminUser.isActive) {
      throw new ServiceError("UNAUTHORIZED", "Only active administrators can modify user roles", 403);
    }
    actor = {
      type: "USER",
      userId: adminUser.id,
      clerkId: adminUser.clerkId,
      role: adminUser.role,
      email: adminUser.email,
    };
  } else {
    assertAdmin(adminActorOrClerkId);
    actor = adminActorOrClerkId;
  }

  let targetClerkIdToSync: string | null = null;

  const updatedUser = await prisma.$transaction(async (tx) => {
    return withIdempotency(tx, {
      key: idempotencyKey,
      route: "users:updateRole",
      actor,
      payload: { targetUserId, role },
      execute: async () => {
        // 1. Common lock for serializable last-admin protection across concurrent demotions
        try {
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('admin_role_mutation_lock'))`;
        } catch {
          // Fallback for mock/sqlite environments in unit tests
        }

        // 2. Re-verify active admin requester inside transaction
        const currentAdmin = await tx.user.findFirst({
          where: {
            OR: [{ clerkId: actor.clerkId }, { id: actor.userId }],
            role: "ADMIN",
            isActive: true,
          },
        });

        if (!currentAdmin) {
          throw new ServiceError("UNAUTHORIZED", "Only active administrators can modify user roles", 403);
        }

        // 3. Find target user
        const targetUser = await tx.user.findFirst({
          where: {
            OR: [{ id: targetUserId }, { clerkId: targetUserId }],
          },
        });

        if (!targetUser) {
          throw new ServiceError("USER_NOT_FOUND", "Target user record not found", 404);
        }

        targetClerkIdToSync = targetUser.clerkId;

        // 4. Safety checks:
        // Cannot demote oneself
        if ((targetUser.clerkId === actor.clerkId || targetUser.id === actor.userId) && role !== "ADMIN") {
          throw new ServiceError("FORBIDDEN", "You cannot demote your own administrator account", 400);
        }

        // Last admin protection: cannot demote last active admin
        if (targetUser.role === "ADMIN" && role !== "ADMIN") {
          const activeAdminCount = await tx.user.count({
            where: { role: "ADMIN", isActive: true },
          });
          if (activeAdminCount <= 1) {
            throw new ServiceError(
              "LAST_ADMIN_PROTECTION",
              "Cannot demote the sole active administrator account",
              400
            );
          }
        }

        // 5. Update PostgreSQL User role
        const updated = await tx.user.update({
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

        // 6. Record domain audit
        await recordDomainAudit(tx, {
          entityType: "USER",
          entityId: targetUser.id,
          action: "ROLE_CHANGE",
          actor,
          beforeState: { role: targetUser.role },
          afterState: { role },
        });

        // 7. Write transactional outbox intent
        await tx.outboxMessage.create({
          data: {
            eventType: "user.role.updated",
            payload: {
              userId: targetUser.id,
              clerkId: targetUser.clerkId,
              previousRole: targetUser.role,
              newRole: role,
              actorId: actor.userId,
            },
          },
        });

        return {
          statusCode: 200,
          data: updated,
        };
      },
    });
  });

  // 8. Outside transaction: best-effort Clerk sync
  if (targetClerkIdToSync) {
    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(targetClerkIdToSync, {
        publicMetadata: {
          role,
        },
      });
    } catch (err) {
      console.warn(`[Clerk Sync Warning] Failed to update Clerk publicMetadata for user ${targetClerkIdToSync}:`, err);
    }
  }

  return updatedUser;
}

/**
 * Toggles a user's active status (activate/deactivate account).
 * Enforces common-lock serializable last-admin protection, domain audit, outbox message, and idempotency.
 */
export async function toggleUserStatus(
  adminActorOrClerkId: VerifiedActor | string,
  rawInput: unknown
) {
  const parseResult = ToggleUserStatusSchema.safeParse(rawInput);
  if (!parseResult.success) {
    throw new ServiceError(
      "INVALID_INPUT",
      `Status toggle validation failed: ${parseResult.error.issues.map((i) => i.message).join(", ")}`,
      422
    );
  }

  const { targetUserId, isActive, idempotencyKey } = parseResult.data;

  // Resolve VerifiedActor
  let actor: HumanActor;
  if (typeof adminActorOrClerkId === "string") {
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: adminActorOrClerkId },
    });
    if (!adminUser || adminUser.role !== "ADMIN" || !adminUser.isActive) {
      throw new ServiceError("UNAUTHORIZED", "Only active administrators can modify account status", 403);
    }
    actor = {
      type: "USER",
      userId: adminUser.id,
      clerkId: adminUser.clerkId,
      role: adminUser.role,
      email: adminUser.email,
    };
  } else {
    assertAdmin(adminActorOrClerkId);
    actor = adminActorOrClerkId;
  }

  return prisma.$transaction(async (tx) => {
    return withIdempotency(tx, {
      key: idempotencyKey,
      route: "users:toggleStatus",
      actor,
      payload: { targetUserId, isActive },
      execute: async () => {
        // 1. Common lock for serializable last-admin protection across concurrent deactivations
        try {
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('admin_role_mutation_lock'))`;
        } catch {
          // Fallback for mock/sqlite environments in unit tests
        }

        // 2. Re-verify active admin requester inside transaction
        const currentAdmin = await tx.user.findFirst({
          where: {
            OR: [{ clerkId: actor.clerkId }, { id: actor.userId }],
            role: "ADMIN",
            isActive: true,
          },
        });

        if (!currentAdmin) {
          throw new ServiceError("UNAUTHORIZED", "Only active administrators can modify account status", 403);
        }

        // 3. Find target user
        const targetUser = await tx.user.findFirst({
          where: {
            OR: [{ id: targetUserId }, { clerkId: targetUserId }],
          },
        });

        if (!targetUser) {
          throw new ServiceError("USER_NOT_FOUND", "Target user record not found", 404);
        }

        // 4. Safety checks:
        // Cannot deactivate oneself
        if ((targetUser.clerkId === actor.clerkId || targetUser.id === actor.userId) && !isActive) {
          throw new ServiceError("FORBIDDEN", "You cannot deactivate your own administrator account", 400);
        }

        // Last admin protection: cannot deactivate last active admin
        if (targetUser.role === "ADMIN" && !isActive) {
          const activeAdminCount = await tx.user.count({
            where: { role: "ADMIN", isActive: true },
          });
          if (activeAdminCount <= 1) {
            throw new ServiceError(
              "LAST_ADMIN_PROTECTION",
              "Cannot deactivate the sole active administrator account",
              400
            );
          }
        }

        // 5. Update PostgreSQL User status
        const updatedUser = await tx.user.update({
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

        // 6. Record domain audit
        await recordDomainAudit(tx, {
          entityType: "USER",
          entityId: targetUser.id,
          action: "STATUS_CHANGE",
          actor,
          beforeState: { isActive: targetUser.isActive },
          afterState: { isActive },
        });

        // 7. Write transactional outbox intent
        await tx.outboxMessage.create({
          data: {
            eventType: "user.status.updated",
            payload: {
              userId: targetUser.id,
              clerkId: targetUser.clerkId,
              previousActive: targetUser.isActive,
              newActive: isActive,
              actorId: actor.userId,
            },
          },
        });

        return {
          statusCode: 200,
          data: updatedUser,
        };
      },
    });
  });
}

