import { z } from "zod";

export const UserRoleSchema = z.enum(["STUDENT", "ASSISTANT", "ADMIN"]);

export const SyncUserSchema = z.object({
  clerkId: z.string().min(1, "Clerk ID is required"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: UserRoleSchema.default("STUDENT"),
});

export const UpdateUserSchema = SyncUserSchema.partial().extend({
  clerkId: z.string().min(1, "Clerk ID is required"),
  isActive: z.boolean().optional(),
});

export const AdminUserQuerySchema = z.object({
  query: z.string().optional().default(""),
  role: z.enum(["ALL", "STUDENT", "ASSISTANT", "ADMIN"]).optional().default("ALL"),
  status: z.enum(["ALL", "ACTIVE", "INACTIVE"]).optional().default("ALL"),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export const UpdateUserRoleSchema = z.object({
  targetUserId: z.string().min(1, "Target user ID is required"),
  role: UserRoleSchema,
});

export const ToggleUserStatusSchema = z.object({
  targetUserId: z.string().min(1, "Target user ID is required"),
  isActive: z.boolean(),
});

export type SyncInput = z.infer<typeof SyncUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type AdminUserQueryInput = z.infer<typeof AdminUserQuerySchema>;
export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;
export type ToggleUserStatusInput = z.infer<typeof ToggleUserStatusSchema>;

