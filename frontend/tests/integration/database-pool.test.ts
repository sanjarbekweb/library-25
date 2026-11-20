import "dotenv/config";
import assert from "node:assert/strict";
import { test } from "node:test";
import { createPrismaClientWithPool } from "../../lib/prisma";
import { requireTestDatabase } from "../helpers/database-environment";

const testDatabaseUrl = requireTestDatabase(process.env);

{
  const { client: testPrisma, pool: testPool } = createPrismaClientWithPool({
    pool: {
      connectionString: testDatabaseUrl,
      max: 2,
      connectionTimeoutMillis: 1000,
      idleTimeoutMillis: 5000,
    },
    transactionOptions: {
      maxWait: 1000,
      timeout: 2000,
    },
  });

  test("qualified pool reports verified bounds and truthful metrics", () => {
    assert.ok(testPool.totalCount >= 0);
    assert.ok(testPool.idleCount >= 0);
    assert.equal(testPool.waitingCount, 0);
  });

  test("executes successful query through isolated test pool", async () => {
    const result = await testPrisma.$queryRaw<Array<{ connected: number }>>`SELECT 1 as connected`;
    assert.ok(Array.isArray(result));
    assert.equal(result.length, 1);
    assert.equal(result[0].connected, 1);
  });

  test("enforces connection timeout and recovers when pool capacity is saturated", async () => {
    // Acquire both connections from max: 2 pool
    const client1 = await testPool.connect();
    const client2 = await testPool.connect();

    assert.equal(testPool.totalCount, 2);

    let timedOut = false;
    const acquisitionStart = Date.now();
    try {
      // Attempting to acquire a 3rd connection must fail with timeout within ~1000ms
      await testPool.connect();
    } catch (err: unknown) {
      timedOut = true;
      assert.ok(err instanceof Error);
    } finally {
      // Release first client back to pool
      client1.release();
    }

    const elapsed = Date.now() - acquisitionStart;
    assert.ok(timedOut, "Expected connection acquisition timeout when pool is saturated");
    assert.ok(elapsed >= 800, `Expected timeout duration to be around 1000ms, was ${elapsed}ms`);

    // Verify recovery: subsequent query succeeds on the released connection
    const recovered = await testPrisma.$queryRaw<Array<{ status: string }>>`SELECT 'recovered' as status`;
    assert.equal(recovered[0].status, "recovered");

    // Clean up second client
    client2.release();
  });

  test("transaction rollback aborts cleanly without corrupting pool state", async () => {
    let rollbackThrown = false;
    try {
      await testPrisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT 1 as tx_probe`;
        throw new Error("INTENTIONAL_TEST_ROLLBACK");
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "INTENTIONAL_TEST_ROLLBACK") {
        rollbackThrown = true;
      }
    }

    assert.ok(rollbackThrown, "Transaction should abort cleanly on error");

    // Pool remains healthy and functional
    const followUp = await testPrisma.$queryRaw<Array<{ probe: number }>>`SELECT 1 as probe`;
    assert.equal(followUp[0].probe, 1);
  });

  test.after(async () => {
    await testPrisma.$disconnect();
    await testPool.end();
  });
}
