import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { getDatabaseConfig } from "./config/database-config";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Connection metrics tracker for operational health monitoring
const databaseMetrics = {
  poolErrorCount: 0,
  connectionErrorCount: 0,
  lastErrorTimestamp: null as Date | null,
};

let activeClient: PrismaClient | undefined;
let activePool: Pool | undefined;

export function getDatabaseMetrics() {
  const config = getDatabaseConfig();
  const pool = activePool ?? globalForPrisma.pool;

  return {
    totalConnections: pool?.totalCount ?? 0,
    idleConnections: pool?.idleCount ?? 0,
    waitingRequests: pool?.waitingCount ?? 0,
    poolErrorCount: databaseMetrics.poolErrorCount,
    connectionErrorCount: databaseMetrics.connectionErrorCount,
    lastErrorTimestamp: databaseMetrics.lastErrorTimestamp,
    configuredBounds: {
      max: config.pool.max,
      connectionTimeoutMillis: config.pool.connectionTimeoutMillis,
      idleTimeoutMillis: config.pool.idleTimeoutMillis,
      transactionMaxWait: config.transactionOptions.maxWait,
      transactionTimeout: config.transactionOptions.timeout,
    },
  };
}

/**
 * Creates a PrismaClient and its underlying pg.Pool using validated configuration.
 * Single source of construction for runtime, testing, and lifecycle management.
 */
export function createPrismaClientWithPool(
  customConfig?: ReturnType<typeof getDatabaseConfig>
): { client: PrismaClient; pool: Pool } {
  const config = customConfig ?? getDatabaseConfig();
  const pool = new Pool(config.pool);

  // Use adapter hooks exclusively for error tracking to prevent double-counting.
  const adapter = new PrismaPg(pool, {
    onPoolError: () => {
      databaseMetrics.poolErrorCount++;
      databaseMetrics.lastErrorTimestamp = new Date();
      console.error("[Database] An adapter pool error occurred.");
    },
    onConnectionError: () => {
      databaseMetrics.connectionErrorCount++;
      databaseMetrics.lastErrorTimestamp = new Date();
      console.error("[Database] An adapter connection error occurred.");
    },
  });

  const client = new PrismaClient({
    adapter,
    transactionOptions: config.transactionOptions,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  return { client, pool };
}

function getOrInitializePrisma(): { client: PrismaClient; pool: Pool } {
  if (activeClient && activePool) {
    return { client: activeClient, pool: activePool };
  }
  if (globalForPrisma.prisma && globalForPrisma.pool) {
    activeClient = globalForPrisma.prisma;
    activePool = globalForPrisma.pool;
    return { client: activeClient, pool: activePool };
  }

  const initialized = createPrismaClientWithPool();
  activeClient = initialized.client;
  activePool = initialized.pool;

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = initialized.client;
    globalForPrisma.pool = initialized.pool;
  }

  return initialized;
}

/**
 * Lazy proxy to defer pool/client construction until first operational access.
 * Prevents initialization failure during build or pure unit test imports.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const { client } = getOrInitializePrisma();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

/**
 * Explicit, idempotent database disconnect for application bootstrap teardown or tests.
 * Safely disconnects the Prisma client and closes the pg.Pool exactly once across all runtimes.
 */
export async function disconnectPrisma(): Promise<void> {
  try {
    const clientToDisconnect = activeClient ?? globalForPrisma.prisma;
    const poolToEnd = activePool ?? globalForPrisma.pool;

    activeClient = undefined;
    globalForPrisma.prisma = undefined;
    if (clientToDisconnect) {
      await clientToDisconnect.$disconnect();
    }

    activePool = undefined;
    globalForPrisma.pool = undefined;
    if (poolToEnd && !poolToEnd.ended) {
      await poolToEnd.end();
    }
  } catch (err: unknown) {
    console.error(
      "[Database] Error during disconnect:",
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}
