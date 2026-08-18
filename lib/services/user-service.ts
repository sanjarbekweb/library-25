import { prisma } from "@/lib/prisma";
import { SyncUserSchema, UpdateUserSchema, SyncInput, UpdateUserInput } from "@/lib/schemas/user-schema";
import { ServiceError } from "@/lib/errors";

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
