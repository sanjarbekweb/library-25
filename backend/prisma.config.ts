import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migrations prefer the direct (non-pooled) endpoint; blank DIRECT_URL falls back to DATABASE_URL.
const migrationUrl = process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim() || "";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: migrationUrl,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
