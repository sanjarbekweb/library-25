// Must be the first import of every integration test: binds the app's database module to the
// guarded test database before any module reads DATABASE_URL.
import dotenv from "dotenv";
import { requireTestDatabase } from "../helpers/test-database";

dotenv.config({ quiet: true });
const testUrl = requireTestDatabase(process.env);

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = testUrl;
process.env.DIRECT_URL = "";
process.env.DB_POOL_MAX = "20";
process.env.DB_POOL_CONNECTION_TIMEOUT_MS = "15000"; // Neon scale-to-zero cold start
process.env.PGSSLMODE ??= "require";
process.env.CLERK_SECRET_KEY ??= "sk_test_dummy_secret_for_integration_tests";
process.env.CLERK_PUBLISHABLE_KEY ??= `pk_test_${Buffer.from("example.clerk.accounts.dev$").toString("base64")}`;
