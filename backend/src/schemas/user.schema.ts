import { z } from "zod";
import { UserRole } from "@prisma/client";

export const adminUserQuerySchema = z.object({
  query: z.string().optional().default(""),
  role: z.enum(["ALL", "STUDENT", "ASSISTANT", "ADMIN"]).optional().default("ALL"),
  status: z.enum(["ALL", "ACTIVE", "INACTIVE"]).optional().default("ALL"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const updateUserRoleSchema = z.object({
  targetUserId: z.string().min(1, "Target user ID is required"),
  role: z.nativeEnum(UserRole),
  idempotencyKey: z.string().min(1).max(128).optional(),
});

export const toggleUserStatusSchema = z.object({
  targetUserId: z.string().min(1, "Target user ID is required"),
  isActive: z.boolean(),
  idempotencyKey: z.string().min(1).max(128).optional(),
});

export const syncUserSchema = z.object({
  clerkId: z.string().min(1, "Clerk ID is required"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().default(""),
  role: z.nativeEnum(UserRole).optional(),
});

export type AdminUserQuery = z.infer<typeof adminUserQuerySchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type ToggleUserStatusInput = z.infer<typeof toggleUserStatusSchema>;
export type SyncUserInput = z.infer<typeof syncUserSchema>;
