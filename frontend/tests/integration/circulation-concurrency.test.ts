import "dotenv/config";
import assert from "node:assert/strict";
import { test } from "node:test";
import { createPrismaClientWithPool } from "../../lib/prisma";
import { requireTestDatabase } from "../helpers/database-environment";
import { VerifiedActor } from "../../lib/auth/verified-actor";
import { ServiceError } from "../../lib/errors";

const testDatabaseUrl = requireTestDatabase(process.env);
// The singleton is lazy: bind it to the validated test target before importing writers.
process.env.DATABASE_URL = testDatabaseUrl;
let requestBookReservation: typeof import("../../lib/services/reservation-service").requestBookReservation;
let cancelReservation: typeof import("../../lib/services/reservation-service").cancelReservation;
let checkoutBookCopy: typeof import("../../lib/services/circulation-service").checkoutBookCopy;
let checkinBookCopy: typeof import("../../lib/services/circulation-service").checkinBookCopy;
test.before(async () => {
  ({ requestBookReservation, cancelReservation } = await import("../../lib/services/reservation-service"));
  ({ checkoutBookCopy, checkinBookCopy } = await import("../../lib/services/circulation-service"));
});

{
  const { client: testPrisma, pool: testPool } = createPrismaClientWithPool({
    pool: {
      connectionString: testDatabaseUrl,
      max: 5,
      connectionTimeoutMillis: 2000,
      idleTimeoutMillis: 5000,
    },
    transactionOptions: {
      maxWait: 5000,
      timeout: 10000,
    },
  });

  const testStudentActor1: VerifiedActor = {
    type: "USER",
    userId: "test-student-concurrency-1",
    clerkId: "test_clerk_student_1",
    email: "student1@concurrency.test",
    role: "STUDENT",
  };

  const testStudentActor2: VerifiedActor = {
    type: "USER",
    userId: "test-student-concurrency-2",
    clerkId: "test_clerk_student_2",
    email: "student2@concurrency.test",
    role: "STUDENT",
  };

  const testAssistantActor: VerifiedActor = {
    type: "USER",
    userId: "test-assistant-concurrency-1",
    clerkId: "test_clerk_assistant_1",
    email: "assistant@concurrency.test",
    role: "ASSISTANT",
  };

  test("reserve/reserve race: exactly one reservation succeeds on a single copy", async () => {
    // Setup test fixtures in test database
    const book = await testPrisma.book.create({
      data: {
        title: "Concurrency Race Test Book",
        author: "Test Author",
        category: "Testing",
        copies: {
          create: {
            barcode: `CONCUR-RACE-${Date.now()}`,
            status: "AVAILABLE",
            condition: "MINT",
            version: 0,
          },
        },
      },
      include: { copies: true },
    });

    const targetCopy = book.copies[0];

    // Ensure student users exist in test database
    await testPrisma.user.upsert({
      where: { id: testStudentActor1.userId },
      update: { isActive: true },
      create: {
        id: testStudentActor1.userId,
        clerkId: testStudentActor1.clerkId,
        email: testStudentActor1.email,
        firstName: "Student1",
        lastName: "Concurrency",
        role: "STUDENT",
        isActive: true,
      },
    });

    await testPrisma.user.upsert({
      where: { id: testStudentActor2.userId },
      update: { isActive: true },
      create: {
        id: testStudentActor2.userId,
        clerkId: testStudentActor2.clerkId,
        email: testStudentActor2.email,
        firstName: "Student2",
        lastName: "Concurrency",
        role: "STUDENT",
        isActive: true,
      },
    });

    // Fire 2 concurrent reservation attempts on the single available copy
    const results = await Promise.allSettled([
      requestBookReservation(
        { bookId: book.id, copyId: targetCopy.id },
        testStudentActor1
      ),
      requestBookReservation(
        { bookId: book.id, copyId: targetCopy.id },
        testStudentActor2
      ),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    assert.equal(fulfilled.length, 1, "Exactly one concurrent reservation must succeed");
    assert.equal(rejected.length, 1, "Exactly one concurrent reservation must be rejected with conflict");

    const rejection = rejected[0] as PromiseRejectedResult;
    assert.ok(rejection.reason instanceof ServiceError);
    assert.equal(rejection.reason.statusCode, 409);

    // Verify copy state in DB
    const finalCopy = await testPrisma.bookCopy.findUnique({
      where: { id: targetCopy.id },
    });
    assert.equal(finalCopy?.status, "RESERVED");
    assert.equal(finalCopy?.version, 1);

    // Teardown
    await testPrisma.book.delete({ where: { id: book.id } });
  });

  test("same-key replay returns identical result without duplicate mutations", async () => {
    const book = await testPrisma.book.create({
      data: {
        title: "Idempotency Test Book",
        author: "Test Author",
        category: "Testing",
        copies: {
          create: {
            barcode: `CONCUR-IDEM-${Date.now()}`,
            status: "AVAILABLE",
            condition: "MINT",
            version: 0,
          },
        },
      },
      include: { copies: true },
    });

    const idempotencyKey = `idem-key-${Date.now()}`;

    // First request
    const firstResult = await requestBookReservation(
      { bookId: book.id, idempotencyKey },
      testStudentActor1
    );

    // Second request with same idempotency key
    const replayResult = await requestBookReservation(
      { bookId: book.id, idempotencyKey },
      testStudentActor1
    );

    assert.equal(firstResult.id, replayResult.id);

    // Verify only 1 reservation was created
    const reservationCount = await testPrisma.reservation.count({
      where: { bookId: book.id },
    });
    assert.equal(reservationCount, 1);

    // Teardown
    await testPrisma.book.delete({ where: { id: book.id } });
  });

  test("return/return race: exactly one check-in closes an active loan", async () => {
    // Setup book and copy
    const book = await testPrisma.book.create({
      data: {
        title: "Return Race Test Book",
        author: "Test Author",
        category: "Testing",
        copies: {
          create: {
            barcode: `CONCUR-RET-${Date.now()}`,
            status: "BORROWED",
            condition: "GOOD",
            version: 1,
            currentHolderId: testStudentActor1.userId,
          },
        },
      },
      include: { copies: true },
    });

    const copy = book.copies[0];

    // Create active loan
    const loan = await testPrisma.loan.create({
      data: {
        bookCopyId: copy.id,
        studentId: testStudentActor1.userId,
        assistantId: testAssistantActor.userId,
        status: "ACTIVE",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    // Fire 2 concurrent check-in calls
    const results = await Promise.allSettled([
      checkinBookCopy({ copyId: copy.barcode }, testAssistantActor),
      checkinBookCopy({ copyId: copy.barcode }, testAssistantActor),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    assert.equal(fulfilled.length, 1, "Exactly one checkin must succeed");
    assert.equal(rejected.length, 1, "Second checkin must fail with conflict");

    const rejection = rejected[0] as PromiseRejectedResult;
    assert.ok(rejection.reason instanceof ServiceError);
    assert.equal(rejection.reason.statusCode, 409);

    // Verify loan is closed exactly once
    const updatedLoan = await testPrisma.loan.findUnique({
      where: { id: loan.id },
    });
    assert.equal(updatedLoan?.status, "RETURNED");

    // Teardown
    await testPrisma.loan.delete({ where: { id: loan.id } });
    await testPrisma.book.delete({ where: { id: book.id } });
  });

  test("cancel and checkout coordination restores copy to available and allows checkout", async () => {
    const book = await testPrisma.book.create({
      data: {
        title: "Cancel Checkout Test Book",
        author: "Test Author",
        category: "Testing",
        copies: {
          create: {
            barcode: `CONCUR-CAN-${Date.now()}`,
            status: "AVAILABLE",
            condition: "MINT",
            version: 0,
          },
        },
      },
      include: { copies: true },
    });

    const copy = book.copies[0];

    // Student 1 reserves copy
    const reservation = await requestBookReservation(
      { bookId: book.id, copyId: copy.id },
      testStudentActor1
    );

    // Student 1 cancels reservation
    await cancelReservation(
      { reservationId: reservation.id },
      testStudentActor1
    );

    // Assistant checks out the newly available copy to Student 2
    const checkoutResult = await checkoutBookCopy(
      { copyId: copy.barcode, studentId: testStudentActor2.userId, dueDays: 14 },
      testAssistantActor
    );

    assert.ok(checkoutResult.loanId);
    assert.equal(checkoutResult.copyBarcode, copy.barcode);

    // Teardown
    await testPrisma.loan.delete({ where: { id: checkoutResult.loanId } });
    await testPrisma.book.delete({ where: { id: book.id } });
  });

  test.after(async () => {
    const { disconnectPrisma } = await import("../../lib/prisma");
    await disconnectPrisma();
    await testPrisma.$disconnect();
    await testPool.end();
  });
}
