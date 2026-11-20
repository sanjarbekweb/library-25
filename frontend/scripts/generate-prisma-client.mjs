// Generates the frontend's Prisma client from the backend-owned schema.
//
// Prisma resolves the client output relative to the schema file, so running
// `prisma generate --schema ../backend/prisma/schema.prisma` from here would write
// into backend/node_modules (and leave the frontend without a client). Instead we
// mirror the schema into frontend/prisma/ (gitignored) and generate from that copy.
// Remove once the frontend no longer imports Prisma directly (plan U-21).
import { copyFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(frontendRoot, "..", "backend", "prisma", "schema.prisma");
const targetDir = join(frontendRoot, "prisma");
const target = join(targetDir, "schema.prisma");

mkdirSync(targetDir, { recursive: true });
copyFileSync(source, target);
execSync(`npx prisma generate --schema "${target}"`, { cwd: frontendRoot, stdio: "inherit" });
