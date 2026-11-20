import "./setup-integration";
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type { User } from "@prisma/client";
import { prisma, disconnectDatabase } from "../../src/utils/prisma";
import { ReservationService } from "../../src/services/ReservationService";
import { CirculationService } from "../../src/services/CirculationService";
import { ApiError } from "../../src/utils/ApiError";

/*
 * Real-PostgreSQL race tests for the backend circulation writers. Every run creates its own
 * uniquely named fixtures and never deletes anything: audit rows are append-only by design
 * (RESTRICT foreign keys), and the test database is disposable.
 */

const run = randomUUID().slice(0, 8);
const reservations = new ReservationService();
const circulation = new CirculationService();
let seq = 0;

async function makeUser(role: "STUDENT" | "ASSISTANT" | "ADMIN"): Promise<User> {
  seq += 1;
  return prisma.user.create({
    data: {
      clerkId: `test_${run}_${role.toLowerCase()}_${seq}`,
      email: `${role.toLowerCase()}.${run}.${seq}@test.invalid`,
      firstName: role,
      lastName: `${run}-${seq}`,
      role,
    },
  });
}

async function makeBook(copies: number) {
  seq += 1;
  const n = seq;
  return prisma.book.create({
    data: {
      title: `Concurrency Fixture ${run}-${n}`,
      author: "Test Author",
      category: "Test",
      copies: {
        create: Array.from({ length: copies }, (_, i) => ({ barcode: `T-${run}-${n}-${i}` })),
      },
    },
    include: { copies: true },
  });
}

const isConflict = (reason: unknown) => reason instanceof ApiError && reason.statusCode === 409;

/** Run attempts concurrently and classify each as success, typed 409 conflict, or unexpected. */
async function race<T>(attempts: Array<() => Promise<T>>) {
  const results = await Promise.allSettled(attempts.map((attempt) => attempt()));
  const rejected = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
  return {
    ok: results.length - rejected.length,
    conflicts: rejected.filter((r) => isConflict(r.reason)).length,
    unexpected: rejected.filter((r) => !isConflict(r.reason)).map((r) => String(r.reason)),
  };
}

let assistant: User;

before(async () => {
  assistant = await makeUser("ASSISTANT");
});

after(async () => {
  await disconnectDatabase();
});

test("reserve race: 8 students, 1 copy -> exactly one hold, copy held by the winner, one audit row", async () => {
  const book = await makeBook(1);
  const students = await Promise.all(Array.from({ length: 8 }, () => makeUser("STUDENT")));

  const outcome = await race(students.map((s) => () => reservations.createReservation({ bookId: book.id, holdDays: 2 }, s)));
  assert.deepEqual(outcome.unexpected, []);
  assert.equal(outcome.ok, 1);
  assert.equal(outcome.conflicts, 7);

  const pending = await prisma.reservation.findMany({ where: { bookId: book.id, status: "PENDING" } });
  assert.equal(pending.length, 1);
  const copy = await prisma.bookCopy.findUniqueOrThrow({ where: { id: book.copies[0].id } });
  assert.equal(copy.status, "RESERVED");
  assert.equal(copy.currentHolderId, pending[0].studentId);
  assert.equal(copy.version, 1);
  assert.equal(await prisma.bookHistory.count({ where: { bookCopyId: copy.id, action: "RESERVED" } }), 1);
});

test("double-submit: the same student reserving three times at once gets exactly one hold", async () => {
  const book = await makeBook(3);
  const student = await makeUser("STUDENT");

  const outcome = await race([1, 2, 3].map(() => () => reservations.createReservation({ bookId: book.id, holdDays: 2 }, student)));
  assert.deepEqual(outcome.unexpected, []);
  assert.equal(outcome.ok, 1);
  assert.equal(await prisma.reservation.count({ where: { bookId: book.id, studentId: student.id, status: "PENDING" } }), 1);
  assert.equal(await prisma.bookCopy.count({ where: { bookId: book.id, status: "RESERVED" } }), 1);
});

test("checkout race: two desks lend the same copy to different students -> exactly one loan", async () => {
  const book = await makeBook(1);
  const [a, b] = await Promise.all([makeUser("STUDENT"), makeUser("STUDENT")]);
  const copyId = book.copies[0].id;

  const outcome = await race([a, b].map((s) => () => circulation.checkoutBookCopy({ copyId, studentId: s.id, dueDays: 14 }, assistant.id)));
  assert.deepEqual(outcome.unexpected, []);
  assert.equal(outcome.ok, 1);
  assert.equal(outcome.conflicts, 1);

  const loans = await prisma.loan.findMany({ where: { bookCopyId: copyId, status: { in: ["ACTIVE", "OVERDUE"] } } });
  assert.equal(loans.length, 1);
  const copy = await prisma.bookCopy.findUniqueOrThrow({ where: { id: copyId } });
  assert.equal(copy.status, "BORROWED");
  assert.equal(copy.currentHolderId, loans[0].studentId);
});

test("return race: two desks check in the same loan -> it closes once, copy available, one audit row", async () => {
  const book = await makeBook(1);
  const student = await makeUser("STUDENT");
  const copyId = book.copies[0].id;
  await circulation.checkoutBookCopy({ copyId, studentId: student.id, dueDays: 7 }, assistant.id);

  const outcome = await race([1, 2].map(() => () => circulation.checkinBookCopy({ copyId }, assistant.id)));
  assert.deepEqual(outcome.unexpected, []);
  assert.equal(outcome.ok, 1);
  assert.equal(outcome.conflicts, 1);

  const loan = await prisma.loan.findFirstOrThrow({ where: { bookCopyId: copyId } });
  assert.equal(loan.status, "RETURNED");
  const copy = await prisma.bookCopy.findUniqueOrThrow({ where: { id: copyId } });
  assert.equal(copy.status, "AVAILABLE");
  assert.equal(copy.currentHolderId, null);
  assert.equal(await prisma.bookHistory.count({ where: { bookCopyId: copyId, action: "CHECKIN" } }), 1);
});

test("reserved copy: only the hold owner can check it out", async () => {
  const book = await makeBook(1);
  const [owner, other] = await Promise.all([makeUser("STUDENT"), makeUser("STUDENT")]);
  await reservations.createReservation({ bookId: book.id, holdDays: 2 }, owner);
  const copyId = book.copies[0].id;

  await assert.rejects(
    circulation.checkoutBookCopy({ copyId, studentId: other.id, dueDays: 14 }, assistant.id),
    (e: unknown) => isConflict(e),
  );
  await circulation.checkoutBookCopy({ copyId, studentId: owner.id, dueDays: 14 }, assistant.id);
  const copy = await prisma.bookCopy.findUniqueOrThrow({ where: { id: copyId } });
  assert.equal(copy.status, "BORROWED");
  assert.equal(copy.currentHolderId, owner.id);
});

test("cancel then checkout: a cancelled hold releases the copy to anyone", async () => {
  const book = await makeBook(1);
  const [owner, walkIn] = await Promise.all([makeUser("STUDENT"), makeUser("STUDENT")]);
  const hold = await reservations.createReservation({ bookId: book.id, holdDays: 2 }, owner);
  await reservations.cancelReservation({ reservationId: hold.id }, owner);

  const copyId = book.copies[0].id;
  assert.equal((await prisma.bookCopy.findUniqueOrThrow({ where: { id: copyId } })).status, "AVAILABLE");
  await circulation.checkoutBookCopy({ copyId, studentId: walkIn.id, dueDays: 14 }, assistant.id);
  assert.equal((await prisma.bookCopy.findUniqueOrThrow({ where: { id: copyId } })).currentHolderId, walkIn.id);
});

test("lapsed hold: a new request expires the old hold, releases its copy and audits it", async () => {
  const book = await makeBook(2);
  const student = await makeUser("STUDENT");
  const first = await reservations.createReservation({ bookId: book.id, holdDays: 2 }, student);
  // Simulate the hold lapsing while no expiry worker ran.
  await prisma.reservation.update({ where: { id: first.id }, data: { expiresAt: new Date(Date.now() - 60_000) } });

  const second = await reservations.createReservation({ bookId: book.id, holdDays: 2 }, student);
  assert.notEqual(second.id, first.id);
  assert.equal((await prisma.reservation.findUniqueOrThrow({ where: { id: first.id } })).status, "EXPIRED");
  assert.ok(first.bookCopyId);
  assert.equal(await prisma.bookHistory.count({ where: { bookCopyId: first.bookCopyId, action: "RESERVATION_EXPIRED" } }), 1);
  if (first.bookCopyId !== second.bookCopyId) {
    const released = await prisma.bookCopy.findUniqueOrThrow({ where: { id: first.bookCopyId } });
    assert.equal(released.status, "AVAILABLE");
    assert.equal(released.currentHolderId, null);
  }
  assert.equal(await prisma.reservation.count({ where: { bookId: book.id, studentId: student.id, status: "PENDING" } }), 1);
});
