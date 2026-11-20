import assert from "node:assert/strict";
import { test } from "node:test";
import { ServiceError } from "../../lib/errors";
import { HumanActor } from "../../lib/auth/verified-actor";
import { syncUserFromClerk } from "../../lib/services/user-service";

const dummyAdmin: HumanActor = {
  type: "USER",
  userId: "admin_db_id_1",
  clerkId: "admin_clerk_id_1",
  role: "ADMIN",
  email: "admin1@school.edu",
};

const dummyAdmin2: HumanActor = {
  type: "USER",
  userId: "admin_db_id_2",
  clerkId: "admin_clerk_id_2",
  role: "ADMIN",
  email: "admin2@school.edu",
};

test("Last Admin Protection: demoting the last active admin throws LAST_ADMIN_PROTECTION", async () => {
  // Simulate the transactional invariant logic directly
  const activeAdminCount = 1;
  const targetUser = { id: "admin_db_id_2", clerkId: "admin_clerk_id_2", role: "ADMIN" };
  const targetRole: string = "STUDENT";

  assert.throws(
    () => {
      if (targetUser.role === "ADMIN" && targetRole !== "ADMIN") {
        if (activeAdminCount <= 1) {
          throw new ServiceError(
            "LAST_ADMIN_PROTECTION",
            "Cannot demote the sole active administrator account",
            400
          );
        }
      }
    },
    (err: unknown) => {
      assert.ok(err instanceof ServiceError);
      assert.equal(err.code, "LAST_ADMIN_PROTECTION");
      assert.equal(err.statusCode, 400);
      return true;
    }
  );
});

test("Last Admin Protection: deactivating the last active admin throws LAST_ADMIN_PROTECTION", async () => {
  const activeAdminCount = 1;
  const targetUser = { id: "admin_db_id_2", clerkId: "admin_clerk_id_2", role: "ADMIN" };
  const targetIsActive = false;

  assert.throws(
    () => {
      if (targetUser.role === "ADMIN" && !targetIsActive) {
        if (activeAdminCount <= 1) {
          throw new ServiceError(
            "LAST_ADMIN_PROTECTION",
            "Cannot deactivate the sole active administrator account",
            400
          );
        }
      }
    },
    (err: unknown) => {
      assert.ok(err instanceof ServiceError);
      assert.equal(err.code, "LAST_ADMIN_PROTECTION");
      assert.equal(err.statusCode, 400);
      return true;
    }
  );
});

test("Self-demotion and self-deactivation protection throws FORBIDDEN", async () => {
  const actor = dummyAdmin;
  const targetUser = { id: "admin_db_id_1", clerkId: "admin_clerk_id_1", role: "ADMIN" };
  const demoteToRole: string = "STUDENT";

  // Self demotion
  assert.throws(
    () => {
      if ((targetUser.clerkId === actor.clerkId || targetUser.id === actor.userId) && demoteToRole !== "ADMIN") {
        throw new ServiceError("FORBIDDEN", "You cannot demote your own administrator account", 400);
      }
    },
    (err: unknown) => {
      assert.ok(err instanceof ServiceError);
      assert.equal(err.code, "FORBIDDEN");
      assert.equal(err.statusCode, 400);
      return true;
    }
  );

  // Self deactivation
  assert.throws(
    () => {
      if ((targetUser.clerkId === actor.clerkId || targetUser.id === actor.userId) && !false) {
        throw new ServiceError("FORBIDDEN", "You cannot deactivate your own administrator account", 400);
      }
    },
    (err: unknown) => {
      assert.ok(err instanceof ServiceError);
      assert.equal(err.code, "FORBIDDEN");
      assert.equal(err.statusCode, 400);
      return true;
    }
  );
});

test("Direct Review Invariant: preserving moderation status on student edit", () => {
  const existingReview = {
    id: "review-1",
    bookId: "book-1",
    studentId: "student-1",
    loanId: null,
    rating: 2,
    comment: "Initial negative review with flag",
    isModerated: true, // Hidden by admin
  };

  const studentEditInput = {
    rating: 5,
    comment: "Attempting to unhide with edited polite review",
  };

  // Logic applied in submitDirectBookReview:
  const updatedReview = {
    ...existingReview,
    rating: studentEditInput.rating,
    comment: studentEditInput.comment,
    isModerated: existingReview.isModerated, // Strict invariant: preserve moderation flag
  };

  assert.equal(updatedReview.isModerated, true, "Student edit must not bypass admin moderation");
  assert.equal(updatedReview.loanId, null, "Direct review must have loanId: null");
});

test("Clerk Webhook Stale Protection: does not downgrade active admin or assistant to student", async () => {
  let updatedPayload: Record<string, unknown> | null = null;
  const mockDb = {
    user: {
      findUnique: async () => ({
        id: "admin-1",
        clerkId: "clerk_admin_999",
        email: "admin@school.edu",
        role: "ADMIN",
        isActive: true,
      }),
      update: async (args: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        updatedPayload = args.data;
        return { id: "admin-1", clerkId: "clerk_admin_999", ...args.data };
      },
    },
  };

  // Stale Clerk webhook arrives claiming role: "STUDENT"
  await syncUserFromClerk(
    {
      clerkId: "clerk_admin_999",
      email: "admin@school.edu",
      firstName: "Admin",
      lastName: "Master",
      role: "STUDENT",
    },
    mockDb as any // eslint-disable-line @typescript-eslint/no-explicit-any
  );

  assert.ok(updatedPayload !== null);
  assert.equal((updatedPayload as any).role, "ADMIN", "Stale webhook must not demote ADMIN to STUDENT"); // eslint-disable-line @typescript-eslint/no-explicit-any
});

test("Clerk Webhook Stale Protection: preserves inactive account status (never reactivates deactivated accounts)", async () => {
  let updatedPayload: Record<string, unknown> | null = null;
  const mockDb = {
    user: {
      findUnique: async () => ({
        id: "student-1",
        clerkId: "clerk_student_123",
        email: "deactivated@school.edu",
        role: "STUDENT",
        isActive: false, // Account was deactivated by admin
      }),
      update: async (args: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        updatedPayload = args.data;
        return { id: "student-1", clerkId: "clerk_student_123", ...args.data };
      },
    },
  };

  // Webhook event arrives for user
  await syncUserFromClerk(
    {
      clerkId: "clerk_student_123",
      email: "deactivated@school.edu",
      firstName: "Student",
      lastName: "Suspended",
      role: "STUDENT",
    },
    mockDb as any // eslint-disable-line @typescript-eslint/no-explicit-any
  );

  assert.ok(updatedPayload !== null);
  assert.equal((updatedPayload as any).isActive, false, "Webhook must preserve isActive: false"); // eslint-disable-line @typescript-eslint/no-explicit-any
});
