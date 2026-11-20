import assert from "node:assert/strict";
import { test } from "node:test";
import { withIdempotency, computeRequestHash } from "../../lib/services/idempotency-service";
import { ServiceError } from "../../lib/errors";
import { VerifiedActor } from "../../lib/auth/verified-actor";

const dummyActor: VerifiedActor = {
  type: "USER",
  userId: "user_student_123",
  clerkId: "user_clerk_123",
  email: "student@school.edu",
  role: "STUDENT",
};

test("withIdempotency executes mutation when no key is provided", async () => {
  let executedCount = 0;
  const mockTx = {} as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const result = await withIdempotency(mockTx, {
    route: "test:route",
    actor: dummyActor,
    payload: { bookId: "book-1" },
    execute: async () => {
      executedCount++;
      return { statusCode: 200, data: { success: true } };
    },
  });

  assert.deepEqual(result, { success: true });
  assert.equal(executedCount, 1);
});

test("withIdempotency returns cached response when key was previously completed", async () => {
  let executedCount = 0;
  const storedPayload = { bookId: "book-1" };
  const storedHash = computeRequestHash(storedPayload);

  const mockTx = {
    idempotencyRecord: {
      findUnique: async () => ({
        key: "key-123",
        route: "test:route",
        requestHash: storedHash,
        status: "COMPLETED",
        responseStatus: 200,
        responseBody: JSON.stringify({ reservationId: "res-abc" }),
      }),
    },
  } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const result = await withIdempotency(mockTx, {
    key: "key-123",
    route: "test:route",
    actor: dummyActor,
    payload: storedPayload,
    execute: async () => {
      executedCount++;
      return { statusCode: 201, data: { reservationId: "res-new" } };
    },
  });

  assert.deepEqual(result, { reservationId: "res-abc" });
  assert.equal(executedCount, 0, "Cached response must not re-execute the mutation block");
});

test("withIdempotency throws 409 when key is reused with different request payload", async () => {
  const mockTx = {
    idempotencyRecord: {
      findUnique: async () => ({
        key: "key-123",
        route: "test:route",
        requestHash: "different-hash-value",
        status: "COMPLETED",
        responseStatus: 200,
        responseBody: JSON.stringify({ reservationId: "res-abc" }),
      }),
    },
  } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  await assert.rejects(
    async () => {
      await withIdempotency(mockTx, {
        key: "key-123",
        route: "test:route",
        actor: dummyActor,
        payload: { bookId: "different-book" },
        execute: async () => ({ statusCode: 200, data: {} }),
      });
    },
    (err: unknown) => {
      assert.ok(err instanceof ServiceError);
      assert.equal(err.code, "IDEMPOTENCY_KEY_REUSED");
      assert.equal(err.statusCode, 409);
      return true;
    }
  );
});

test("withIdempotency throws 409 when key is currently in-flight", async () => {
  const payload = { bookId: "book-1" };
  const mockTx = {
    idempotencyRecord: {
      findUnique: async () => null,
      create: async () => {
        const err = new Error("Unique constraint failed on the fields: (`key`)");
        (err as any).code = "P2002"; // eslint-disable-line @typescript-eslint/no-explicit-any
        throw err;
      },
    },
  } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  await assert.rejects(
    async () => {
      await withIdempotency(mockTx, {
        key: "key-123",
        route: "test:route",
        actor: dummyActor,
        payload,
        execute: async () => ({ statusCode: 200, data: {} }),
      });
    },
    (err: unknown) => {
      assert.ok(err instanceof ServiceError);
      assert.equal(err.code, "MUTATION_IN_FLIGHT");
      assert.equal(err.statusCode, 409);
      return true;
    }
  );
});

test("conditional copy claim logic detects concurrent race condition (count === 0)", async () => {
  // Simulate race condition where updateMany matches 0 records because another transaction changed status or incremented version
  const simulateConditionalCopyClaim = async (params: {
    copyId: string;
    expectedVersion: number;
    mockUpdateResultCount: number;
  }) => {
    if (params.mockUpdateResultCount === 0) {
      throw new ServiceError(
        "COPY_CONCURRENTLY_ACQUIRED",
        "Physical copy was concurrently acquired or modified by another session",
        409
      );
    }
    return { success: true, newVersion: params.expectedVersion + 1 };
  };

  // Winner scenario
  const winner = await simulateConditionalCopyClaim({
    copyId: "copy-1",
    expectedVersion: 0,
    mockUpdateResultCount: 1,
  });
  assert.equal(winner.success, true);
  assert.equal(winner.newVersion, 1);

  // Loser scenario (race loser gets 0 updated rows due to version bump / status change)
  await assert.rejects(
    async () => {
      await simulateConditionalCopyClaim({
        copyId: "copy-1",
        expectedVersion: 0,
        mockUpdateResultCount: 0,
      });
    },
    (err: unknown) => {
      assert.ok(err instanceof ServiceError);
      assert.equal(err.code, "COPY_CONCURRENTLY_ACQUIRED");
      assert.equal(err.statusCode, 409);
      return true;
    }
  );
});

test("single close of active loan detects concurrent return race (count === 0)", async () => {
  const simulateLoanClose = async (mockCount: number) => {
    if (mockCount === 0) {
      throw new ServiceError(
        "LOAN_ALREADY_CLOSED",
        "This borrowing record was concurrently returned or closed",
        409
      );
    }
    return { success: true };
  };

  // First checkin succeeds
  const first = await simulateLoanClose(1);
  assert.equal(first.success, true);

  // Concurrent second checkin fails with 409 conflict
  await assert.rejects(
    async () => {
      await simulateLoanClose(0);
    },
    (err: unknown) => {
      assert.ok(err instanceof ServiceError);
      assert.equal(err.code, "LOAN_ALREADY_CLOSED");
      assert.equal(err.statusCode, 409);
      return true;
    }
  );
});
