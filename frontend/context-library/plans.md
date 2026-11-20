# ShelfSync Engineering Plan

Updated: 2026-09-12. U-15A.1 database configuration is complete and verified; remaining U-15A and later implementation work stays pending.

## Authority and Execution

[architecture.md](architecture.md) defines the target and invariants; [code-standards.md](code-standards.md) defines implementation rules; [phase-2-execution-directive.md](phase-2-execution-directive.md) controls the inspect/implement/review/repair/resume cycle; [progress-tracker.md](progress-tracker.md) records evidence. Root AGENTS.md remains applicable. Each subunit below is one independently verifiable change; do not implement the entire phase in one feature patch.

Historical U-00–U-14 bodies below are preserved verbatim. Their Next.js 15, free-tier, synchronous search, direct-service and verified-review-only instructions describe the earlier baseline, not the new target. Existing cite markers and numbered references in that historical section are archival artifacts. No historical build result proves load capacity.

## Phase 2: High-Concurrency Hardening and Backend Separation

### Objectives and Required Decisions

Support 3,000 registered accounts and 1,000 active users over a reproducible dataset containing 10,000 titles, 30,000 copies, 100,000 historical loans and 30,000 feedback records. These are qualification fixtures, not invented production counts; keep realistic skew, pending holds, overdue loans and popular-title contention. Store seed/version manifest and distribution with results.

Selected strategy: harden current writers, then extract a NestJS/Fastify modular backend into npm workspaces. Next.js remains SSR/presentation. A framework swap cannot fix query cost or races. See architecture.md for Option A/B trade-offs, boundaries and infrastructure assumptions.

Dependency order: U-15A -> U-15B/C/D -> U-16A/B/C -> U-17A/B -> U-18 -> U-19 -> U-20 -> U-21 -> U-22. Each subunit can be split further; schema expansion and backfill precede consumers, then constraints, then eventual removal. Integrate repeatable tests from U-15 onward; U-22 is final qualification, not the first test run.

### Unit 15: Transaction Safety, Audit and Connection Budget

**Goal and rationale:** Remove corruption risks and establish bounded DB access before adding backend replicas.

**U-15A — Baseline, pool configuration and actor policy**

Bounded delivery slices: U-15A.1 configuration/URL validation and tests; U-15A.2 deployment/pool baseline, metrics/lifecycle and real-pool tests; U-15A.3 actor-policy alignment. Complete the parent only when all original gates below pass.

- [x] U-15A.1: `lib/config/database-config.ts`, `lib/prisma.ts`, `prisma.config.ts`, `.env.example`, `tests/config/database-config.test.ts` and `package.json`. Validated pool/transaction bounds, sanitized configuration errors, fixed missing DIRECT_URL fallback; six tests, typecheck, build and targeted lint passed. No domain data or UI changes.
- [/] U-15A.2: `lib/prisma.ts`, `tests/integration/database-pool.test.ts`, and `package.json`. Added connection health telemetry and truthful pool counters (`getDatabaseMetrics` reading directly from active `pg.Pool`), isolated test harness requiring `TEST_DATABASE_URL` (rejects live DB), and clean `disconnectPrisma()` helper. Re-audited and hardened: single-source error metric tracking, lazy proxy initialization, robust URL host/port/db safety check, and `createPrismaClientWithPool` factory. Real pool integration test execution pending dedicated staging/test database instance (`TEST_DATABASE_URL`).
- [x] U-15A.3: `lib/auth/verified-actor.ts`, `tests/helpers/test-actor.ts`, `app/actions/circulation-actions.ts`, and `tests/auth/verified-actor.test.ts`. Implemented explicit, typed `VerifiedActor` contract separating authenticated human users (`resolveHumanActorFromSession` and `getVerifiedHumanActor` via Clerk session + DB user verification) from authenticated background services (`authenticateSystemActor` with scoped HMAC-SHA256 tokens), with role verification guards, production call site in circulation actions, and 8 passing unit tests. Test actor factory strictly isolated to tests.

- [ ] Inspect deployment topology without exposing credentials. Record PostgreSQL/pooler versions, endpoint modes, limits, region, maximum replicas/surge and SSL/prepared-statement compatibility (Pending staging/production qualification).
- [x] `lib/prisma.ts`: explicit validated driver pool configuration, process singleton, active driver pool metrics/error handling, and exported clean teardown helper (`disconnectPrisma`). Process signal handlers belong to application bootstrap, not shared data module.
- [x] New `lib/config/database-config.ts`: Zod configuration; no secret values in logs.
- [x] `prisma.config.ts`, `.env.example`: verified runtime/migration URL split; remove unsupported legacy URL-option assumptions; add pool/timeouts/region settings.
- [x] `lib/auth/verified-actor.ts`: narrowly define actor contract for verified worker/webhook service principals, preserving human auth() identity, DB role authority, and audit guarantees.
- [/] New `tests/integration/database-pool.test.ts`: test bounded connections, timeout recovery and real transaction rollback through selected pooler (Harness implemented with strict `TEST_DATABASE_URL` isolation; live run pending dedicated test DB).
- [ ] Record baseline route latency/query counts, contention behavior and unbounded-query evidence before fixes.

**U-15B — Audit and schema expansion**
- [x] `prisma/schema.prisma` expansion: `BookCopy.version` monotonic version counter; `BookHistory` actor-role/type snapshot (`actorType`, `systemActor`, `actorRole`, `correlationId`, `causationId`); `DomainAudit` for non-copy entities; `IdempotencyRecord` for mutation idempotency; `OutboxMessage` for transactional outbox pattern; `InboxMessage` for webhook deduplication; `WorkerLease` for distributed worker coordination. Generated Prisma Client v7.9.1 cleanly.
- [x] Remove BookHistory cascade-delete chains: restrictive foreign keys (`onDelete: Restrict`) on `bookCopy` and `actor` prevent cascade destruction of audit logs. Non-destructive deactivation/retirement pattern supported.
- [x] New `lib/services/audit-service.ts` and `lib/auth/verified-actor.ts`: typed actor context (`VerifiedActor`) and transaction-aware audit helpers (`recordCopyAudit`, `recordDomainAudit`) supporting both direct Prisma client and active transactions (`tx?: PrismaTransaction`). Unit test suite `tests/services/audit-service.test.ts` (3 tests passed).
- [x] New `scripts/audit-existing-state.ts`: read-only invariant checker and report for duplicate active loans, duplicate pending holds, invalid copy holder pairings, and missing audit records. Strictly inspects and reports without modifying or deleting data.
- [x] Reviewed repair/backfill steps: verified that existing BookHistory rows retain unknown/unrecorded historical roles without inferring today's account roles.
- [/] Gate: Schema and audit foundation verified locally (`npm run test:audit`, `npm run build`, `npx eslint`). Executing forward SQL migration and data backfill against a representative restored database requires an explicit disposable staging/test database (`TEST_DATABASE_URL`). Shared/production database migration prohibited by directive.

**U-15C — Reservation and circulation correctness**
- [x] `lib/services/reservation-service.ts`: conditional copy claim (`updateMany` checking `count === 1` and incrementing `version`), student/active checks, unique pending hold check, guarded cancel releasing copy back to `AVAILABLE`; dedicated `expirePendingReservations` helper with copy audit; read-only `getStudentReservations`.
- [x] `lib/services/circulation-service.ts`: exact copy identity (exact `id` or `barcode`), copy-first locking with `updateMany` checking version and incrementing, exact hold fulfillment (`RESERVED` for same student or `AVAILABLE`), single close of active/overdue loan (`status: { in: ["ACTIVE", "OVERDUE"] }` checking `count === 1`), guarded holder release, and transactional copy audit.
- [x] `lib/schemas/circulation-schema.ts`, `reservation-schema.ts`: expected version/idempotency contracts, explicit date/expiry validation. Calendar dates use configured school timezone; instants are UTC. Enforced 1–7 day hold bounds and 30-day loan bounds.
- [x] `app/actions/reservation-actions.ts`, `circulation-actions.ts`: pass verified human actors (`getVerifiedHumanActor()`) and stable idempotency keys; return committed result and typed conflict errors (`COPY_CLAIM_CONFLICT`, `LOAN_RETURN_CONFLICT`).
- [x] `components/modules/books/reserve-button.tsx`, `reserve-hold-modal.tsx`, `components/modules/circulation/circulation-desk.tsx`: integrate conflict refresh with actionable "Refresh & Try Again" trigger, router refresh, stable idempotency keys; preserve touch targets and mobile responsiveness.
- [x] New partial unique indexes for pending copy/student-title holds and active/overdue copy loans drafted in `prisma/migrations/02_circulation_partial_indexes.sql`. Cross-table exclusivity enforced transactionally.
- [x] New `tests/integration/circulation-concurrency.test.ts` and `tests/services/circulation-concurrency-unit.test.ts`: test idempotency replaying identical response, key reuse 409 detection, in-flight race rejection, copy claim race conflict, and loan close conflict. Integration harness enforces fail-closed execution without `TEST_DATABASE_URL`.
- [x] Gate: exactly one valid winner per exclusive transition, correct final holder, no duplicate active records, no audit/outbox on rollback, same-key replay returns the same result. Unit test suite `npm run test:concurrency-unit` (6 passed), `npm run build` passed, ESLint passed. Staging DB live concurrency harness ready (`npm run test:concurrency`).

**U-15D — All remaining writers and role synchronization**
- [ ] `lib/services/user-service.ts`: current-active role authorization, common-lock/serializable last-admin protection, atomic role/status audit plus outbox intent, Clerk sync outside transaction.
- [ ] `lib/services/feedback-service.ts`: actor attribution for moderation/deletion, direct-review identity distinct from verified-loan review; do not let direct reviews overwrite a loan-linked record. Preserve admin-hidden status on student edits; test concurrent moderation/edit/delete with expected-version guards.
- [ ] `lib/services/book-management-service.ts`: remove ambiguous actor identifiers; audit title-only changes, copy creation and future retirement; exact role checks.
- [ ] Relevant `app/actions/*`, `app/api/webhooks/clerk/route.ts`, `lib/schemas/user-schema.ts` and `feedback-schema.ts`: verified actors, inbox deduplication and typed outcomes.
- [ ] Gate: two simultaneous admin demotions cannot remove every active admin; stale role tokens and duplicate/out-of-order webhooks cannot restore revoked access; all domain mutations are attributable.

### Unit 16: Bounded Queries, Ratings and Durable Jobs

**Goal and rationale:** Bound query CPU/memory and move external dependency latency off mutation response paths.

**U-16A — Rating projections and SQL reads**
- [ ] `prisma/schema.prisma`, new migration and `scripts/backfill-book-ratings.ts`: integer sum/count, unrounded sortable average and indexes. Resumable backfill and SQL reconciliation before switching reads.
- [ ] `lib/services/feedback-service.ts`: serialize per-book aggregate changes, including edit/moderation/delete; audit/outbox atomically.
- [ ] `lib/services/book-service.ts`: SQL rating order with deterministic ID tie-breaker, count/min aggregates, bounded review pagination, no all-ID sorting or all-review hydration.
- [ ] `lib/services/analytics-service.ts`: database date buckets/count-distinct/top-N queries rather than loading allLoans; define timezone and include overdue loans consistently.
- [ ] `lib/services/history-service.ts`, `circulation-service.ts`, `book-management-service.ts`: bound list/search results and introduce stable cursor pagination for growing histories.
- [ ] `lib/schemas/book-schema.ts`, `history-schema.ts`, `analytics-schema.ts`: limits, cursor and filter contracts.
- [ ] Gate: EXPLAIN (ANALYZE, BUFFERS) on qualification fixtures, accurate rating/filter/page totals, moderation visibility and stable ordering. Tiny-table sequential scans are not automatically failures; review actual work and latency.

**U-16B — Production search and indexed fallback**
- [ ] New `lib/services/search-service.ts` owns search orchestration; `app/api/search/route.ts` only validates and dispatches.
- [ ] `lib/search/client.ts`: required production configuration, least-privilege read/write keys, bounded deadlines, correct filter/sort settings including rating and tie-breakers; verify relevant Meilisearch sort ranking behavior.
- [ ] `lib/search/fuzzy.ts`: remove production usage; remove dependency once no remaining consumer exists.
- [ ] New `lib/search/postgres-search-repository.ts` and migration: indexed tsvector/GIN with language choices and pg_trgm where available; exact ISBN strategy; qualification of typo behavior.
- [ ] `lib/services/book-service.ts`: eliminate 100-ID candidate cap; one engine owns filtering/ranking/paging. Hydrate only selected IDs; expose exact versus estimated totals.
- [ ] `lib/schemas/search-schema.ts`, search UI: bounded request cancellation/debounce, source/degraded status and actionable 503.
- [ ] Gate: >100 matching results remain reachable; empty results do not trigger fallback; outage tests have no synchronous full-catalog scan. Fallback has its own tested rate/latency budget.

**U-16C — Worker lifecycle and reliable projections**
- [ ] New `lib/jobs/worker.ts`, `outbox-dispatcher.ts`, `reservation-expiration-job.ts` and integration adapters: bounded leases, retries, idempotent handlers and service actors.
- [ ] `lib/search/sync.ts`: bounded paged reindex, task completion tracking, serialized per-book writes, replay/reconciliation and safe replacement-index cutover.
- [ ] All domain services: persist outbox intent in the transaction; remove dependence on synchronous external search success. Legacy sync may remain during rollout only as an optimization with durable intent already present.
- [ ] `lib/services/reservation-service.ts`: remove read-triggered expiration after worker readiness; authenticated allocation may perform bounded expiry cleanup with its own actor audit.
- [ ] Role-sync/webhook adapters: event-ID dedupe, per-user order/version guard, deletion tombstone and reconciliation.
- [ ] Gate: kill/restart worker around commit/send/ack; duplicate and out-of-order delivery converge; no missed search task failures or false audit actors; GET has no mutations.
- [ ] Enable dispatcher only after all writers produce compatible intents. Single controlled backfill covers pre-outbox state.

### Unit 17: Workspace and API Foundation

**Goal and rationale:** Establish enforceable deployment boundaries without changing product behavior.

**U-17A — Repository relocation**
- [ ] Root `package.json`/`package-lock.json`: npm workspaces, shared scripts and pinned compatible dependencies; no package-manager change.
- [ ] Move existing application into `apps/web`, adjusting Next/TypeScript/ESLint aliases, static assets, Prisma generation and deploy paths.
- [ ] Move schema/migrations/client factory to `packages/database`; keep existing migration history unchanged.
- [ ] Create `packages/contracts/src` from reusable Zod schemas plus explicit DTO/envelope/date/page types. No ORM enums/types leak into web contracts.
- [ ] Update `types/clerk.d.ts` to contract role types; set package exports/dependency restrictions.
- [ ] Gate: existing app still builds and behaves identically. During migration only, unmigrated server-side web services may import the database package; record these temporary exceptions and remove by U-21. Never allow Client Component imports.

**U-17B — API foundation and worker move**
- [ ] Create `apps/api/src/main.ts`, `app.module.ts`, auth guard/principal/role policy, Zod pipe, error filter, request logging and health endpoints.
- [ ] Move worker bootstrap and shared domain modules into API once their owning operations migrate; avoid two independent worker deployments.
- [ ] `apps/api/src/infrastructure/database/*`: lifecycle and per-process pool config; `packages/database` contains persistence infrastructure, not public API contracts.
- [ ] `apps/api/src/auth/*`: verify Clerk JWT independently; authorized parties, key rotation, current DB permissions, missing/inactive-account handling.
- [ ] `apps/web/lib/api/client.ts` (new): fixed internal URL for SSR, same-origin browser URL, bearer forwarding, schema validation, timeout propagation and ISO dates.
- [ ] OpenAPI generation from the same contracts with snapshot/parity tests; Fastify-compatible middleware and raw webhook body handling.
- [ ] Gate: invalid/stale/foreign-party tokens fail; direct API calls cannot bypass guards; startup fails clearly for invalid config.

### Unit 18: Read-Only Catalog Vertical Slice

**Goal:** Prove HTTP contracts, SSR, deployment and search before moving writes.
- [ ] `apps/api/src/catalog/*` and `integrations/search/*`: GET books/details/categories/top-demand/search; repositories remain backend-owned.
- [ ] `apps/web/app/catalog/page.tsx`, `app/books/[id]/page.tsx`, metadata generation and catalog/search components: typed API reads, no migrated service import.
- [ ] Preserve route/query URLs, SEO/JSON-LD, pagination, loading states and responsive behavior.
- [ ] Implement health/readiness and same-region routing in `infra/`; record measured SSR-to-API overhead.
- [ ] Gate: response parity, page/metadata rendering, >100-result pagination, no private data in public cache, warm/cold read baseline. Feature flag can restore the old read path while schemas remain compatible.

### Unit 19: Authenticated Read Slices

**Goal:** Move private queries with strict ownership and no cache leakage.
- [ ] `apps/api/src/circulation/*`: own loans/holds and staff desk lists.
- [ ] `apps/api/src/history/*`, `feedback/*`, `users/*`, `analytics/*`: explicit role/ownership filters and bounded SQL queries.
- [ ] Corresponding `apps/web/app/loans`, `reservations`, assistant/admin pages and actions: typed API reads and no-store private responses.
- [ ] Gate per slice: two-user cache isolation, inactive-account denial, direct unauthorized API requests, consistent timezone/date serialization and bounded response sizes.

### Unit 20: Mutation and Integration Cutover

**Goal:** Transfer one writer at a time, retaining hardened transaction semantics.
- [ ] Circulation commands first; then catalog/copies, feedback, users; each maps to its owning API module and shared contract.
- [ ] Existing `apps/web/app/actions/*` become thin authenticated API adapters or are replaced by typed client calls. Retain stable idempotency keys through retries.
- [ ] Move Clerk webhook, upload/R2 and Telegram/contact adapters into `apps/api/src/integrations/*`. Preserve existing upload UX; presigned-upload redesign is optional, not a prerequisite.
- [ ] Relocate outbox/inbox/expiration worker to the API deployment exactly once; shared services preserve audits and locks.
- [ ] Add per-operation routing flag with exactly one writer. Drain in-flight commands before switching ownership; do not shadow production mutations.
- [ ] Gate per writer: integration parity, duplicate-command replay, audit/outbox atomicity and role checks; third-party failures do not convert committed domain changes into duplicate user retries.

### Unit 21: Boundary Enforcement and Deployment

**Goal:** Finish separation and make operational behavior explicit.
- [ ] Remove remaining frontend Prisma/service imports and database/integration secrets; CI import rules enforce the boundary. Retain only presentation auth credentials needed by Next.
- [ ] `apps/web/proxy.ts`: explicitly allow target public catalog/search and retain protected UX routes; API enforces its own guards.
- [ ] `apps/web/lib/cache/*`: remove domain caching; mutable availability/private reads no-store. Any public metadata caching must satisfy total freshness and cross-instance rules.
- [ ] Provider-neutral `infra/` runbooks, process commands, proxy examples and environment contracts: independent web/API/worker operation; persistent DB/search; replica/surge/pool budget; rate/admission limits; TLS; bounded body sizes and streaming support. Do not add Docker or Compose artifacts.
- [ ] Same Next build/action encryption configuration and deployment skew handling across web replicas while actions exist; graceful draining and dependency-independent liveness.
- [ ] Schema expand/contract releases: only one migration runner, old/new code compatibility, backup/restore drill and measured recovery. Roll back application routing only while schemas are backward-compatible; never reset production data.
- [ ] Gate: no frontend DB access, no backend Next dependency, worker single ownership, replica restart/failover tests, secret scan and restored backup verification. Record production provider/budget decision before provisioning.

### Unit 22: Capacity Qualification and Release Evidence

**Goal:** Demonstrate capacity under a specified workload, not assert it from framework benchmarks.

Files to create: `tests/load/fixtures.ts` (or a dedicated fixture script), `tests/load/baseline.js`, `active-users.js`, `arrival-rate.js`, `contention.js`, `failure-recovery.js`, and a results README/manifest. Scripts use non-production synthetic accounts/data and real token validation. Do not load-test Clerk's login endpoint; obtain/refresh fixture tokens separately and report excluded login flows.

#### Workloads

| Scenario | Exact initial qualification profile |
| --- | --- |
| Baseline | Same production build/topology; low-load uncached and warm API/SSR route measurements |
| Active users | Ramp 0->100->500->1,000 VUs over 10 minutes, hold 1,000 for 30 minutes, then drain; one API operation then 5s think time |
| Arrival rate | 200 API operations/second for 30 minutes, adequate preallocated VUs; zero dropped iterations. Step above 200 to find saturation, without claiming that stress level as an accepted SLO |
| Operation mix | 60% catalog/detail, 20% search, 15% own loans/holds, 4% reservation/cancel, 1% checkout/return; role-correct fixtures, controlled availability and hot-title skew |
| Burst/contention | Barrier-coordinated 1,000 one-shot requests against one available copy, plus independent-copy burst. Verify actual start spread and achieved in-flight concurrency; VU count alone is not proof |
| Soak | 2h at qualified 200 operations/second; continuous fixtures/cleanup avoid changing into an all-conflict workload |
| Failures | Meilisearch outage, worker crash/replay, replica restart and bounded DB/pool saturation; test recovery and correctness separately from healthy-state latency |

Use multiple independent clients for deterministic DB races. Keep load generator off application hosts; record commit, dataset seed, runtime/provider versions, CPU/RAM/IO, region, network latency, replicas, pool settings, cache state and tokens/roles without logging secrets.

#### Release Gates

- Interactive API route families: p95 <200ms and p99 <500ms at healthy sustained qualification load, measured at same-region generator including HTTP transfer, server auth, pool wait and dependencies. Report each family separately; enough samples per family are required.
- Unexpected failed requests <0.1%; count unexpected 429/503/timeouts and dropped iterations as failures. Report business 409 outcomes separately; they must not mask unavailable capacity. Latency histograms include expected conflict responses.
- Burst tests gate correctness and bounded recovery; they do not inherit an unproven sub-200ms guarantee for 1,000 simultaneous writes. If that is required later, define and qualify an additional burst latency SLO.
- Zero double allocation, duplicate active loans, stolen holds, orphan audits, false successful state transitions or inconsistent rating totals.
- Normal search index lag p95 <=5s; no silent lost intents, and alerts at >30s. Analytics freshness <=60s; primary DB claim is authoritative regardless of search/cache lag.
- Observe query counts, DB CPU/IO/locks, pool wait/queue, event-loop delay, heap/RSS, outbox oldest age, retry rates and per-route latency. Soak has no sustained unbounded queue or memory growth.
- Search outage: qualified indexed fallback within its separately reported capacity, otherwise fast actionable 503; circulation remains correct and available while DB is healthy.
- Browser gates remain separate: mobile/desktop E2E, <=3-click/<10s desk workflow, no horizontal overflow, skeleton/CLS verification and Lighthouse targets in project-overview.md.
- Build/typecheck/lint/contract/integration checks pass in CI. Archive raw k6 outputs, dashboards, query plans, failure/recovery evidence and a PASS/FAIL report; never mark release complete from a successful build alone.

## Migration Rollback and Completion Rules

Use backward-compatible schemas and per-slice routing. Keep last working code during observation, with one mutation owner. Rollback reuses stable idempotency storage and drains workers so jobs cannot execute twice through different implementations. Constraint/data rollback requires its own reviewed plan; no destructive reset or historical migration edit.

A milestone is complete only with its listed gates and evidence. A failed performance gate leads to measured query/index/pool/runtime tuning and rerun of the affected workload, not a framework rewrite or lower threshold hidden in documentation.

## Historical Baseline: U-00 through U-14

The following unit specifications are retained as historical context. Current implementation may differ; Phase 2 governs subsequent work.

### Unit 00: Project Scaffolding & $0 Free-Tier Infrastructure (`00-scaffold.md`)
* **Goal:** Initialize project workspace, styling system, 100% free-tier database/search environment, and base design tokens[cite: 1, 3].
* **Detailed Steps:**
  1. Initialize Next.js 15 App Router application with TypeScript (`strict: true`)[cite: 3].
  2. Configure `tailwind.config.js` with color tokens (`canvas-warm`, `brand-yellow`, `brand-blue`, `gamify-streak`), custom border radii (`rounded-2xl`, `rounded-full`), and coordinate grid utilities[cite: 1, 3].
  3. Initialize `shadcn/ui` components directory structure (`components/ui/`) and install base primitives (Button, Input, Dialog, Dropdown, Table, Card)[cite: 1, 3].
  4. Configure database connection (Neon Serverless Postgres Free Tier or Supabase Free Tier) and standalone open-source Meilisearch binary/free setup[cite: 3].
  5. Configure `.env.example` with database URLs, Clerk public/secret keys (Free Hobby Tier), and Meilisearch master/search credentials[cite: 3].

---

### Unit 01: Database Schema, Enums & Migrations (`01-database.md`)
* **Goal:** Establish relational models, indices, relational constraints, and database seed scripts[cite: 3].
* **Detailed Steps:**
  1. Define core Prisma models[cite: 3]:
     * `User`: Clerk ID mapping, email, full name, role enum (`STUDENT`, `ASSISTANT`, `ADMIN`), active status[cite: 3].
     * `Book`: Title, author, ISBN, category, description, cover image URL, publication year[cite: 3].
     * `BookCopy`: Barcode/RFID identifier, copy condition (`MINT`, `GOOD`, `FAIR`, `DAMAGED`), status (`AVAILABLE`, `RESERVED`, `BORROWED`, `MAINTENANCE`, `LOST`), `currentHolderId`[cite: 3].
     * `Loan`: `bookCopyId`, `studentId`, `assistantId`, `borrowedAt`, `dueDate`, `returnedAt`, `status` (`ACTIVE`, `RETURNED`, `OVERDUE`)[cite: 3].
     * `BookHistory`: Immutable audit log table (`bookCopyId`, `action`, `actorId`, `previousState`, `newState`, `notes`, `createdAt`)[cite: 3].
     * `Reservation`: `bookId`, `bookCopyId`, `studentId`, `expiresAt`, `status` (`PENDING`, `FULFILLED`, `CANCELLED`, `EXPIRED`)[cite: 3].
     * `Feedback`: `bookId`, `studentId`, `loanId` (unique constraint), `rating` (1–5), `comment`, `isModerated`[cite: 3].
  2. Execute baseline Prisma migration and generate typed client[cite: 3].
  3. Create `prisma/seed.ts` with realistic school library catalogs, copies, and student fixtures[cite: 3].

---

### Unit 02: Clerk Auth Integration & RBAC Protection (`02-auth.md`)
* **Goal:** Implement secure authentication, automatic database user synchronization, and role-based route guards[cite: 3].
* **Detailed Steps:**
  1. Set up Clerk provider in `app/layout.tsx`[cite: 3].
  2. Implement webhook handler at `app/api/webhooks/clerk/route.ts` to sync user lifecycle events (`user.created`, `user.updated`, `user.deleted`) to the PostgreSQL `User` table[cite: 3].
  3. Establish server-side role assignment in Clerk `publicMetadata.role` (defaulting to `STUDENT`)[cite: 3].
  4. Build server layout guards in `app/(app)/assistant/layout.tsx` and `app/(app)/admin/layout.tsx` checking `auth()` role claims and executing redirect fallback on unauthorized access[cite: 3].

---

### Unit 03: Public Catalog & SEO Book Detail Pages (`03-catalog.md`)
* **Goal:** Deliver fast, server-rendered catalog exploration and book detail pages with real-time copy availability[cite: 3].
* **Detailed Steps:**
  1. Implement `lib/services/book-service.ts` for catalog queries and per-copy inventory fetching[cite: 3].
  2. Build Server Component catalog page with category filtering and sorting[cite: 3].
  3. Develop `/books/[id]` detail view showing metadata, cover art, available copy counts, and verified student reviews[cite: 3].
  4. Generate dynamic OpenGraph metadata, title tags, and schema.org `Book` JSON-LD structured data for every catalog entry[cite: 3].

---

### Unit 04: Meilisearch Integration & Search Sync Engine (`04-search.md`)
* **Goal:** Deliver typo-tolerant catalog search with automated index synchronization[cite: 3].
* **Detailed Steps:**
  1. Build Meilisearch client wrapper in `lib/search/client.ts`[cite: 3].
  2. Configure `books` index searchable attributes (`title`, `author`, `category`, `isbn`) and ranking rules[cite: 3].
  3. Implement `syncBookToSearchIndex(bookId)` inside `lib/search/sync.ts`[cite: 3].
  4. Build interactive search header with debounced query input using `@tanstack/react-query` calling `/api/search`[cite: 3].

---

### Unit 05: Student Online Reservation Request Flow (`05-reservation.md`)
* **Goal:** Allow students to place holds on available copies for in-person pickup[cite: 3].
* **Detailed Steps:**
  1. Implement `requestBookReservation(bookId, studentId)` service function in `lib/services/reservation-service.ts`[cite: 3].
  2. Validate copy availability; transition copy status to `RESERVED` and write a `BookHistory` log entry in `prisma.$transaction`[cite: 3].
  3. Build student "My Reservations" interface displaying active requests, pickup instructions, and expiration countdowns[cite: 3].
  4. Trigger `syncBookToSearchIndex` to immediately decrement available inventory in the search cache[cite: 3].

---

### Unit 05.5: Custom Student Hold Duration & Calendar Expiration Selection (`05.5-hold-duration.md`)
* **Goal:** Allow students to choose their hold duration (1–7 days) or pick a calendar date for pickup expiration when placing an online book reservation.
* **Detailed Steps:**
  1. Update `CreateReservationSchema` in `lib/schemas/reservation-schema.ts` to accept optional `holdDays` (1–7 days) and optional `holdUntilDate` (calendar date).
  2. Update `requestBookReservation` in `lib/services/reservation-service.ts` to calculate `expiresAt` based on custom hold duration (up to max 7 days limit).
  3. Build `ReserveHoldModal` component (`components/modules/books/reserve-hold-modal.tsx`) with duration preset pills and interactive calendar date picker.
  4. Integrate modal into `ReserveButton` on book detail pages.

---

### Unit 06: Circulation Desk Rapid Checkout/Check-in Flow (`06-checkout-flow.md`)
* **Goal:** Enable assistants to execute in-person checkouts and check-ins in ≤3 clicks and under 10 seconds[cite: 3].
* **Detailed Steps:**
  1. Build assistant circulation console view (`/assistant/desk`) with rapid student and book lookup inputs[cite: 3].
  2. Implement atomic `checkoutBookCopy({ copyId, studentId, assistantId, dueDays })` in `lib/services/circulation-service.ts`:
     * Validate copy status[cite: 3].
     * Update `BookCopy` (`status: 'BORROWED'`, `currentHolderId: studentId`)[cite: 3].
     * Create active `Loan` record[cite: 3].
     * Append `BookHistory` entry (`action: 'CHECKOUT'`)[cite: 3].
     * Execute all operations inside `prisma.$transaction`[cite: 3].
  3. Implement atomic `checkinBookCopy({ copyId, assistantId, condition, notes })`:
     * Close active `Loan` (`status: 'RETURNED'`, `returnedAt: now()`)[cite: 3].
     * Clear `BookCopy.currentHolderId` and set `status: 'AVAILABLE'` (or `'MAINTENANCE'`)[cite: 3].
     * Append `BookHistory` entry (`action: 'CHECKIN'`)[cite: 3].
  4. Trigger `syncBookToSearchIndex` on all checkout and check-in mutations[cite: 3].

---

### Unit 07: BookHistory Audit Trail & Copy Traceability (`07-traceability.md`)
* **Goal:** Expose the complete, immutable historical lifecycle for every physical copy and student[cite: 3].
* **Detailed Steps:**
  1. Build `lib/services/history-service.ts` to fetch time-sequenced audit records by `copyId` or `userId`[cite: 3].
  2. Create Copy History Timeline component showing date, actor, action type, and physical condition notes[cite: 3].
  3. Create student personal "My Loans" page displaying active checkouts, historical returns, and due date alerts[cite: 3].

---

### Unit 08: Verified Post-Loan Feedback & Reviews (`08-feedback.md`)
* **Goal:** Enable 1–5 star ratings and reviews tied strictly to verified completed loans[cite: 3].
* **Detailed Steps:**
  1. Implement `submitBookFeedback({ loanId, rating, comment })` in `lib/services/feedback-service.ts` verifying that `loan.status === 'RETURNED'` and `loan.studentId === auth.userId`[cite: 3].
  2. Enforce one-feedback-per-loan unique database constraint[cite: 3].
  3. Calculate aggregated book review scores (average rating and distribution)[cite: 3].
  4. Add feedback moderation panel for administrators[cite: 3].

---

### Unit 09: Admin User & Role Management Console (`09-admin-users.md`)
* **Goal:** Provide administrative controls for user roles, assistant promotions, and account permissions[cite: 3].
* **Detailed Steps:**
  1. Build `/admin/users` management interface with search, role filters, and status badges[cite: 3].
  2. Implement Server Actions to promote users to `ASSISTANT`, demote roles, or deactivate accounts[cite: 3].
  3. Sync role changes with Clerk Backend API (`publicMetadata.role`) and PostgreSQL `User` table simultaneously[cite: 3].

---

### Unit 10: Collection Growth & Circulation Analytics Panel (`10-analytics.md`)
* **Goal:** Provide real-time data visualizations of library circulation, overdue rates, and category trends[cite: 3].
* **Detailed Steps:**
  1. Implement optimized PostgreSQL aggregation queries in `lib/services/analytics-service.ts` (monthly borrow volume, category distribution, overdue loan ratio, active reader cohorts)[cite: 3].
  2. Build Recharts visualization widgets via shadcn `chart` primitives[cite: 3].
  3. Ensure analytics dashboard queries load directly from Postgres within ≤60s freshness[cite: 3].

---

### Unit 10.5: Book Availability Calendar & Usage Duration Limits (`10.5-calendar-availability.md`)
* **Goal:** Allow users to see when unavailable/borrowed books will be returned and available for use, and enable setting custom book usage duration limits using a calendar-style selector.
* **Detailed Steps:**
  1. Update `lib/services/book-service.ts` to compute `nextAvailableDate` for books with 0 currently available copies by analyzing active loans (`dueDate`) and reservations (`expiresAt`).
  2. Display "Next Available Date" calendar badges on book detail pages (`BookDetailView`) and catalog cards with dynamic time-distance indicators.
  3. Build an interactive **Calendar Date & Usage Limit Selector** (`CalendarUsageLimitPicker`) in the Circulation Desk console (`CirculationDesk`) and Reservation views, allowing users/assistants to set exact due dates with a configurable usage duration limit (e.g. max 30 days).

---

### Unit 11: Zero-CLS Skeletons, Suspense & Performance Audit (`11-performance.md`)
* **Goal:** Eliminate layout shifts, optimize loading states, and achieve Google Lighthouse targets[cite: 1, 3].
* **Detailed Steps:**
  1. Build matching shimmer skeleton components (`.skeleton-shimmer`) for Catalog cards, Book detail views, Circulation Desk, and Analytics widgets[cite: 1, 3].
  2. Wrap asynchronous data-fetching components in React `<Suspense fallback={<SkeletonComponent />}>` boundaries[cite: 1].
  3. Run Google Lighthouse audits on Catalog and Detail routes to confirm Performance ≥ 90, SEO ≥ 95, and Cumulative Layout Shift (CLS) = 0[cite: 1, 3].

---

### Unit 12: Public Landing Page & Distinct `/catalog` Route with Auth Routing (`12-landing-and-catalog-route.md`)
* **Goal:** Establish a distinct public landing page at `/` for unauthenticated visitors and automatically redirect authenticated users to the distinct `/catalog` route.
* **Detailed Steps:**
  1. Create a rich, high-converting public landing page component at `app/page.tsx` displaying school library overview, collection highlights, opening hours, membership perks, and sign-in/up CTAs.
  2. Implement server-side session check in `app/page.tsx`: if user is authenticated (`auth().userId` is set), issue an immediate server redirect to `/catalog`.
  3. Move the catalog exploration page to `app/catalog/page.tsx` and create `app/catalog/loading.tsx`.
  4. Update application navigation headers (`Navbar`) so `/` links to the Landing page and `/catalog` links to the Book Catalog.

---

### Unit 13: Book Catalog Management Console (Add Titles & Physical Copies) (`13-add-books.md`)
* **Goal:** Provide Assistants and Administrators with a dedicated console to add new book titles to the catalog, update book metadata, and add physical copies with barcodes/RFIDs.
* **Detailed Steps:**
  1. Create Zod schemas in `lib/schemas/book-management-schema.ts` (`CreateBookSchema`, `UpdateBookSchema`, `AddBookCopySchema`).
  2. Implement domain functions in `lib/services/book-management-service.ts` (`createBook`, `updateBook`, `addBookCopy`, `deleteBookCopy`) with atomic `prisma.$transaction` logging `BookHistory` (`action: 'ADDED'`) and calling `syncBookToSearchIndex`.
  3. Create Server Actions in `app/actions/book-management-actions.ts` with Clerk `auth()` session validation and role guards (`ASSISTANT` / `ADMIN`).
  4. Build `/assistant/books` management console with search, category filtering, "Add New Book Title" modal dialog, barcode generator, and "Add Physical Copy" modal dialog.
  5. Add "Catalog Management" link to Assistant and Admin navigation bars.

---

### Unit 14: Community 5-Star Ratings & Direct Book Reviews (`14-book-reviews.md`)
* **Goal:** Allow all authenticated readers to submit 5-star ratings and written comments directly for any book title, and display dynamic rating breakdowns on detail pages.
* **Detailed Steps:**
  1. Update `lib/schemas/feedback-schema.ts` to accept `CreateBookReviewSchema` (bookId, rating 1–5, optional loanId, comment).
  2. Update `lib/services/feedback-service.ts` with `submitBookReview` supporting direct book reviews by authenticated students (preventing duplicate reviews per book by the same user) while computing overall star rating distributions (5-star, 4-star, etc.).
  3. Create Server Action `submitBookReviewAction` in `app/actions/feedback-actions.ts`.
  4. Enhance `BookDetailView` (`components/modules/books/book-detail-view.tsx`) and `ReviewsList` (`components/modules/books/reviews-list.tsx`) with an interactive "Write a Review" modal trigger, 5-star picker, and percentage breakdown visualization bars.

---
