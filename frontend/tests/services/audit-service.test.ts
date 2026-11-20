import assert from "node:assert/strict";
import { test } from "node:test";
import { Prisma } from "@prisma/client";
import { recordCopyAudit, recordDomainAudit, DbClientOrTransaction } from "../../lib/services/audit-service";
import { unsafeCreateActorForTesting } from "../helpers/test-actor";
import { authenticateSystemActor, generateSystemServiceToken } from "../../lib/auth/verified-actor";

test("recordCopyAudit creates BookHistory entry attributed to verified human actor", async () => {
  const humanActor = unsafeCreateActorForTesting({
    userId: "user_assistant_123",
    clerkId: "clerk_assistant_123",
    role: "ASSISTANT",
    email: "assistant@school.edu",
  });

  type BookHistoryCreateArgs = { data: Prisma.BookHistoryUncheckedCreateInput };
  const captured = {
    data: null as Prisma.BookHistoryUncheckedCreateInput | null,
  };

  const mockTx = {
    bookHistory: {
      create: async ({ data }: BookHistoryCreateArgs) => {
        captured.data = data;
        return { id: "bh_1", ...data, createdAt: new Date() };
      },
    },
  } as unknown as DbClientOrTransaction;

  const result = await recordCopyAudit(mockTx, {
    bookCopyId: "copy_456",
    action: "CHECKOUT",
    actor: humanActor,
    previousState: "AVAILABLE",
    newState: "BORROWED",
    notes: "Normal student checkout",
    correlationId: "req_test_123",
    causationId: "cause_test_123",
  });

  assert.equal(result.id, "bh_1");
  const data = captured.data;
  assert.ok(data !== null);
  assert.equal(data.bookCopyId, "copy_456");
  assert.equal(data.action, "CHECKOUT");
  assert.equal(data.actorType, "USER");
  assert.equal(data.actorId, "user_assistant_123");
  assert.equal(data.actorRole, "ASSISTANT");
  assert.equal(data.systemActor, null);
  assert.equal(data.previousState, "AVAILABLE");
  assert.equal(data.newState, "BORROWED");
  assert.equal(data.correlationId, "req_test_123");
  assert.equal(data.causationId, "cause_test_123");
});

test("recordCopyAudit creates BookHistory entry attributed to authenticated system actor", async () => {
  process.env.INTERNAL_SERVICE_SECRET = "secure-internal-secret-for-audit-tests";
  const systemToken = generateSystemServiceToken("RESERVATION_EXPIRATION_JOB");
  const systemActor = authenticateSystemActor({
    serviceName: "RESERVATION_EXPIRATION_JOB",
    serviceToken: systemToken,
  });

  type BookHistoryCreateArgs = { data: Prisma.BookHistoryUncheckedCreateInput };
  const captured = {
    data: null as Prisma.BookHistoryUncheckedCreateInput | null,
  };

  const mockTx = {
    bookHistory: {
      create: async ({ data }: BookHistoryCreateArgs) => {
        captured.data = data;
        return { id: "bh_sys_1", ...data, createdAt: new Date() };
      },
    },
  } as unknown as DbClientOrTransaction;

  const result = await recordCopyAudit(mockTx, {
    bookCopyId: "copy_789",
    action: "RESERVATION_EXPIRED",
    actor: systemActor,
    previousState: "RESERVED",
    newState: "AVAILABLE",
    notes: "Automated expiration worker cleanup",
    correlationId: "cron_exp_001",
  });

  assert.equal(result.id, "bh_sys_1");
  const data = captured.data;
  assert.ok(data !== null);
  assert.equal(data.bookCopyId, "copy_789");
  assert.equal(data.action, "RESERVATION_EXPIRED");
  assert.equal(data.actorType, "SYSTEM");
  assert.equal(data.actorId, null);
  assert.equal(data.actorRole, null);
  assert.equal(data.systemActor, "system:reservation_expiration_job");
  assert.equal(data.correlationId, "cron_exp_001");
});

test("recordDomainAudit records non-copy entity state mutations with JSON snapshots", async () => {
  const adminActor = unsafeCreateActorForTesting({
    userId: "user_admin_999",
    clerkId: "clerk_admin_999",
    role: "ADMIN",
    email: "admin@school.edu",
  });

  type DomainAuditCreateArgs = { data: Prisma.DomainAuditUncheckedCreateInput };
  const captured = {
    data: null as Prisma.DomainAuditUncheckedCreateInput | null,
  };

  const mockTx = {
    domainAudit: {
      create: async ({ data }: DomainAuditCreateArgs) => {
        captured.data = data;
        return { id: "da_1", ...data, createdAt: new Date() };
      },
    },
  } as unknown as DbClientOrTransaction;

  const result = await recordDomainAudit(mockTx, {
    entityType: "USER",
    entityId: "user_target_001",
    action: "UPDATE_ROLE",
    actor: adminActor,
    beforeState: { role: "STUDENT" },
    afterState: { role: "ASSISTANT" },
    correlationId: "req_role_change_888",
  });

  assert.equal(result.id, "da_1");
  const data = captured.data;
  assert.ok(data !== null);
  assert.equal(data.entityType, "USER");
  assert.equal(data.entityId, "user_target_001");
  assert.equal(data.action, "UPDATE_ROLE");
  assert.equal(data.actorType, "USER");
  assert.equal(data.actorId, "user_admin_999");
  assert.equal(data.actorRole, "ADMIN");
  assert.deepEqual(data.beforeState, { role: "STUDENT" });
  assert.deepEqual(data.afterState, { role: "ASSISTANT" });
  assert.equal(data.correlationId, "req_role_change_888");
});
