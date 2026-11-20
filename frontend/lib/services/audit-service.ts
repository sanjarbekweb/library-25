import { Prisma, PrismaClient, HistoryAction, DomainEntityType } from "@prisma/client";
import { VerifiedActor, isHumanActor } from "@/lib/auth/verified-actor";

export type DbClientOrTransaction = Prisma.TransactionClient | PrismaClient;

export interface RecordCopyAuditParams {
  bookCopyId: string;
  action: HistoryAction;
  actor: VerifiedActor;
  previousState?: string | null;
  newState?: string | null;
  notes?: string | null;
  correlationId?: string | null;
  causationId?: string | null;
}

export interface RecordDomainAuditParams {
  entityType: DomainEntityType;
  entityId: string;
  action: string;
  actor: VerifiedActor;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  correlationId?: string | null;
  causationId?: string | null;
}

/**
 * Appends an immutable BookHistory audit entry in the same transaction as a copy mutation.
 * Attributes actor identity, actorType, and role snapshot at the time of the event.
 */
export async function recordCopyAudit(
  tx: DbClientOrTransaction,
  params: RecordCopyAuditParams
) {
  const actor = params.actor;
  const isHuman = isHumanActor(actor);

  return tx.bookHistory.create({
    data: {
      bookCopyId: params.bookCopyId,
      action: params.action,
      actorType: isHuman ? "USER" : "SYSTEM",
      actorId: isHuman ? actor.userId : null,
      systemActor: isHuman ? null : actor.identifier,
      actorRole: isHuman ? actor.role : null,
      previousState: params.previousState ?? null,
      newState: params.newState ?? null,
      notes: params.notes ?? null,
      correlationId: params.correlationId ?? null,
      causationId: params.causationId ?? null,
    },
  });
}

/**
 * Appends an immutable DomainAudit entry for non-copy entity state mutations (User, Book, Feedback, etc.).
 * Attributes actor identity, actorType, and role snapshot at the time of the event.
 */
export async function recordDomainAudit(
  tx: DbClientOrTransaction,
  params: RecordDomainAuditParams
) {
  const actor = params.actor;
  const isHuman = isHumanActor(actor);

  return tx.domainAudit.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      actorType: isHuman ? "USER" : "SYSTEM",
      actorId: isHuman ? actor.userId : null,
      systemActor: isHuman ? null : actor.identifier,
      actorRole: isHuman ? actor.role : null,
      beforeState: params.beforeState
        ? (params.beforeState as Prisma.InputJsonValue)
        : Prisma.DbNull,
      afterState: params.afterState
        ? (params.afterState as Prisma.InputJsonValue)
        : Prisma.DbNull,
      correlationId: params.correlationId ?? null,
      causationId: params.causationId ?? null,
    },
  });
}
