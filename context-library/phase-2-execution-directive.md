# Phase 2 Autonomous Execution Directive

Updated: 2026-09-12. This document controls execution of ShelfSync Phase 2, Units U-15 through U-22. It does not replace the technical checklists in [plans.md](plans.md), the invariants in [architecture.md](architecture.md), or the implementation rules in [code-standards.md](code-standards.md).

## Mission

Complete Phase 2 in dependency order using a repeated inspect, implement, verify, review, repair, and resume cycle. Work on one bounded subunit at a time. Continue automatically after a subunit passes its gates. Do not declare a unit complete merely because code compiles or a helper exists.

The allowed terminal outcomes are:

1. **Complete:** every required gate has executable evidence.
2. **Partial — external qualification required:** all safe repository work is complete, but a named non-production environment, credential, provider fact, or owner-controlled operation is unavailable.
3. **Blocked:** the next safe action requires user authority, destructive production work, or a missing decision that materially changes the architecture.

When one gate is externally blocked, finish all independent work. Continue to another subunit only when doing so preserves the dependency order and does not pretend the blocked prerequisite passed.

## Authority Order

Apply instructions in this order:

1. The current user request.
2. Root `AGENTS.md`.
3. This execution directive.
4. [architecture.md](architecture.md) for boundaries and invariants.
5. [code-standards.md](code-standards.md) for implementation rules.
6. [plans.md](plans.md) for the canonical U-15 through U-22 scope and gates.
7. [project-overview.md](project-overview.md) and [ui-context.md](ui-context.md) for product and interface requirements.
8. [progress-tracker.md](progress-tracker.md) for observed status and evidence.

If documents conflict, follow the higher authority and correct the lower document during the same subunit. Historical U-00 through U-14 content remains archival context and must not override Phase 2.

Before implementation, read every document above completely. Inspect the current Git status and working-tree diff. Preserve user changes and unrelated files.

For Next.js changes, read the relevant installed guides under `node_modules/next/dist/docs/`. For Prisma, Clerk, NestJS, Fastify, Meilisearch, PostgreSQL, or k6 behavior that is version-sensitive, inspect installed package documentation or current primary documentation. Do not rely on remembered APIs.

## Fixed Constraints

- Do not add Dockerfiles, Docker Compose, Kubernetes, Redis, Kafka, RabbitMQ, a service mesh, or a second database.
- Do not provision paid services or cloud resources.
- Do not deploy, publish, rotate production secrets, migrate production data, repair production data, or load-test production without explicit user authorization.
- Do not change package manager or JavaScript runtime.
- Do not edit historical Prisma migrations. Add forward migrations.
- Do not run `prisma migrate reset` against shared or production data.
- Do not reset, revert, delete, or overwrite unrelated working-tree changes.
- Do not weaken tests, thresholds, validation, authentication, or types to obtain a pass.
- Do not use `any`, `ts-ignore`, `ts-nocheck`, fabricated metrics, fabricated test results, or documentation claims as substitutes for working behavior.
- Keep the target to one Next.js web application, one modular NestJS/Fastify API, and one worker process built from shared backend/domain code. Do not split into microservices.
- Use provider-neutral process and deployment documentation. The `infra/` directory may contain runbooks, proxy examples, environment contracts, and validation scripts, but no Docker artifacts.

## Unit Order

Follow the detailed requirements and gates in [plans.md](plans.md):

1. U-15A — baseline, pool configuration, and actor policy
2. U-15B — audit and schema expansion
3. U-15C — reservation and circulation correctness
4. U-15D — remaining writers and role synchronization
5. U-16A — rating projections and SQL reads
6. U-16B — production search and indexed fallback
7. U-16C — worker lifecycle and reliable projections
8. U-17A — repository relocation
9. U-17B — API foundation and worker move
10. U-18 — read-only catalog vertical slice
11. U-19 — authenticated read slices
12. U-20 — mutation and integration cutover
13. U-21 — boundary enforcement and deployment readiness
14. U-22 — capacity qualification and release evidence

Do not begin a dependent subunit while a prerequisite has unresolved P0–P2 defects. A parent unit stays partial until every required child and qualification gate passes.

## Status and Evidence Rules

Use these markers consistently:

- `[ ]` pending
- `[/]` implemented partially, unqualified, or externally blocked
- `[x]` complete with recorded evidence

The following are not completion evidence:

- A function or type with no production caller
- A value named `verified` that accepts arbitrary input
- A mocked concurrency test using one connection
- An integration test that did not execute
- A successful build alone
- A configured pool without a process/replica connection budget
- A submitted Meilisearch task without confirmed completion
- Virtual-user count without achieved concurrency and request-rate evidence
- An unexecuted migration or load-test script
- A documentation statement describing intended behavior

Record exact commands, results, test counts, environment class, and remaining limitations. Never convert an unavailable external test into a pass.

## Per-Subunit Work Cycle

Repeat this entire cycle for every subunit.

### 1. Inspect

1. Read the active checklist and its dependency gates.
2. Inspect Git status and the complete relevant diff.
3. Search every affected definition and call site with `rg`.
4. Compare documentation claims with runtime use.
5. Identify persistence, authentication, authorization, audit, cache, job, and external-IO boundaries.
6. Identify schema compatibility, data repair, rollout, and rollback concerns.
7. Identify which tests require real independent connections or external services.
8. Write a small implementation checklist for this subunit only.

### 2. Implement

Implement the smallest coherent slice that can be verified independently. Maintain strict TypeScript, single responsibility, Zod boundary validation, verified server identity, current database-role authority, transactional audit/outbox rules, bounded work, sanitized errors, and existing responsive behavior.

Every new module, interface, package, route, worker, or configuration value must have a concrete consumer. Do not introduce speculative abstractions.

For migrations, use expand, backfill, reconcile, constrain, switch consumers, and contract. Keep old and new application versions compatible during rollout.

During backend extraction, keep exactly one active writer per mutation. Never shadow a real mutation through two implementations.

### 3. Verify

Run focused tests first, then the affected workspace gates. At minimum for code changes:

```bash
npx tsc --noEmit
npm run lint
npm run build
git diff --check
```

Also run, when applicable:

- Unit and integration tests for the changed behavior
- Prisma formatting, validation, generation, and migration tests
- Real PostgreSQL concurrency tests with separate physical connections
- Actor, role, ownership, webhook, audit, and idempotency tests
- Query-plan and response-size checks
- Contract and OpenAPI parity tests
- Import-boundary tests
- Worker crash, lease, duplicate-delivery, and replay tests
- Search failure and task-completion tests
- Mobile and desktop E2E checks for changed UI
- k6 qualification only against an explicit non-production environment

If a command fails, investigate the root cause, fix it, and rerun the affected checks. Do not continue as though it passed.

### 4. Review One — Correctness and Security

Re-read the implementation as a skeptical security and database reviewer. Check for:

- Forged human or system actors
- Missing issuer, signature, expiry, audience, authorized-party, or webhook-signature verification
- Stale roles, inactive users, and ownership bypasses
- Caller-supplied actor IDs, roles, service names, or resource ownership
- Race conditions, lost updates, ABA transitions, duplicate active records, and partial commits
- Missing conditional-write count checks
- Inconsistent lock ordering and unsafe retries
- Missing idempotency, audit, inbox, or outbox evidence
- SQL/search-filter injection and unbounded inputs
- Secret, token, connection-string, or student-data leakage
- Test database safeguards that aliases, credentials, ports, or query parameters can bypass
- Private-data cache leakage

Record every finding with severity, file, and line.

### 5. Review Two — Performance and Operations

Start a fresh review without copying the first conclusion. Check for:

- Connection-budget arithmetic across replicas, workers, previews, and deployment surge
- Pool queueing, misleading or double-counted metrics, timeout ordering, and shutdown ownership
- Long transactions, lock waits, deadlocks, and missing recovery
- Unbounded `findMany`, JavaScript sorting/aggregation, catalog hydration, or synchronous fuzzy search
- Oversized or uncompressed JSON and unused response fields
- Excessive writes, GET-triggered writes, unchanged-value rewrites, and synchronous external effects
- Single-dependency bottlenecks and missing deadlines
- Worker lease, restart, retry, poison-job, and reconciliation behavior
- Search outage, index lag, and task-success handling
- Event-loop delay, heap/RSS growth, and response-size growth
- Development hot reload, production startup, graceful drain, and rolling-version compatibility
- Appropriate pending UI, optimistic UI reconciliation, accessibility, CLS, and responsive layout
- Static rendering or caching opportunities that preserve freshness and user isolation
- APIs that are easy for later developers to misuse

Record this review independently.

### 6. Repair and Repeat

Classify findings as P0, P1, P2, or P3. Fix every in-scope P0–P2 issue. Add regression tests where they prove the repair. Rerun verification and repeat both reviews.

Continue until one full review cycle produces no unresolved in-scope P0–P2 findings. P3 items may remain only when they are truly optional and are recorded honestly.

### 7. Synchronize and Resume

Update [plans.md](plans.md) and [progress-tracker.md](progress-tracker.md) with exact evidence and blockers. Update architecture or standards only when the established rule changed. Keep planned, implemented, and externally qualified behavior distinct.

Then automatically select and begin the next eligible subunit.

## Mandatory Cross-Cutting Checks

Apply these checks throughout U-15 through U-22.

### Authentication and Accountability

- Human identity originates from a server-verified Clerk boundary, not a plain claims object.
- The current active database user and role govern authorization.
- Malformed, unknown, stale, or mismatched role claims fail closed.
- Webhook actors exist only after signature verification.
- Worker identity is fixed by trusted bootstrap, not caller-selected input.
- Test actor factories remain outside production modules.
- Every domain mutation records the responsible actor in the same transaction as its audit evidence.

### Database Correctness

- Exact physical-copy identity is used for mutations.
- Exclusive state transitions use expected state, owner, and version predicates and require `count === 1`.
- Lock order is consistent and documented.
- Multiple-row invariants use a suitable row guard or serializable transaction with bounded retry.
- Concurrency tests use independent connections and assert final database state, audit, outbox, and idempotency results.
- GET operations do not mutate.

### Bounded Work and JSON

- SQL or the search engine filters, sorts, aggregates, and paginates before transfer.
- Growing lists use stable pagination with deterministic tie-breakers.
- Responses contain only needed fields and bounded arrays.
- Measure serialized response size on representative data.
- Verify compression through actual response headers where supported; do not claim it from configuration alone.
- Do not recompress already compressed media.

### External Dependencies

- Every external call has a deadline and explicit failure policy.
- PostgreSQL remains authoritative for circulation correctness.
- External effects use durable outbox processing after commit.
- Search outage cannot corrupt or duplicate circulation operations.
- Search task submission is not success; track terminal task state.
- Worker crash and duplicate delivery converge from durable state.

### Rendering and Caching

- Public stable content may be prerendered or boundedly cached when freshness rules permit.
- Availability and private data must not be incorrectly cached or shared between users.
- Do not convert the application into a static export.
- Use pending UI immediately; show irreversible success only after committed server confirmation.
- Optimistic actions require stable idempotency, typed conflict handling, rollback/refetch, and accessible feedback.
- Record why each significant route is static, dynamic, cached, or `no-store`.

## Current U-15A Findings to Revalidate

Do not assume these earlier findings remain valid; inspect the latest workspace and close them only with evidence:

1. A human actor resolver accepted an ordinary claims object without performing Clerk verification.
2. Actor helpers had no production call sites.
3. A universal internal secret plus caller-selected service name allowed service impersonation.
4. Test-database protection compared only exact URL strings.
5. The raw pool listener and PrismaPg `onPoolError` could count the same error twice.
6. Production disconnect lifecycle did not clearly disconnect the Prisma client and external pool exactly once.
7. A test-only actor factory was exported from a production module.
8. The integration test used a separate hardcoded pool instead of the application construction path.
9. U-15A.3 documentation claimed completion beyond demonstrated runtime integration.

If current code already fixes a finding, prove it with call-site inspection and tests. Do not reimplement it unnecessarily.

## Phase-Specific Control Points

The detailed deliverables remain in [plans.md](plans.md). Apply these additional gates:

### U-15

- Finish verified actor and pool lifecycle foundations before schema/audit expansion.
- Use forward-only expand migrations and representative non-production validation.
- Prove reserve/reserve, reserve/checkout, cancel/checkout, expire/checkout, return/return, ABA, and idempotency races.
- Prove two concurrent role changes cannot remove every active administrator.

### U-16

- Reconcile rating projections against source feedback under create, edit, moderation, unmoderation, and deletion.
- Remove request-path Fuse.js and JavaScript catalog sorting/aggregation.
- Prove more than 100 search results remain reachable and empty results do not trigger fallback.
- Prove worker recovery around commit, send, acknowledgment, lease expiry, duplicates, and out-of-order events.

### U-17

- Preserve existing behavior during npm-workspace relocation.
- Do not leak Prisma or backend-only code through shared contracts or Client Components.
- Verify current NestJS/Fastify/Node compatibility before adding dependencies.
- Generate OpenAPI and runtime contracts from the same validated schemas.

### U-18 through U-20

- Migrate one vertical slice at a time and remove the old dependency after parity passes.
- Preserve SSR, metadata, URLs, responsive behavior, authentication, ownership, and error semantics.
- Keep private reads `no-store` and prove two-user isolation.
- Preserve one active writer, stable idempotency, audit/outbox atomicity, and rollback routing.

### U-21

- Enforce web/API/database import boundaries.
- Remove backend secrets and persistence access from the web runtime.
- Document provider-neutral web/API/worker commands, routing, same-region placement, replica/surge/pool budgets, probes, draining, migration ownership, backup/restore, and rollback.
- Do not create Docker or Compose artifacts.

### U-22

- Use the dataset, workloads, thresholds, and evidence manifest defined in [plans.md](plans.md).
- Do not load-test Clerk login endpoints or production.
- Report achieved RPS, achieved concurrency, dropped iterations, route-family percentiles, conflict rate, unexpected failures, pool wait, database load, event-loop delay, memory, worker lag, and search lag.
- VU count alone is not concurrency evidence.
- A written k6 script without an executed approved environment keeps qualification partial.

## External Blocker Protocol

Legitimate blockers include a missing isolated PostgreSQL database, Meilisearch qualification instance, Clerk test credentials, provider topology, non-production deployment, representative restored dataset, or owner-approved destructive repair.

For each blocker:

1. Finish all safe independent implementation and validation.
2. Add fail-closed configuration checks.
3. State the exact missing non-secret fact or variable name.
4. Provide the exact safe resume command.
5. Keep the affected gate partial.
6. Never substitute production credentials, data, or fabricated evidence.
7. Consolidate repeated external needs into one blocker report.

## Final Repository Audit

After the last implementable unit, perform three independent repository-wide reviews:

1. Security and correctness: authentication, authorization, ownership, transactions, idempotency, audit, webhook verification, secrets, and migration safety.
2. Performance and reliability: query bounds, plans, pools, deadlines, payloads, search, workers, caches, memory, shutdown, recovery, and load-test validity.
3. Architecture and maintainability: dependency direction, DTO ownership, single writer/worker ownership, unused abstractions, compatibility paths, deployment/rollback clarity, documentation accuracy, and absence of Docker.

Fix all in-scope P0–P2 findings, rerun affected checks, and repeat the three reviews. Finish only after a complete audit cycle finds no unresolved P0–P2 issues other than explicit external qualification blockers.

## Required Final Report

Return one consolidated report containing:

1. Overall verdict: `COMPLETE`, `PARTIAL — EXTERNAL QUALIFICATION REQUIRED`, or `BLOCKED`.
2. A U-15A through U-22 matrix with status, implementation evidence, verification evidence, and blocker.
3. Changed files with purpose, tests, migration impact, and compatibility impact.
4. Every verification command and result, including failures and skipped external tests.
5. Findings and repairs from both per-unit reviews and all three final reviews.
6. Capacity evidence: dataset, environment, workload, achieved RPS/concurrency, route-family p50/p95/p99, failures, drops, pool/database/runtime/search/worker metrics, and correctness assertions.
7. Exact resume instructions for external blockers without exposing secrets.
8. Explicit confirmation that no Docker/Compose files were added, no production deployment or load test ran, no production data changed, historical migrations remained unchanged, unrelated user work was preserved, and documentation matches evidence.

Do not announce Phase 2 complete until every executable gate has passed and every remaining external qualification is visibly identified.
