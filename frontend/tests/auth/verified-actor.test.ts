import assert from "node:assert/strict";
import { test } from "node:test";
import { ServiceError } from "../../lib/errors";
import {
  resolveHumanActorFromSession,
  authenticateSystemActor,
  generateSystemServiceToken,
  isHumanActor,
  isSystemActor,
  assertAssistantOrAdmin,
  assertAdmin,
  DatabaseUserRecord,
  VerifiedSessionClaims,
} from "../../lib/auth/verified-actor";
import { unsafeCreateActorForTesting } from "../helpers/test-actor";

const baseDbStudent: DatabaseUserRecord = {
  id: "user_db_student_1",
  clerkId: "clerk_student_1",
  email: "student@school.edu",
  role: "STUDENT",
  isActive: true,
};

const baseDbAdmin: DatabaseUserRecord = {
  id: "user_db_admin_1",
  clerkId: "clerk_admin_1",
  email: "admin@school.edu",
  role: "ADMIN",
  isActive: true,
};

test("resolveHumanActorFromSession creates valid human actor from matching active session and DB record", () => {
  const session: VerifiedSessionClaims = { clerkId: "clerk_student_1" };
  const actor = resolveHumanActorFromSession({ session, databaseUser: baseDbStudent });

  assert.equal(actor.type, "USER");
  assert.equal(actor.userId, "user_db_student_1");
  assert.equal(actor.clerkId, "clerk_student_1");
  assert.equal(actor.role, "STUDENT");
  assert.equal(actor.email, "student@school.edu");
  assert.equal(isHumanActor(actor), true);
  assert.equal(isSystemActor(actor), false);
});

test("resolveHumanActorFromSession resolves verified ADMIN actor when claims and DB match", () => {
  const adminSession: VerifiedSessionClaims = { clerkId: "clerk_admin_1", roleClaim: "ADMIN" };
  const adminActor = resolveHumanActorFromSession({ session: adminSession, databaseUser: baseDbAdmin });

  assert.equal(adminActor.type, "USER");
  assert.equal(adminActor.role, "ADMIN");
  assert.doesNotThrow(() => assertAdmin(adminActor));
});

test("caller cannot forge an ADMIN actor when database user is a STUDENT", () => {
  // Even if a forged session claims to be an ADMIN, the database user role (STUDENT) governs
  const forgedSession: VerifiedSessionClaims = {
    clerkId: "clerk_student_1",
    roleClaim: "ADMIN",
  };

  assert.throws(
    () => resolveHumanActorFromSession({ session: forgedSession, databaseUser: baseDbStudent }),
    (err: unknown) => err instanceof ServiceError && err.code === "STALE_ROLE_CLAIMS"
  );
});

test("mismatched Clerk and database identities fail", () => {
  const session: VerifiedSessionClaims = { clerkId: "clerk_different_id" };
  assert.throws(
    () => resolveHumanActorFromSession({ session, databaseUser: baseDbStudent }),
    (err: unknown) => err instanceof ServiceError && err.code === "IDENTITY_MISMATCH"
  );
});

test("empty session identity fails authentication", () => {
  const emptySession: VerifiedSessionClaims = { clerkId: "" };
  assert.throws(
    () => resolveHumanActorFromSession({ session: emptySession, databaseUser: baseDbStudent }),
    (err: unknown) => err instanceof ServiceError && err.code === "UNAUTHENTICATED"
  );
});

test("deactivated user accounts fail actor resolution", () => {
  const inactiveUser: DatabaseUserRecord = {
    ...baseDbStudent,
    isActive: false,
  };
  const session: VerifiedSessionClaims = { clerkId: "clerk_student_1" };

  assert.throws(
    () => resolveHumanActorFromSession({ session, databaseUser: inactiveUser }),
    (err: unknown) => err instanceof ServiceError && err.code === "ACCOUNT_INACTIVE"
  );
});

test("system actors require scoped HMAC tokens and prevent cross-service impersonation", () => {
  const originalSecret = process.env.INTERNAL_SERVICE_SECRET;
  try {
    delete process.env.INTERNAL_SERVICE_SECRET;

    // Fails when secret is not configured
    assert.throws(
      () => authenticateSystemActor({ serviceName: "OUTBOX_PROCESSOR", serviceToken: "test" }),
      (err: unknown) => err instanceof ServiceError && err.code === "SERVICE_AUTH_UNAVAILABLE"
    );

    // Set valid secret (>= 16 chars)
    process.env.INTERNAL_SERVICE_SECRET = "secure-internal-secret-for-tests-1234";

    // Fails with invalid token
    assert.throws(
      () => authenticateSystemActor({ serviceName: "OUTBOX_PROCESSOR", serviceToken: "wrong-token-hex" }),
      (err: unknown) => err instanceof ServiceError && err.code === "UNAUTHORIZED_SERVICE"
    );

    // Generate valid scoped token for OUTBOX_PROCESSOR
    const outboxToken = generateSystemServiceToken("OUTBOX_PROCESSOR");
    assert.ok(outboxToken && outboxToken.length === 64);

    // Fails if token for OUTBOX_PROCESSOR is used to impersonate RESERVATION_EXPIRATION_JOB
    assert.throws(
      () => authenticateSystemActor({ serviceName: "RESERVATION_EXPIRATION_JOB", serviceToken: outboxToken }),
      (err: unknown) => err instanceof ServiceError && err.code === "UNAUTHORIZED_SERVICE"
    );

    // Succeeds when service and scoped token match
    const actor = authenticateSystemActor({
      serviceName: "OUTBOX_PROCESSOR",
      serviceToken: outboxToken,
    });
    assert.equal(actor.type, "SYSTEM");
    assert.equal(actor.serviceName, "OUTBOX_PROCESSOR");
    assert.equal(actor.identifier, "system:outbox_processor");
    assert.equal(isSystemActor(actor), true);
    assert.equal(isHumanActor(actor), false);
  } finally {
    if (originalSecret !== undefined) {
      process.env.INTERNAL_SERVICE_SECRET = originalSecret;
    } else {
      delete process.env.INTERNAL_SERVICE_SECRET;
    }
  }
});

test("role assertion helpers enforce human privilege boundaries without type coercion", () => {
  const student = unsafeCreateActorForTesting({
    userId: "u1", clerkId: "c1", role: "STUDENT", email: "s@s.edu",
  });
  const assistant = unsafeCreateActorForTesting({
    userId: "u2", clerkId: "c2", role: "ASSISTANT", email: "a@s.edu",
  });
  const admin = unsafeCreateActorForTesting({
    userId: "u3", clerkId: "c3", role: "ADMIN", email: "ad@s.edu",
  });

  // Create a system actor for testing assertions
  process.env.INTERNAL_SERVICE_SECRET = "test-secret-long-enough-1234";
  const systemToken = generateSystemServiceToken("OUTBOX_PROCESSOR");
  const system = authenticateSystemActor({
    serviceName: "OUTBOX_PROCESSOR",
    serviceToken: systemToken,
  });

  // assertAssistantOrAdmin
  assert.throws(
    () => assertAssistantOrAdmin(student),
    (err: unknown) => err instanceof ServiceError && err.code === "INSUFFICIENT_PERMISSIONS"
  );
  assert.throws(
    () => assertAssistantOrAdmin(system),
    (err: unknown) => err instanceof ServiceError && err.code === "UNAUTHORIZED_ACTOR"
  );
  assert.doesNotThrow(() => assertAssistantOrAdmin(assistant));
  assert.doesNotThrow(() => assertAssistantOrAdmin(admin));

  // assertAdmin
  assert.throws(
    () => assertAdmin(student),
    (err: unknown) => err instanceof ServiceError && err.code === "INSUFFICIENT_PERMISSIONS"
  );
  assert.throws(
    () => assertAdmin(assistant),
    (err: unknown) => err instanceof ServiceError && err.code === "INSUFFICIENT_PERMISSIONS"
  );
  assert.throws(
    () => assertAdmin(system),
    (err: unknown) => err instanceof ServiceError && err.code === "UNAUTHORIZED_ACTOR"
  );
  assert.doesNotThrow(() => assertAdmin(admin));
});
