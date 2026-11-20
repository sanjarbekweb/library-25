# Code Standards

Updated: 2026-09-09. Applies to new hardening and extraction units. Historical U-00–U-14 instructions in plans.md do not override these standards. Existing violations are tracked work, not already-fixed behavior.

## Responsibility and Types

- Keep transport validation, authorization, use-case orchestration, persistence and integration IO in separate responsibilities. One application service may compose repositories using a single transaction; repositories must not start nested independent transactions.
- Strict TypeScript throughout. No any, ts-ignore, ts-nocheck or unsafe assertions hiding contract mismatches. Catch unknown and narrow typed service errors.
- Kebab-case files, PascalCase types/components, camelCase values. Avoid speculative abstractions.
- Zod validates configuration and all external boundaries: query/path/body, webhook payloads, job payloads and API responses. Use explicit response DTOs with ISO-8601 UTC timestamps, defined nullability and bounded arrays.
- Shared contracts contain schemas/types only, no Prisma, Node-only code, secrets or Next imports. UI maps DTO dates for display.
- Never spread entire database records into responses. Validate response schemas in integration tests and at the API client's trust boundary.

## Authorization and Audit

- The transport verifies Clerk credentials and creates a typed VerifiedActor. No caller-supplied actor IDs/roles or ambiguous internal-ID-or-Clerk-ID parameters.
- Forbid unverified or forged actor creation. Human actors MUST resolve through `resolveHumanActorFromSession` verifying both session claims and active database user state; database role is authoritative, and stale privilege claims fail fast. System actors MUST authenticate via `authenticateSystemActor` verifying `INTERNAL_SERVICE_SECRET`. Testing mocks must use explicitly named `unsafeCreateActorForTesting` and remain strictly restricted to test files.
- Check active status and current server-side permissions for each protected use case; apply ownership predicates to personal data queries. UI layout checks cannot authorize API access.
- Derive privileged roles from verified claims checked against current DB roles. Denials remain effective despite stale tokens; upgrades require refreshed matching claims.
- Audits carry immutable actor identity/type/role-at-time, action, entity ID, correlation ID and appropriate before/after state. Never log tokens, credentials or whole sensitive payloads.
- BookHistory is mandatory in the same transaction for copy mutations. DomainAudit covers non-copy changes. Runtime DB permissions prohibit update/delete of audit rows; migration credentials are separate.
- Root AGENTS.md must explicitly accommodate verified worker/webhook service principals before those writers ship. Never impersonate a student to attribute scheduled expiration.
- Retire/deactivate referenced entities; remove audit-destroying cascading deletes. Backfill unknown historical roles honestly.
- Serialize last-admin changes against a common DB guard; independent count-then-update checks are insufficient.

## Database Concurrency Patterns

Default: short Read Committed transactions with compare-and-set updates and uniqueness constraints. Moving findFirst inside a transaction is not a substitute for a conditional write.

For copy acquisition:
1. Resolve an exact copy identity; arbitrary substring matching must not choose a physical copy for mutation. Search can return candidates; the confirmed mutation uses its exact ID.
2. Read/lock the copy, then validate current state/holder and associated live reservation/loan using a consistent copy-first lock order.
3. Execute tx.bookCopy.updateMany with exact ID and expected state/owner/version. Require count === 1; otherwise roll back with a typed conflict.
4. Update the exact reservation/loan conditionally, append audits, outbox intent and idempotency response in that transaction.
5. Return committed DTO; external effects run after commit through durable processing.

- Add a monotonically increasing copy version for stale command detection; increment it on every relevant transition. Version prevents an old AVAILABLE snapshot from matching a later AVAILABLE lifecycle (ABA).
- Apply conditional writes to cancellation, expiration, return and maintenance as well as acquisition. A cancelled or fulfilled hold cannot release an unrelated current loan.
- Serialize reserved-copy checkout against cancellation/expiration using the same copy-first lock order. Determine expiry using database time at the guarded transition; use a consistent authoritative instant and explicit boundary tests.
- Use parameterized SELECT ... FOR UPDATE for exact-row coordination when related reads must be stable. Use FOR UPDATE SKIP LOCKED only for queue/candidate allocation where skipping busy rows is acceptable. Empty results mean no immediately claimable candidate, not proof of no inventory.
- Raw SQL belongs in typed repositories with parameter binding (Prisma.sql/tagged query), never interpolated values or identifiers.
- Use Serializable for multi-row predicates such as last-admin preservation when simpler common-row locking is unsuitable. Retry the whole transaction for serialization/deadlock errors, with jitter and at most 3 attempts inside the request deadline. Never retry validation, authorization or deterministic stock conflicts blindly.
- Partial unique indexes: loans(bookCopyId) WHERE status IN ('ACTIVE','OVERDUE'); reservations(bookCopyId) WHERE status='PENDING' AND bookCopyId IS NOT NULL; reservations(studentId,bookId) WHERE status='PENDING'. Clean existing duplicates through a reviewed, audited repair before adding constraints.
- Do not include current time in index predicates. Expire status explicitly under the same lock rules. A stale pending row may block a new hold until the worker or bounded authenticated command expires it safely.
- Keep count/rating state transactionally correct under concurrent edits. Lock a book's rating aggregate before feedback changes; update integer ratingSum and ratingCount by old/new visible contribution, plus sortable unrounded averageRating and histogram if stored. Cover create/edit/moderate/unmoderate/delete. Round for display only; reconcile with SQL.
- Define a unique direct-review identity (studentId, bookId) WHERE loanId IS NULL while retaining loanId uniqueness. Do not use findFirst that can overwrite a verified-loan review. Do not add a global student/book constraint that silently removes per-loan review history.
- Student edits must not automatically reset isModerated to false and republish an administrator-hidden review. Preserve hidden status until explicit admin unmoderation; use expected-version predicates for concurrent moderation/edit/delete.
- Protect feedback rating range and aggregate non-negativity with DB constraints; audits and outbox changes roll back with failures.

## PrismaPg and Pool Configuration

- Validate DATABASE_URL and positive bounded numeric pool settings at startup. Configure max, connectionTimeoutMillis and idleTimeoutMillis explicitly in PrismaPg's supported driver configuration. Inspect the installed adapter; do not assume Prisma engine URL options configure pg.
- One client/pool per process, shared by all module services. Preserve development singleton behavior. Never register process signal listeners (`SIGTERM`, `beforeExit`) inside shared database client modules (`lib/prisma.ts`); process lifecycle and graceful connection draining belong strictly to application bootstrap/runtime supervisors. `lib/prisma.ts` exports an idempotent `disconnectPrisma()` helper for application teardown.
- Integration tests touching database connections must strictly require `TEST_DATABASE_URL` and explicitly reject `DATABASE_URL` to protect live/shared data from unintended mutation.
- Pool telemetry must expose truthful counters queried directly from the active `pg.Pool` instance (`totalConnections`, `idleConnections`, `waitingRequests`, error counters).
- Production runtime URL uses the verified transaction pooler; DIRECT_URL is migration-only, resolved without evaluating a missing required env accessor first. Verify TLS and prepared-statement behavior against the selected provider/version.
- Never blindly append pgbouncer=true or statement_cache_size=0 from legacy Prisma engine recipes. The existing template is evidence of intended pooling, not proof of valid driver settings or deployed topology.
- Budget rolling-deploy surge, workers, previews and pooler database/user pairs. Raise max only after measuring waits and DB headroom. Track pool wait histogram and waitingCount, active connections and timeouts.
- U-15A.1 driver connection/acquisition timeout defaults to 5s: a measured remote development connection exceeded 1s. Configure DB_POOL_CONNECTION_TIMEOUT_MS explicitly for deployment. Proposed same-region staging ceilings remain pool acquisition 1s, DB statement 1s, lock wait 250ms, transaction maxWait 1s/timeout 2s, API deadline 3s; qualify these together rather than placing a 5s pool wait inside a 3s API deadline. Only driver pool and Prisma transaction settings ship in U-15A.1. These are failure ceilings, not the 200ms SLO; normal work must be far below them. Propagate deadlines and test cancellation rather than assuming a timed-out Promise cancels SQL.
- Transaction pooling cannot preserve session state across requests. Use transaction-local settings when needed; verify statement preparation support. Migrations run in a single controlled deployment job, never on every replica startup.

## API and Retry Contracts

Implemented U-15A.1 defaults: DB_POOL_MAX=10, DB_POOL_CONNECTION_TIMEOUT_MS=5000, DB_POOL_IDLE_TIMEOUT_MS=10000, DB_TRANSACTION_MAX_WAIT_MS=5000 and DB_TRANSACTION_TIMEOUT_MS=5000. These conservative defaults precede same-region deadline qualification; no statement/lock/API deadline is claimed implemented. Invalid values fail with field names only.

REST /api/v1 with explicit request/response schemas and OpenAPI parity. Preserve the envelope:

```ts
type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; requestId: string; details?: unknown } };
```

Replace details: unknown with operation-specific Zod-validated detail schemas at concrete boundaries. Never return boolean-plus-optional-data pseudo-unions.

| Status | Meaning |
| --- | --- |
| 401 | Missing/invalid credentials |
| 403 | Authenticated but forbidden/inactive |
| 404 | Missing resource or deliberately concealed non-owned resource |
| 409 | State/version/idempotency conflict |
| 422 | Boundary validation failure |
| 429 | Rate/admission limit; Retry-After |
| 503 | Dependency unavailable/deadline exhausted; actionable retry guidance |
| 500 | Unexpected defect; sanitized message and request ID |

- Require Idempotency-Key for retryable circulation and create commands. Scope by actor + operation + key, store request hash and result atomically with domain writes, enforce uniqueness, reject different payload reuse, and replay identical committed results. Document retention (initial 24h) and behavior after expiry. Expected conflicts must be distinguishable from internal failures.
- Reauthorize before replaying protected results. Network timeouts may hide committed writes: query/retry with the same key; never generate a new key automatically.
- Reads: limit 1–100, search query length <=200, enumerated sort/filter fields. Catalog may use bounded offset pagination (maximum offset 10,000); growing loan/audit lists use stable cursor order with ID tie-breakers. Requests above bounds fail validation rather than triggering scans.
- Validate/escape search filter values; never interpolate untrusted category syntax. Differentiate exact DB totals and estimated search totals in contracts.
- Bearer-auth API does not accept ambient cookies as an alternative mutation credential. Thin cookie-authenticated Next actions retain origin/CSRF protections. Use exact origin allowlists if cross-origin routing is later enabled; CORS is not authorization.
- Bound body sizes, upload size/type and HTTP concurrency. Verify uploaded objects before publishing URLs. Use Fastify-compatible upload/raw-body middleware. Webhook signature verification uses the original bytes.
- Deduplicate webhook event IDs transactionally. Guard out-of-order profile events and deletion tombstones; role sync must not be overwritten by stale profile payloads.
- User role/status mutation and outbox/audit commit in PostgreSQL first; Clerk delivery retries out of transaction. Define reconciliation and fail-closed handling of missing accounts.

## Search, Jobs and Cache

- No request-path Fuse or unbounded findMany. SQL/search performs aggregate, rank and paginate before transfer. Hydrating/reordering only a selected page for serialization is allowed.
- Outbox intents are written with domain changes. Workers lease bounded batches, acknowledge only successful external completion, retry with capped exponential backoff/jitter, and expose failed jobs for replay. A crashed worker cannot lose work.
- Meilisearch task IDs must be tracked to success/failure. Bound polling and per-book work; do not let older document submissions overwrite newer state. Test restart, duplicate delivery, lease expiry, task failure and reconciliation.
- Expiration uses bounded copy-first transactions and an accountable worker. GET never mutates. If allocation must expire an old hold synchronously, do it as part of the authenticated command with explicit audit attribution.
- API domain modules contain no next/cache imports. Next owns rendering concerns; API owns domain freshness. Personal data and mutable availability start with no-store.
- Do not claim immediate global invalidation with per-instance Next cache. Shared cache adoption requires coordinated tags, cold-cache testing, key isolation and a measured end-to-end freshness bound.
- Operational logs/metrics omit secrets and student PII; include request/operation identifiers, latency, query counts, lock waits, worker lag and dependency outcomes.

## UI and Verification

- Follow [ui-context.md](ui-context.md) and root AGENTS.md. Use semantic Tailwind v4 tokens from globals.css; no arbitrary palette additions.
- Server Components fetch the target API directly for SSR. Client interactions use a typed client; avoid fetch/useEffect waterfalls. Thin Server Actions are transport adapters only after extraction.
- Keep zero-CLS skeletons, mobile reflow, touch targets, keyboard access and actionable library copy.
- Verify real PostgreSQL concurrency using separate clients/connections, plus role/object boundaries, audit integrity, idempotency, migration compatibility and search task failures.
- Run typecheck/build/lint for affected workspaces, contract parity and relevant integration/E2E tests. Documentation-only updates require link, consistency, history-preservation and diff checks, not an application build.
