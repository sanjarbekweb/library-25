# Architecture Context

Updated: 2026-09-12. This document defines the approved target and migration constraints. Implementation status belongs in [progress-tracker.md](progress-tracker.md); planned controls are not claims about deployed behavior.

## Current Implementation and Audit

The repository currently runs Next.js 16.3.1, React 19, Prisma 7 with PrismaPg, PostgreSQL, Clerk, Meilisearch, and Tailwind v4. Pages/actions call services directly. Services import Next cache helpers; search helpers also query Prisma, contrary to the old isolation rule.

Confirmed gaps:
- Database pooling & lifecycle: `lib/prisma.ts` now manages an explicit `pg.Pool` passed directly to `PrismaPg`, exposing truthful pool metrics (`totalConnections`, `idleConnections`, `waitingRequests`, error counters) queried directly from the active driver pool. Process shutdown listeners (`SIGTERM`, `beforeExit`) belong strictly to the application bootstrap/container lifecycle (e.g. Next.js server runtime or NestJS bootstrap), not shared client data modules. An idempotent `disconnectPrisma()` helper is provided for teardown. Test harnesses strictly require `TEST_DATABASE_URL` and reject live `DATABASE_URL`. Live deployment topology qualification remains pending real provider metrics.
- Reservations select copies before an unconditional update. Checkout uses updateMany but does not include reservation ownership in its claim predicate. Cancel, expire, and check-in paths need the same transition discipline.
- Fuse builds/searches a catalog-wide index synchronously. Rating sorting fetches all matching IDs. Search truncates candidate IDs at 100. Analytics also fetches and aggregates loan history in Node.
- Search writes acknowledge task submission, not task success; failure is swallowed without durable replay.
- BookHistory lacks actorRole and has cascading foreign keys. General domain mutations lack a consistent audit record.
- Role/status changes cross PostgreSQL and Clerk without atomic delivery; last-admin checks race. Proxy protects /catalog and /api/search despite documents calling catalog public.
- Completed feature milestones and build checks do not establish capacity.

## Decision: Harden, Then Extract a Modular Backend

Option A, scaling Next.js in place, can meet the same workload if queries, transactions, pooling, and deployment are corrected. It minimizes migration cost but retains runtime and framework coupling.

Selected Option B follows the user's frontend/backend separation requirement: one npm-workspace monorepo, independently deployable Next.js web and NestJS/Fastify API. Use supported Node.js LTS after compatibility verification. Nest provides module structure and a supported Fastify adapter, not a capacity guarantee. Bun/Hono is deferred because a second runtime migration offers no measured benefit here. Avoid microservices, Kubernetes, Kafka, and Redis by default.

Harden the existing writer first. Move one vertical slice at a time; each operation has exactly one active writer. Next remains responsible for SSR, metadata, layouts and presentation; it is not converted to a static SPA.

## Target Structure and Ownership

```text
apps/web/                     Next.js pages, components, typed API client
apps/api/src/
  auth/                       verified request principals and policy guards
  catalog/                    catalog reads and title/copy management
  circulation/                reservation, checkout, return and expiration use cases
  feedback/                   reviews and moderation
  users/                      lifecycle, roles and active status
  history/                    authorized audit queries
  analytics/                  bounded SQL aggregates
  integrations/               Clerk, Meilisearch, R2 and Telegram adapters
  jobs/                       worker bootstrap, dispatch and leases
  infrastructure/             database lifecycle, logging and transport
packages/contracts/           Zod request/response schemas; no runtime DB imports
packages/database/            Prisma schema, migrations and client factory
tests/integration/            real PostgreSQL correctness tests
tests/load/                   k6 workloads and fixture manifests
infra/                        provider-neutral proxy, process and deployment guidance
```

API domain modules own their repositories. Controllers parse/authorize/dispatch; application services orchestrate use cases and transactions; repositories issue persistence operations; integration adapters perform external IO. Do not create interfaces or packages without a concrete consumer. Cross-module mutations use explicit application services and one transaction context, never HTTP calls within a transaction.

The worker is a separate process built from the API code, reusing the same domain services. Only API/worker runtime and authorized migration/test tooling import packages/database. No Prisma client, generated database types, database URL, search admin key, R2 secret or Telegram secret reaches web. Contracts are explicit DTOs, not exported ORM records.

Routing: public origin /api/v1/* goes to API; remaining UI traffic goes to Next. SSR calls API through a fixed private same-region URL, never its own Next route. Thin Server Actions may forward authenticated requests and invalidate presentation data during migration. Independent API authorization remains mandatory.

## API Resource Map (Target)

The endpoint inventory is completed against existing actions/pages during U-17; this map defines ownership, not authorization to invent missing CRUD features. All routes below use /api/v1 except health probes. Mutations require the audit/idempotency rules in code-standards.md.

| Resource | Methods and paths | Owner / access |
| --- | --- | --- |
| Catalog | GET /books, /books/:id, /categories, /books/top-demand, /search | catalog; public target |
| Personal circulation | GET /me/loans, /me/reservations | circulation; current user only |
| Holds | POST /reservations; DELETE /reservations/:id | circulation; active student owner or explicitly authorized staff cancellation |
| Staff desk | GET /circulation/desk, /circulation/students, /circulation/copies | circulation; staff |
| Physical handoff | POST /circulation/checkouts, /circulation/checkins | circulation; staff |
| Catalog creation | POST /books, /books/:id/copies | catalog; staff |
| Reviews | POST /feedback; GET /feedback; PATCH /feedback/:id/moderation; DELETE /feedback/:id | feedback; student creation, admin listing/moderation/deletion |
| Audit | GET /history, /history/copies/:barcode | history; staff; student history via own-loans contract |
| Administration | GET /analytics, /users; PATCH /users/:id/role, /users/:id/status | analytics/users; admin |
| Integrations | POST /uploads, /webhooks/clerk, /contact | staff upload; signed webhook; contact preserves verified existing policy and abuse limits |
| Probes | GET /health/live, /health/ready | infrastructure; minimal public output, detailed dependency metrics internal |

Register static catalog paths before ambiguous ID matching or constrain ID routes. Route schemas include IDs, filters, pagination and response shape. API guards enforce resource ownership even when the web caller is trusted. Upload and contact flows must be inventoried for parity before cutover; no unsolicited new presigned-upload product flow.

## Stack & Infrastructure

| Component | Target and limits |
| --- | --- |
| Web | Existing Next.js/React/Tailwind stack; SSR preserved; same build across replicas |
| API | NestJS + Fastify on supported Node LTS, version-pinned during implementation |
| Database | PostgreSQL + Prisma 7; explicit driver pool and query/transaction deadlines |
| Pooler | One verified transaction-mode PgBouncer or provider-managed equivalent such as Supavisor; do not stack poolers without a reason |
| Search | Meilisearch required for normal typo-tolerant search; indexed PostgreSQL FTS plus pg_trgm fallback if supported and qualified |
| Background work | PostgreSQL transactional outbox/inbox and bounded workers; no external broker initially |
| Auth/media | Clerk and R2 retained; provider limits must be rechecked during deployment qualification |
| Deployment | Same-region web/API/database/search, reverse proxy, bounded replica counts and graceful shutdown |

Provisional staging sizing (benchmark hypotheses, not production requirements): two API replicas at 2 vCPU/2 GiB each, two web replicas at 1 vCPU/1 GiB each, worker at 1 vCPU/1 GiB, PostgreSQL at 2 vCPU/4 GiB with durable SSD, Meilisearch at 2 vCPU/2 GiB with persistent storage. Measure actual RSS, event-loop delay, database CPU/IO and index-build peaks before choosing production limits. One Node process does not parallelize synchronous JavaScript merely because two CPUs are allocated.

Budget two separate limits:
1. Sum of (maximum process count, including rolling-deploy surge, times local pool maximum) fits the pooler's client limit.
2. Sum of pooler server pools across database/user pairs, reserve pools, direct workers/tooling and operational reserve fits PostgreSQL's usable connection limit.

Start with max=10 per API process and max=2 per worker only if that arithmetic fits. Tune from measured transaction occupancy and queueing, not registered-user count. Export wait/active/idle connection metrics and cap admission independently of the pool. Migration tooling uses a verified direct or supported session endpoint; naming a URL DIRECT_URL does not prove it bypasses transaction pooling.

Free local development remains the baseline. Strict $0 production is not a performance invariant: if it remains an operational constraint, publish only demonstrated capacity. No paid resource is provisioned by this documentation change; production budget/provider selection remains open.

## Authentication, Authorization and Accountability

Every human mutation starts from server-verified Clerk identity: auth() in the current Next boundary and independently verified Clerk session tokens at the extracted API. Verify issuer, signature, expiry, authorized parties and configured audience where applicable; handle key rotation. Never trust actorId/actorRole, identity headers or object ownership supplied by a browser or by the web server alone.

Build a VerifiedActor from that identity plus a current active database account via `resolveHumanActorFromSession`:
- The resolver strictly checks that the Clerk user ID matches the database user's Clerk ID, and that the database account is active (`isActive === true`).
- Authorization authority derives from the database role. If claims request elevated permissions (e.g. `ADMIN` or `ASSISTANT`) that are not reflected in the current database user record, resolution fails with `STALE_ROLE_CLAIMS`.
- PostgreSQL is authoritative for application role/status changes; Clerk metadata is a synchronized projection. Generic profile webhooks must not overwrite application-controlled roles. Layout guards are UX only, not API security.

| Operation | Access |
| --- | --- |
| Public catalog/search/details | Public target; current proxy mismatch is explicit U-21 work |
| Own reservations and reviews | Active STUDENT; ownership checked server-side |
| Own loans | Active authenticated user |
| Checkout/check-in, catalog/copy management | Active ASSISTANT or ADMIN |
| Review moderation, role/status changes, analytics | Active ADMIN |
| All-copy audit history | Active ASSISTANT or ADMIN |
| Webhooks/jobs | Verified integration signature or authenticated internal execution context; no anonymous mutation exemption |

System jobs cannot fabricate a human `auth()` session. They must authenticate via `authenticateSystemActor` requiring a verified internal service secret (`INTERNAL_SERVICE_SECRET`, min 16 chars). Never use unauthenticated system actor instantiation. For test environments only, an explicitly named `unsafeCreateActorForTesting` helper exists and is restricted to test suites. Record actor type, service identity, role snapshot and causation/request ID. BookHistory remains mandatory for copy changes; a separate append-only DomainAudit covers users, titles, reviews and integration mutations without inventing a copy association. Legacy role snapshots remain unknown, never reconstructed from current roles.

## System Invariants

1. **Persistence isolation:** UI and HTTP controllers never query Prisma. Domain repositories own queries; application services own transaction composition. Search projection reads use an authorized repository.
2. **Immutable audit guarantee:** Every copy state/holder/condition mutation and its BookHistory entry commit together. Remove cascade paths that destroy history; use deactivation/retirement and restrictive foreign keys. General domain changes also carry actor-attributed DomainAudit.
3. **Verified identity:** Human actors originate from verified Clerk sessions; every protected operation checks current account status, roles and resource ownership. Service actors follow the explicit exception above.
4. **Credential isolation:** Backend secrets remain backend-only; search traffic uses least-privilege keys and validated queries.
5. **Atomic circulation:** Copy transition, loan/reservation transition, audit, idempotency result and outbox intent succeed or roll back together. A transaction alone does not prevent stale-state writes.
6. **Durable derived-data synchronization:** Commit an outbox intent with each catalog/copy/review mutation. A worker retries and confirms Meilisearch task success; DB commit never depends on search availability. This supersedes synchronous post-commit sync as the reliability guarantee.
7. **Analytics authority:** PostgreSQL computes aggregates with bounded result sets. Search is never the source for operational authorization, analytics or allocation.
8. **Evidence-based capacity:** Free development is retained; production sizing and cost are explicit. No blanket sub-200ms or 1,000-user readiness claim without the workload and gates in plans.md.
9. **Atomic Concurrency Locking:** All copy acquisition queries use conditional atomic updates (updateMany checking count === 1). Include expected state, owner/reservation and version where relevant. Release/return transitions receive equivalent guards. Locking candidate selection does not replace the final guard.
10. **Zero In-Memory Catalog Sorting:** All catalog pagination, sorting and aggregation execute at the database/search engine level. Apply the same bounded-query rule to analytics/history. Mapping a bounded result for serialization or preserving engine order is allowed; loading all rows to rank/count/slice is prohibited.
11. **One writer and retry safety:** A migrated operation has one owner; mutating retries use stable idempotency keys. No frontend/backend dual writes.
12. **Private cache isolation:** Personal/privileged data is not stored in public/shared response caches. Mutation results reflect committed state even if projections lag.

## Consistency and Failure Semantics

- Conditional transitions use a consistent lock order: resolve immutable identifiers; lock copy rows in ID order; then re-read/guard related reservations/loans. Never release a copy merely because a stale reservation ID exists.
- Enforce at most one active/overdue loan per copy and one pending reservation per copy, plus one pending reservation per student/title, using partial unique indexes. Expiration is a status transition; do not use now() in index predicates. Cross-table loan/reservation exclusivity still requires the guarded copy transition.
- Checkout of a reserved copy requires that exact unexpired hold, its holder and the expected copy version. Never fulfill a different-copy hold by replacing its copy ID. Check-in closes the exact active/overdue loan once.
- Search is eventually consistent; target visible index update within 5 seconds normally and alert above 30 seconds. Worker tasks are at-least-once, idempotent, bounded and ordered per book. Serialize per-book index submission through task completion; handle lease expiry/stale workers and reconcile current DB state periodically.
- Treat a legitimate empty search as empty. On an outage, use only the qualified indexed fallback, with circuit breaking and its own admission budget. If unavailable, return an actionable 503; never silently scan the catalog with Fuse. FTS alone does not provide typo tolerance; pg_trgm needs language/corpus tests.
- Search owns relevance/filter/sort/pagination and labels totals exact or estimated. PostgreSQL hydrates only that page in engine order; availability is advisory until the DB claim. Account for stale/deleted hits without fabricating exact totals.
- Cache ownership is explicit: initially use no-store for private and mutable availability data, and avoid layered mutable Next caches. Cache immutable assets freely. Any later public metadata cache needs a bounded staleness budget including every layer. Multi-replica Next invalidation requires shared coordination; local revalidateTag is not global.
- Keep external IO outside DB transactions. User role changes and webhook processing use durable outbox/inbox and version/order safeguards. Protect the last-active-admin invariant with a shared database lock or serializable transaction with bounded retries.
- Admission limits, request/body caps, dependency deadlines, graceful draining, backup/restore drills and degraded readiness checks are part of qualification. Search failure must not disable circulation; liveness must not fail solely because a dependency is down.

## Research and Version Notes

Reviewed 2026-09-09; these sources inform the design, not benchmark results:
- [Nest Fastify adapter](https://docs.nestjs.com/techniques/performance): supported adapter; Express-specific middleware requires compatible alternatives.
- [node-postgres Pool](https://node-postgres.com/apis/pool) and [PgBouncer configuration](https://www.pgbouncer.org/config.html): local/server pooling and transaction-mode constraints are distinct.
- [PostgreSQL partial indexes](https://www.postgresql.org/docs/current/indexes-partial.html) and [pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html): conditional uniqueness and indexed similarity.
- [Clerk verifyToken](https://clerk.com/docs/reference/backend/verify-token): verify tokens and authorized parties.
- [Meilisearch asynchronous operations](https://www.meilisearch.com/docs/capabilities/indexing/tasks_and_batches/async_operations): task acceptance differs from successful indexing.
- [Transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html): atomic intent with retry-safe consumers.
- [k6 open/closed workloads](https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/): use both active-user and arrival-rate tests.
- Installed Next.js guides: `node_modules/next/dist/docs/01-app/02-guides/self-hosting.md` and `backend-for-frontend.md`. They document multi-instance cache/action coordination and direct Server Component access to the data source; in the target, that source is the API.
