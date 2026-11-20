import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ quiet: true });

const postgresUrl = z
  .string()
  .trim()
  .min(1)
  .refine((value) => {
    try {
      const url = new URL(value);
      return ["postgres:", "postgresql:"].includes(url.protocol) && url.hostname.length > 0;
    } catch {
      return false;
    }
  }, "Expected a PostgreSQL connection URL");

const boundedInt = (fallback: number, min: number, max: number) =>
  z.coerce.number().int().min(min).max(max).default(fallback);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: boundedInt(4000, 1, 65535),
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:3000")
    .transform((value) => value.split(",").map((origin) => origin.trim()).filter(Boolean)),
  DATABASE_URL: postgresUrl,
  DB_POOL_MAX: boundedInt(10, 1, 100),
  DB_POOL_CONNECTION_TIMEOUT_MS: boundedInt(5000, 1, 30000),
  DB_POOL_IDLE_TIMEOUT_MS: boundedInt(10000, 1, 600000),
  // Must cover a cold TLS connect plus one query; measured ~1.0s to a remote region (2026-11-20).
  DB_READY_TIMEOUT_MS: boundedInt(3000, 100, 30000),
  CLERK_SECRET_KEY: z.string().trim().min(1),
  CLERK_PUBLISHABLE_KEY: z.string().trim().min(1),
  TELEGRAM_BOT_TOKEN: z.string().trim().optional(),
  TELEGRAM_CHAT_ID: z.string().trim().optional(),
});

export type Env = z.infer<typeof envSchema>;

/** Validate configuration; errors list field names only, never values. */
export function parseEnv(source: Readonly<Record<string, string | undefined>>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const fields = [...new Set(result.error.issues.map((issue) => String(issue.path[0])))];
    throw new Error(
      `Invalid backend configuration: ${fields.join(", ")}. Copy backend/.env.example to backend/.env and set these values.`,
    );
  }
  return result.data;
}

let cached: Env | undefined;

export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}
