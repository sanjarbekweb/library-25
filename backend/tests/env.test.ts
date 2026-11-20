import "./setup-env";
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseEnv } from "../src/config/env";

const valid = {
  DATABASE_URL: "postgresql://user:secret-password@db.example.com:5432/library",
  CLERK_SECRET_KEY: "sk_test_x",
  CLERK_PUBLISHABLE_KEY: "pk_test_x",
};

test("applies defaults and splits CORS origins", () => {
  const env = parseEnv({ ...valid, CORS_ORIGIN: "http://a.test, http://b.test ,," });
  assert.equal(env.PORT, 4000);
  assert.equal(env.DB_POOL_MAX, 10);
  assert.deepEqual(env.CORS_ORIGIN, ["http://a.test", "http://b.test"]);
});

test("rejects missing and malformed values, naming fields without leaking values", () => {
  assert.throws(
    () => parseEnv({ ...valid, DATABASE_URL: "mysql://user:secret-password@host/db", CLERK_SECRET_KEY: "" }),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /DATABASE_URL/);
      assert.match(error.message, /CLERK_SECRET_KEY/);
      assert.doesNotMatch(error.message, /secret-password/);
      return true;
    },
  );
});

test("rejects out-of-range pool settings", () => {
  assert.throws(() => parseEnv({ ...valid, DB_POOL_MAX: "0" }), /DB_POOL_MAX/);
  assert.throws(() => parseEnv({ ...valid, DB_POOL_MAX: "1000" }), /DB_POOL_MAX/);
});
