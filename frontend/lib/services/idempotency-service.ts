import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { ServiceError } from "@/lib/errors";
import { VerifiedActor } from "@/lib/auth/verified-actor";

export type PrismaTransaction = Prisma.TransactionClient;

export interface IdempotencyExecutionResult<T> {
  statusCode: number;
  data: T;
}

export function computeRequestHash(payload: unknown): string {
  const serialized = JSON.stringify(payload ?? null);
  return crypto.createHash("sha256").update(serialized).digest("hex");
}

/**
 * Execute an operation with strong idempotency semantics within an atomic transaction.
 * - If key is omitted, simply executes the operation.
 * - If key is provided and was already completed, returns the previously cached response.
 * - If key was used with different request parameters, throws 409 Conflict.
 * - If a concurrent transaction commits with the same key, catches unique constraint P2002 and throws 409 Conflict.
 */
export async function withIdempotency<T>(
  tx: PrismaTransaction,
  options: {
    key?: string;
    route: string;
    actor: VerifiedActor;
    payload: unknown;
    ttlHours?: number;
    execute: () => Promise<IdempotencyExecutionResult<T>>;
  }
): Promise<T> {
  const { key, route, actor, payload, ttlHours = 24, execute } = options;

  if (!key || key.trim() === "") {
    const result = await execute();
    return result.data;
  }

  const trimmedKey = key.trim();
  const requestHash = computeRequestHash(payload);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);

  // 1. Check existing record
  const existing = await tx.idempotencyRecord.findUnique({
    where: {
      key: trimmedKey,
    },
  });

  if (existing) {
    if (existing.requestHash !== requestHash) {
      throw new ServiceError(
        "IDEMPOTENCY_KEY_REUSED",
        "Idempotency key was previously used with different request parameters",
        409
      );
    }

    const body =
      typeof existing.responseBody === "string"
        ? JSON.parse(existing.responseBody)
        : existing.responseBody;
    return body as T;
  }

  // 2. Execute work
  const result = await execute();

  // 3. Persist idempotency record
  const actorId = actor.type === "USER" ? actor.userId : actor.identifier;

  try {
    await tx.idempotencyRecord.create({
      data: {
        key: trimmedKey,
        actorId,
        operation: route,
        requestHash,
        responseStatus: result.statusCode,
        responseBody: result.data as Prisma.InputJsonValue,
        expiresAt,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ServiceError(
        "MUTATION_IN_FLIGHT",
        "A concurrent mutation with this idempotency key was committed or is in-flight",
        409
      );
    }
    // Also catch generic error with code P2002 for mocks
    if (typeof err === "object" && err !== null && "code" in err && (err as { code: unknown }).code === "P2002") {
      throw new ServiceError(
        "MUTATION_IN_FLIGHT",
        "A concurrent mutation with this idempotency key was committed or is in-flight",
        409
      );
    }
    throw err;
  }

  return result.data;
}
