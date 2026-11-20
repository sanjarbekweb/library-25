import assert from "node:assert/strict";
import { test } from "node:test";
import { getDatabaseConfig, getMigrationDatabaseUrl } from "../../lib/config/database-config";

const runtimeUrl = "postgresql://test:secret@localhost:5432/library_test";

test("omitted settings give bounded driver and transaction defaults", () => {
  const config = getDatabaseConfig({ DATABASE_URL: runtimeUrl });
  assert.equal(config.pool.max, 10);
  assert.equal(config.pool.connectionTimeoutMillis, 5000);
  assert.equal(config.pool.idleTimeoutMillis, 10000);
  assert.deepEqual(config.transactionOptions, { maxWait: 5000, timeout: 5000 });
});

test("explicit settings reach the driver and transaction configuration as numbers", () => {
  const config = getDatabaseConfig({
    DATABASE_URL: runtimeUrl,
    DB_POOL_MAX: "2",
    DB_POOL_CONNECTION_TIMEOUT_MS: "500",
    DB_POOL_IDLE_TIMEOUT_MS: "30000",
    DB_TRANSACTION_MAX_WAIT_MS: "700",
    DB_TRANSACTION_TIMEOUT_MS: "4000",
  });
  assert.deepEqual(config.pool, {
    connectionString: runtimeUrl, max: 2,
    connectionTimeoutMillis: 500, idleTimeoutMillis: 30000,
  });
  assert.deepEqual(config.transactionOptions, { maxWait: 700, timeout: 4000 });
});

test("invalid pool settings cannot silently disable bounds or leak values", () => {
  for (const value of ["", " ", "0", "-1", "1.5", "Infinity", "101", "1e2", "secret-password"]) {
    assert.throws(() => getDatabaseConfig({ DATABASE_URL: runtimeUrl, DB_POOL_MAX: value }),
      (error: unknown) => error instanceof Error &&
        error.message.includes("DB_POOL_MAX") && !error.message.includes("secret"));
  }
  for (const field of ["DB_POOL_CONNECTION_TIMEOUT_MS", "DB_POOL_IDLE_TIMEOUT_MS", "DB_TRANSACTION_MAX_WAIT_MS", "DB_TRANSACTION_TIMEOUT_MS"]) {
    for (const value of ["0", "-1", "1.5", "999999999"]) {
      assert.throws(() => getDatabaseConfig({ DATABASE_URL: runtimeUrl, [field]: value }));
    }
  }
});

test("missing or non-PostgreSQL runtime URLs fail without exposing credentials", () => {
  for (const value of [undefined, "", "bad-secret-value", "https://user:secret@example.com/db"]) {
    assert.throws(() => getDatabaseConfig({ DATABASE_URL: value }),
      (error: unknown) => error instanceof Error &&
        error.message.includes("DATABASE_URL") && !error.message.includes("secret"));
  }
});

test("migration URL fallback works without eagerly requiring DIRECT_URL", () => {
  assert.equal(getMigrationDatabaseUrl({ DATABASE_URL: runtimeUrl }), runtimeUrl);
  assert.equal(getMigrationDatabaseUrl({ DATABASE_URL: runtimeUrl, DIRECT_URL: "  " }), runtimeUrl);
  const directUrl = "postgres://test:secret@localhost:5433/library_test";
  assert.equal(getMigrationDatabaseUrl({ DIRECT_URL: directUrl }), directUrl);
  assert.equal(getMigrationDatabaseUrl({ DIRECT_URL: directUrl, DATABASE_URL: "invalid" }), directUrl);
});

test("an explicitly invalid migration endpoint never silently selects the runtime database", () => {
  assert.throws(() => getMigrationDatabaseUrl({ DIRECT_URL: "bad-secret-value", DATABASE_URL: runtimeUrl }),
    (error: unknown) => error instanceof Error &&
      error.message.includes("DIRECT_URL") && !error.message.includes("secret"));
  assert.throws(() => getMigrationDatabaseUrl({}), /DATABASE_URL/);
});
