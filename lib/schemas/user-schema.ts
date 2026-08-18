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

export type SyncInput = z.infer<typeof SyncUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
