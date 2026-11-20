// Test-only configuration. Must be imported before any module that reads the environment.
// DATABASE_URL points at a closed local port so no test can reach shared data.
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/library_test";
process.env.DB_POOL_CONNECTION_TIMEOUT_MS = "300";
process.env.DB_READY_TIMEOUT_MS = "1000";
process.env.CORS_ORIGIN = "http://localhost:3000";
process.env.CLERK_SECRET_KEY = "sk_test_dummy_secret_for_unit_tests";
// Syntactically valid publishable key (base64 of "example.clerk.accounts.dev$"); never contacted.
process.env.CLERK_PUBLISHABLE_KEY = `pk_test_${Buffer.from("example.clerk.accounts.dev$").toString("base64")}`;
