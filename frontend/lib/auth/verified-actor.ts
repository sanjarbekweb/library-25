import { UserRole, PrismaClient, Prisma } from "@prisma/client";
import { auth, verifyToken } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/errors";
import crypto from "node:crypto";

export type ActorType = "USER" | "SYSTEM";

export type SystemServiceName =
  | "RESERVATION_EXPIRATION_JOB"
  | "CLERK_WEBHOOK"
  | "SEARCH_SYNC_WORKER"
  | "OUTBOX_PROCESSOR";

export interface HumanActor {
  readonly type: "USER";
  readonly userId: string;
  readonly clerkId: string;
  readonly role: UserRole;
  readonly email: string;
}

export interface SystemActor {
  readonly type: "SYSTEM";
  readonly serviceName: SystemServiceName;
  readonly identifier: string;
}

export type VerifiedActor = HumanActor | SystemActor;

export interface DatabaseUserRecord {
  id: string;
  clerkId: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface VerifiedSessionClaims {
  clerkId: string;
  roleClaim?: string | null;
}

/**
 * Resolves a verified human actor strictly from a verified Clerk session and an active database user record.
 * Never accepts caller-supplied roles or unverified user IDs.
 */
export function resolveHumanActorFromSession(params: {
  session: VerifiedSessionClaims;
  databaseUser: DatabaseUserRecord;
}): HumanActor {
  const sessionClerkId = params.session?.clerkId?.trim();
  if (!sessionClerkId) {
    throw new ServiceError("UNAUTHENTICATED", "Session missing verified identity", 401);
  }

  const dbClerkId = params.databaseUser?.clerkId?.trim();
  if (!dbClerkId || sessionClerkId !== dbClerkId) {
    throw new ServiceError("IDENTITY_MISMATCH", "Session clerkId does not match database user record", 403);
  }

  const dbUserId = params.databaseUser?.id?.trim();
  if (!dbUserId) {
    throw new ServiceError("INVALID_USER_RECORD", "Database user record missing valid ID", 500);
  }

  if (!params.databaseUser.isActive) {
    throw new ServiceError("ACCOUNT_INACTIVE", "User account is deactivated", 403);
  }

  const validRoles: readonly UserRole[] = ["STUDENT", "ASSISTANT", "ADMIN"] as const;
  if (!validRoles.includes(params.databaseUser.role)) {
    throw new ServiceError("INVALID_DATABASE_ROLE", "Database user record contains an invalid role", 500);
  }

  // Check role claim consistency: If a role claim is provided in the session token,
  // ensure it does not conflict with the database role for privileged accounts.
  if (params.session.roleClaim !== undefined && params.session.roleClaim !== null) {
    const sessionRole = params.session.roleClaim.trim().toUpperCase();
    if (sessionRole !== params.databaseUser.role) {
      if (sessionRole === "ADMIN" || sessionRole === "ASSISTANT" || params.databaseUser.role !== "STUDENT") {
        throw new ServiceError(
          "STALE_ROLE_CLAIMS",
          "Session role claims do not match current database role authority",
          403
        );
      }
    }
  }

  return {
    type: "USER",
    userId: dbUserId,
    clerkId: dbClerkId,
    role: params.databaseUser.role,
    email: params.databaseUser.email.trim(),
  };
}

/**
 * Resolves and verifies the human actor from the server-verified Clerk session.
 * Invokes Clerk's auth() directly from @clerk/nextjs/server to ensure cryptographic verification of the session JWT,
 * then checks active database user status and role authority.
 */
export async function getVerifiedHumanActor(
  tx?: PrismaClient | Prisma.TransactionClient
): Promise<HumanActor> {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    throw new ServiceError("UNAUTHENTICATED", "No active verified Clerk session found", 401);
  }

  const client = tx ?? prisma;
  const dbUser = await client.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      clerkId: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!dbUser) {
    throw new ServiceError("ACCOUNT_NOT_FOUND", "No database record found for authenticated user", 403);
  }

  const roleClaim =
    (sessionClaims?.metadata as { role?: string } | undefined)?.role ?? null;

  return resolveHumanActorFromSession({
    session: {
      clerkId: userId,
      roleClaim,
    },
    databaseUser: dbUser,
  });
}

/**
 * Cryptographically verifies a standalone Clerk session JWT token (e.g. Bearer authorization).
 */
export async function verifyClerkSessionToken(token: string): Promise<VerifiedSessionClaims> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new ServiceError("AUTH_CONFIG_ERROR", "Clerk secret key is not configured", 500);
  }

  try {
    const payload = await verifyToken(token, { secretKey });
    if (!payload || !payload.sub) {
      throw new ServiceError("UNAUTHENTICATED", "Invalid or expired session token", 401);
    }
    const metadata = (payload as { metadata?: { role?: string } }).metadata;
    return {
      clerkId: payload.sub,
      roleClaim: metadata?.role ?? null,
    };
  } catch (err: unknown) {
    if (err instanceof ServiceError) throw err;
    throw new ServiceError(
      "UNAUTHENTICATED",
      `Session token verification failed: ${err instanceof Error ? err.message : "Invalid token"}`,
      401
    );
  }
}

/**
 * Generates an HMAC-SHA256 scoped token for an internal system service.
 * Eliminates universal secret reuse and prevents cross-service impersonation.
 */
export function generateSystemServiceToken(serviceName: SystemServiceName, secret?: string): string {
  const configuredSecret = (secret ?? process.env.INTERNAL_SERVICE_SECRET)?.trim();
  if (!configuredSecret || configuredSecret.length < 16) {
    throw new ServiceError(
      "SERVICE_AUTH_UNAVAILABLE",
      "Internal service authentication secret is not configured or too short (minimum 16 characters)",
      500
    );
  }

  const hmac = crypto.createHmac("sha256", configuredSecret);
  hmac.update(`service-principal:${serviceName}`);
  return hmac.digest("hex");
}

/**
 * Authenticates an internal system service principal using scoped HMAC verification.
 * System actors cannot be created from arbitrary caller input or impersonate other services.
 */
export function authenticateSystemActor(params: {
  serviceName: SystemServiceName;
  serviceToken: string;
}): SystemActor {
  const validServices: readonly SystemServiceName[] = [
    "RESERVATION_EXPIRATION_JOB",
    "CLERK_WEBHOOK",
    "SEARCH_SYNC_WORKER",
    "OUTBOX_PROCESSOR",
  ] as const;

  if (!validServices.includes(params.serviceName)) {
    throw new ServiceError("INVALID_SYSTEM_SERVICE", "Unrecognized system service principal name", 400);
  }

  const expectedToken = generateSystemServiceToken(params.serviceName);
  const supplied = Buffer.from(params.serviceToken.trim(), "utf-8");
  const expected = Buffer.from(expectedToken, "utf-8");

  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
    throw new ServiceError("UNAUTHORIZED_SERVICE", "Invalid internal service principal credentials", 403);
  }

  return {
    type: "SYSTEM",
    serviceName: params.serviceName,
    identifier: `system:${params.serviceName.toLowerCase()}`,
  };
}

/**
 * Type guard to check if an actor is a verified human user.
 */
export function isHumanActor(actor: VerifiedActor): actor is HumanActor {
  return actor.type === "USER";
}

/**
 * Type guard to check if an actor is an internal system service.
 */
export function isSystemActor(actor: VerifiedActor): actor is SystemActor {
  return actor.type === "SYSTEM";
}

/**
 * Validates that an actor has Assistant or Admin privileges.
 */
export function assertAssistantOrAdmin(actor: VerifiedActor): asserts actor is HumanActor {
  if (!isHumanActor(actor)) {
    throw new ServiceError("UNAUTHORIZED_ACTOR", "Action requires a verified human staff actor", 403);
  }
  if (actor.role !== "ASSISTANT" && actor.role !== "ADMIN") {
    throw new ServiceError(
      "INSUFFICIENT_PERMISSIONS",
      "Action requires ASSISTANT or ADMIN role privileges",
      403
    );
  }
}

/**
 * Validates that an actor has Administrator privileges.
 */
export function assertAdmin(actor: VerifiedActor): asserts actor is HumanActor {
  if (!isHumanActor(actor)) {
    throw new ServiceError("UNAUTHORIZED_ACTOR", "Action requires a verified human administrator", 403);
  }
  if (actor.role !== "ADMIN") {
    throw new ServiceError(
      "INSUFFICIENT_PERMISSIONS",
      "Action requires ADMIN role privileges",
      403
    );
  }
}
