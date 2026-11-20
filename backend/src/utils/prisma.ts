import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { getEnv } from "../config/env";

const env = getEnv();

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DB_POOL_MAX,
  connectionTimeoutMillis: env.DB_POOL_CONNECTION_TIMEOUT_MS,
  idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT_MS,
});

export const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
export default prisma;

let disconnecting: Promise<void> | undefined;

/** Idempotent teardown for graceful shutdown and tests. */
export function disconnectDatabase(): Promise<void> {
  disconnecting ??= prisma.$disconnect().then(() => pool.end());
  return disconnecting;
}
