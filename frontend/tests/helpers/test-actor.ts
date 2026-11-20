import { UserRole } from "@prisma/client";
import { HumanActor } from "@/lib/auth/verified-actor";

/**
 * Test-only factory to construct an actor shape for unit tests.
 * Restricted strictly to tests; never exported from production modules.
 */
export function unsafeCreateActorForTesting(input: {
  userId: string;
  clerkId: string;
  role: UserRole;
  email: string;
}): HumanActor {
  if (!input.userId.trim() || !input.clerkId.trim() || !input.email.trim()) {
    throw new Error("Invalid actor shape for testing");
  }
  return {
    type: "USER",
    userId: input.userId.trim(),
    clerkId: input.clerkId.trim(),
    role: input.role,
    email: input.email.trim(),
  };
}
