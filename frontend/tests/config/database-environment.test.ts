import assert from "node:assert/strict";
import { test } from "node:test";
import { requireTestDatabase } from "../helpers/database-environment";

const valid = {
  ALLOW_DATABASE_INTEGRATION_TESTS: "true",
  TEST_DATABASE_URL: "postgresql://user:password@localhost:5432/library_test",
  TEST_DATABASE_HOST_ALLOWLIST: "localhost",
  DATABASE_URL: "postgresql://app:secret@production/library",
};

test("accepts an explicitly approved isolated test target", () => {
  assert.equal(requireTestDatabase(valid), valid.TEST_DATABASE_URL);
});

test("rejects missing opt-in, malformed targets, unapproved hosts and connection overrides", () => {
  for (const override of [
    { ALLOW_DATABASE_INTEGRATION_TESTS: undefined },
    { TEST_DATABASE_URL: undefined },
    { TEST_DATABASE_URL: "invalid-secret" },
    { TEST_DATABASE_URL: "postgresql://localhost/%invalid" },
    { TEST_DATABASE_HOST_ALLOWLIST: "other-host" },
    { TEST_DATABASE_URL: "postgresql://localhost/library" },
    { TEST_DATABASE_URL: "postgresql://localhost/library_test?host=production" },
  ]) assert.throws(() => requireTestDatabase({ ...valid, ...override }));
});

test("rejects application and migration aliases regardless of credentials or ports", () => {
  for (const field of ["DATABASE_URL", "DIRECT_URL"]) {
    for (const source of [
      valid.TEST_DATABASE_URL,
      "postgresql://different:secret@localhost/library_test?sslmode=require",
      "postgresql://different:secret@pooler-alias:6543/library_test",
    ]) assert.throws(() => requireTestDatabase({ ...valid, [field]: source }));
  }
});

test("validation errors do not expose supplied credentials", () => {
  assert.throws(() => requireTestDatabase({ ...valid, TEST_DATABASE_URL: "secret-value" }),
    (error: unknown) => error instanceof Error && !error.message.includes("secret-value"));
});
