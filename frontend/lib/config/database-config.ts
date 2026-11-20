import { z } from "zod";

type Environment = Readonly<Record<string, string | undefined>>;

const postgresUrl = z.string().trim().min(1).refine((value) => {
  try {
    const url = new URL(value);
    return ["postgres:", "postgresql:"].includes(url.protocol) && Boolean(url.hostname);
  } catch {
    return false;
  }
}, "Expected a PostgreSQL connection URL");

const positiveInteger = (fallback: number, maximum: number) =>
  z.string().trim().regex(/^[1-9]\d*$/).transform(Number)
    .pipe(z.number().int().min(1).max(maximum))
    .default(fallback);

const databaseEnvironment = z.object({
  DATABASE_URL: postgresUrl,
  DB_POOL_MAX: positiveInteger(10, 100),
  DB_POOL_CONNECTION_TIMEOUT_MS: positiveInteger(5000, 30000),
  DB_POOL_IDLE_TIMEOUT_MS: positiveInteger(10000, 600000),
  DB_TRANSACTION_MAX_WAIT_MS: positiveInteger(5000, 30000),
  DB_TRANSACTION_TIMEOUT_MS: positiveInteger(5000, 60000),
});

/** Validate configuration without including credentials or submitted values in errors. */
export function getDatabaseConfig(environment: Environment = process.env) {
  const result = databaseEnvironment.safeParse(environment);
  if (!result.success) {
    const fields = [...new Set(result.error.issues.map((issue) => issue.path[0]))];
    throw new Error(`Invalid database configuration: ${fields.join(", ")}. Check the database environment settings.`);
  }

  return {
    pool: {
      connectionString: result.data.DATABASE_URL,
      max: result.data.DB_POOL_MAX,
      connectionTimeoutMillis: result.data.DB_POOL_CONNECTION_TIMEOUT_MS,
      idleTimeoutMillis: result.data.DB_POOL_IDLE_TIMEOUT_MS,
    },
    transactionOptions: {
      maxWait: result.data.DB_TRANSACTION_MAX_WAIT_MS,
      timeout: result.data.DB_TRANSACTION_TIMEOUT_MS,
    },
  };
}

/** Prefer the migration endpoint; only fall back when DIRECT_URL is absent/blank. */
export function getMigrationDatabaseUrl(environment: Environment = process.env): string {
  const direct = environment.DIRECT_URL?.trim();
  const field = direct ? "DIRECT_URL" : "DATABASE_URL";
  const result = postgresUrl.safeParse(direct || environment.DATABASE_URL);
  if (!result.success) {
    throw new Error(`Invalid database configuration: ${field}. Set a valid PostgreSQL migration endpoint.`);
  }
  return result.data;
}
