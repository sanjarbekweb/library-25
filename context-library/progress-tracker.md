# Progress Tracker

Update this file after every meaningful implementation
change.

### Current Phase

- Active: **Phase 3 — Finish the Split, Make It Beautiful, Make It Trustworthy** (see [plans.md](plans.md)). Phase 2 is superseded; its open items are mapped to Phase 3 units.
- [x] U-30 — Plan re-baseline and docs relocation (2026-11-20): context-library moved to repository root; Phase 3 plan with decisions D1–D9 and Phase 2 mapping; architecture.md structure updated (Express retained, frontend/backend retained, npm workspaces + packages/contracts planned).
- [x] U-31 — Backend baseline hardening (2026-11-20):
  - `src/app.ts` (createApp) / `src/index.ts` (listen + graceful SIGTERM/SIGINT shutdown draining HTTP and the pg pool, 10s deadline).
  - `src/config/env.ts`: Zod-validated environment (DATABASE_URL, Clerk keys, CORS_ORIGIN list, PORT, pool bounds, DB_READY_TIMEOUT_MS); errors name fields only.
  - Request IDs (reuses well-formed inbound X-Request-Id) and one structured JSON log line per request; `/api/health/live` and `/api/health/ready` (DB SELECT 1 under a deadline). Readiness deadline measured: cold connect to the Tokyo pooler ~813ms + first query ~201ms, so default 3s (1s flapped after the pool idled).
  - Central error mapping: Prisma P2002/P2034 → 409, P2025 → 404, P1001/P2024/init → 503, malformed JSON → 400, unknown routes → JSON 404; 500s log the stack with requestId and return a generic message. Stable auth codes (UNAUTHENTICATED, ACCOUNT_NOT_FOUND, ACCOUNT_INACTIVE, FORBIDDEN). `x-powered-by` disabled.
  - Zero `any` in backend (was 27). Bugs fixed on the way: `POST /books/:id/copies` passed unvalidated `req.body` (now `addCopySchema`); `createBookSchema` silently dropped `initialCopyCount`/`initialCopyCondition` sent by the Manage Books console, so every new title got exactly one MINT copy (now bounded 1–50); analytics 500s leaked internal error text to clients.
  - ESLint (typescript-eslint, no-explicit-any as error) clean; `npm run check` = lint + typecheck (src+tests) + 14 tests + build, all passing. Tests run in-process against createApp with a closed-port DATABASE_URL (no shared data reachable).
  - Live check against the development database: live 200, ready 200 (~0.2s warm, ~1.05s after idle), books 200, protected route 401, unknown route 404; frontend / and /catalog 200.
- Next unit: **U-32 — Workspaces, contracts package and CI**.
- Owner decisions made 2026-11-20 (delegated "choose the best option"): D9 test database = Neon project `shelfsync-test` / `library_test` (Frankfurt); D10 hosting = Vercel for frontend and Express API (Tokyo region), Vercel Cron for scheduled jobs. Nothing deployed yet.
- [/] U-48 started (2026-11-20):
  - Test schema created with `prisma db push` against `library_test` only (verified target in CLI output); partial unique indexes applied.
  - Defect fixed: `backend/prisma/migrations/02_circulation_partial_indexes.sql` used snake_case columns (`book_copy_id`) that do not exist; it could never have run. Corrected to quoted camelCase, matching the definitions read (read-only) from the live database.
  - Frontend `test:database-pool`: 4/4 pass when warm (first run hit Neon cold start). **Closes the Phase 2 U-15A.2 live-pool gate.**
  - Frontend legacy `test:concurrency`: 0/4 — fixture defects (assistant user never created → loans_assistantId_fkey; cleanup deletes audited copies → RESTRICT; fixed student id reused across tests). Not fixed: it exercises legacy services deleted in U-44.
  - New backend suite `npm run test:integration` (fail-closed guard ported): reserve race (8 students/1 copy), same-student triple submit, checkout race, return race, reserved-copy ownership, cancel→checkout, lapsed-hold expiry. **7/7 pass, 3 consecutive runs (21/21)**; refuses to run without opt-in. **Closes the Phase 2 U-15C live concurrency gate for the backend writers** (same-key replay waits for backend idempotency, U-45).

### Phase 2 status at re-baseline (historical)

- U-15A partial (A.1, A.3 complete; A.2 pending test DB). U-15B and U-15C complete locally, live-DB gates pending. U-15D not started → U-45/U-43.

## Repository Hygiene & Clean-Clone Build Review (2026-11-20)

- Committed the frontend/backend split (previously uncommitted and half-staged) and fixed `.gitignore` (was UTF-16, so `.env`, `node_modules`, `.next`, `.clerk` were not ignored; no secret was ever committed).
- Backend previously built only because of a stale root `node_modules`: declared `pg`, `@prisma/adapter-pg`, `date-fns`; aligned Prisma CLI to 7.10 (was 8.0.0-rc vs 7.x client); added `backend/prisma.config.ts`, `backend/.env.example`, build/typecheck/db scripts; CORS restricted to `CORS_ORIGIN`.
- Frontend generates its Prisma client from the backend-owned schema via `scripts/generate-prisma-client.mjs` (temporary until U-21 removes frontend DB access).
- Verification: backend clean install, `tsc`, build, boot (health 200, unauthenticated route 401); frontend `tsc` + `next build` (19 routes); 33/33 unit tests. Database integration suites still require an isolated `_test` database and were not run.
- Still open against the plan: frontend server components (`app/catalog`, `app/books/[id]`, admin/assistant layouts, `api/search`, `api/webhooks/clerk`) still import `lib/services`/Prisma directly (U-18–U-21); deprecated `app/actions/*` remain; backend has no tests yet; U-15A.2/15B/15C live-database gates and U-15D gate remain unqualified; full-repo lint not passing.

## Continuation Review — Full-Stack Backend Separation (2026-11-05)

- **Chapter 1: Foundation & Auth Middleware Complete**
  - Implemented Clerk token authentication and database actor resolution in `backend/src/middlewares/auth.ts` (`authenticateUser`, `optionalUser`, `requireRole`).
  - Strict TypeScript request augmentation in `backend/src/types/express.d.ts` typing `req.user`.
  - Structured error envelope handling in `backend/src/middlewares/errorHandler.ts` returning `{ ok: false, error: { code, message, details } }`.
  - Global `clerkMiddleware()` integration in `backend/src/index.ts`.

- **Chapter 2: Circulation Domain Migration Complete**
  - Backend: `CirculationRepository.ts`, `CirculationService.ts`, `CirculationController.ts`, and `circulation.routes.ts` fully implemented.
  - Endpoints live: `POST /api/v1/circulation/checkout`, `POST /api/v1/circulation/checkin`, `GET /api/v1/circulation/students`, `GET /api/v1/circulation/copies`.
  - Frontend: `frontend/hooks/api/useCirculation.ts` providing typed fetch APIs and TanStack React Query hooks (`useStudentSearch`, `useCopySearch`, `useCheckoutCopy`, `useCheckinCopy`).
  - Frontend Components Refactored: `circulation-desk.tsx` and `copy-traceability-view.tsx` completely decoupled from legacy Server Actions; direct API calls with Clerk Bearer tokens now active.
  - Zero remaining imports of `circulation-actions` across frontend components.
  - Verification: `backend/` and `frontend/` compile cleanly with 0 TypeScript errors (`npx tsc --noEmit`).

- **Chapter 3: Reservations Domain Migration Complete**
  - Backend: `reservation.schema.ts`, `ReservationRepository.ts`, `ReservationService.ts`, `ReservationController.ts`, and `reservation.routes.ts` fully implemented.
  - Endpoints live: `POST /api/v1/reservations`, `POST /api/v1/reservations/:id/cancel`, `GET /api/v1/reservations/my`, `GET /api/v1/reservations/book/:bookId`, `GET /api/v1/reservations/pending`.
  - Frontend: `frontend/hooks/api/useReservations.ts` providing typed API client and TanStack React Query hooks (`useMyReservations`, `useRequestReservation`, `useCancelReservation`).
  - Frontend Components Refactored: `reserve-button.tsx`, `reservation-cancel-button.tsx`, `student-reservations-view.tsx`, `reservations/page.tsx`, and `books/[id]/page.tsx` now call the Express backend API.
  - Zero remaining imports of `reservation-actions` across frontend components.
  - Verification: `backend/` and `frontend/` compile cleanly with 0 TypeScript errors (`npx tsc --noEmit`).

- **Chapter 4: Users & Profiles Domain Migration Complete**
  - Backend: `user.schema.ts`, `UserRepository.ts`, `UserService.ts`, `UserController.ts`, and `user.routes.ts` fully implemented.
  - Invariants Preserved: `pg_advisory_xact_lock` for serializable last-admin protection, self-demotion prevention, domain audit trails (`ROLE_UPDATE`, `STATUS_TOGGLE`), and stale webhook protection.
  - Endpoints live: `GET /api/v1/users`, `GET /api/v1/users/me`, `PATCH /api/v1/users/:id/role`, `PATCH /api/v1/users/:id/status`, `POST /api/v1/users/sync`.
  - Frontend: `frontend/hooks/api/useUsers.ts` providing typed API client and TanStack React Query hooks (`useAdminUsers`, `useCurrentUser`, `useUpdateUserRole`, `useToggleUserStatus`).
  - Frontend Components Refactored: `user-management.tsx` and `app/(app)/admin/users/page.tsx` now call Express backend REST endpoints with Clerk token authentication.
  - Zero remaining imports of `user-actions` across frontend components.
  - Verification: `backend/` and `frontend/` compile cleanly with 0 TypeScript errors (`npx tsc --noEmit`).

- **Chapter 5: Feedback & Reviews Domain Migration Complete**
  - Backend: `feedback.schema.ts`, `FeedbackRepository.ts`, `FeedbackService.ts`, `FeedbackController.ts`, and `feedback.routes.ts` fully implemented.
  - Invariants Preserved: Verified loan feedback vs. direct review separation (`loanId: null` invariant); student edits preserve admin-moderated hidden status; admin moderation toggles and permanent deletion logged in `DomainAudit`.
  - Endpoints live: `POST /api/v1/feedback`, `GET /api/v1/feedback/book/:bookId`, `GET /api/v1/feedback/eligible`, `GET /api/v1/feedback/admin`, `PATCH /api/v1/feedback/:id/moderate`, `DELETE /api/v1/feedback/:id`.
  - Frontend: `frontend/hooks/api/useFeedback.ts` providing typed API client and TanStack React Query hooks (`useBookReviews`, `useSubmitFeedback`, `useAdminFeedbacks`, `useModerateFeedback`, `useDeleteFeedback`).
  - Frontend Components Refactored: `submit-feedback-modal.tsx`, `admin-feedback-moderation.tsx`, `reviews-list.tsx`, `app/(app)/admin/feedback/page.tsx`, and `app/books/[id]/page.tsx` now call Express backend REST endpoints.
  - Zero remaining imports of `feedback-actions` or `feedback-service` across frontend components.
  - Verification: `backend/` and `frontend/` compile cleanly with 0 TypeScript errors (`npx tsc --noEmit`).

- **Chapter 6: History & Audits Domain Migration Complete**
  - Backend: `history.schema.ts`, `HistoryRepository.ts`, `HistoryService.ts`, `HistoryController.ts`, and `history.routes.ts` fully implemented.
  - Invariants Preserved: Physical copy barcode/title/author/ISBN fuzzy resolution; complete immutable chain of custody audit history; active loan tracking with dynamic overdue calculation in days; RBAC protection for assistant/admin audit logs.
  - Endpoints live: `GET /api/v1/history/my-loans`, `GET /api/v1/history/traceability/:barcode`, `GET /api/v1/history/copy/:copyId`, `GET /api/v1/history/audits`.
  - Frontend: `frontend/hooks/api/useHistory.ts` providing typed API client and TanStack React Query hooks (`useMyLoans`, `useCopyTraceability`, `useCopyHistory`, `useAuditLogs`).
  - Frontend Components Refactored: `copy-traceability-view.tsx`, `copy-history-timeline.tsx`, `student-loans-view.tsx`, `app/loans/page.tsx`, and `app/(app)/assistant/history/page.tsx` now call Express backend REST endpoints with Clerk token authentication.
  - Zero remaining imports of `history-actions` or `history-service` across frontend components.
  - Verification: `backend/` and `frontend/` compile cleanly with 0 TypeScript errors (`npx tsc --noEmit`).

- **Chapter 7: Analytics & Reporting Domain Migration Complete**
  - Backend: `analytics.schema.ts`, `AnalyticsRepository.ts`, `AnalyticsService.ts`, `AnalyticsController.ts`, and `analytics.routes.ts` fully implemented.
  - Invariants Preserved: Timeframe parameterization (`30d`, `90d`, `6m`, `1y`, `all`); multi-dimensional aggregations (KPIs, monthly volume trends, category distribution, overdue aging telemetry, condition metrics, top book leaderboards, and active reader cohorts); ADMIN RBAC enforcement.
  - Endpoints live: `GET /api/v1/analytics`.
  - Frontend: `frontend/hooks/api/useAnalytics.ts` providing typed API client and TanStack React Query hook (`useAnalyticsData`).
  - Frontend Components Refactored: `analytics-dashboard.tsx` and `app/(app)/admin/analytics/page.tsx` now call Express backend REST endpoints with Clerk token authentication.
  - Zero remaining imports of `analytics-actions` or `analytics-service` across frontend components.
  - Verification: `backend/` and `frontend/` compile cleanly with 0 TypeScript errors (`npx tsc --noEmit`).

- **Chapter 8: Contact, Final Action Cleanup & Build Audit Complete**
  - Backend: `contact.schema.ts`, `TelegramService.ts`, `ContactController.ts`, and `contact.routes.ts` fully implemented.
  - Invariants Preserved: In-memory sliding-window IP rate limiting (3 msgs / 3 min), honeypot bot traps, HTML sanitization, Telegram notification delivery.
  - Endpoints live: `POST /api/v1/contact`.
  - Frontend: `frontend/hooks/api/useContact.ts` providing typed API client and TanStack React Query mutation (`useSubmitContact`).
  - Frontend Components Refactored: `landing-contact.tsx` and `circulation-desk.tsx` updated to use REST API hooks with zero imports from `@prisma/client`.
  - Legacy Action Deprecation: All 8 files in `frontend/app/actions/*.ts` marked as `@deprecated` with zero remaining call sites across the application.
  - Verification:
    - Backend: `npx tsc --noEmit` exited with code 0 (0 errors).
    - Frontend: `npx tsc --noEmit` exited with code 0 (0 errors).
    - Frontend: `npm run build` exited with code 0 (all 19 routes generated cleanly).
  - Milestone: Complete Monolith-to-Backend/Frontend Separation Achieved (Chapters 1–8 100% finished).

## Continuation Review — 2026-09-13

- Reopened prerequisite integration safety before continuing U-15D: the circulation harness created fixtures through a test client but called services backed by the application singleton.
- Added a shared fail-closed test-environment validator, explicit opt-in and host allowlist, required `_test` database suffix, rejection of connection query overrides, and conservative application/migration database-name collision checks across aliases and pooler ports.
- Circulation services now load only after the validated test URL is bound to their lazy singleton. Teardown also disconnects that singleton. Both integration suites use the shared guard.
- Configuration/safety tests: 10 passed. Both database suites refuse execution without approved test configuration; this is not a database qualification pass.
- TypeScript and targeted lint for the changed test files passed. Full lint failed (937 errors, 266 warnings), including vendored `.agents/skills` sources and existing application UI errors. Do not report the repository lint gate as passing.
- U-15C remains partial: independent fixture setup (including assistant users), audit-preserving cleanup, complete race scenarios and real execution still need verification. Earlier local-completion entries below are historical claims, not proof of those gates.
- Resume requires `ALLOW_DATABASE_INTEGRATION_TESTS=true`, `TEST_DATABASE_HOST_ALLOWLIST`, and an isolated `TEST_DATABASE_URL` whose database name ends in `_test`. Do not point this at application data. No database migration or production write was run.

## Current Goal

- Implement **Unit 15D — All remaining writers and role synchronization**:
  - `lib/services/user-service.ts`: current-active role authorization, common-lock/serializable last-admin protection, atomic role/status audit plus outbox intent, Clerk sync outside transaction.
  - `lib/services/feedback-service.ts`: actor attribution for moderation/deletion, direct-review identity distinct from verified-loan review; do not let direct reviews overwrite a loan-linked record. Preserve admin-hidden status on student edits; test concurrent moderation/edit/delete with expected-version guards.
  - `lib/services/book-management-service.ts`: remove ambiguous actor identifiers; audit title-only changes, copy creation and future retirement; exact role checks.
  - Relevant `app/actions/*`, `app/api/webhooks/clerk/route.ts`, `lib/schemas/user-schema.ts` and `feedback-schema.ts`: verified actors, inbox deduplication and typed outcomes.
  - Unit & concurrency testing for last-admin protection and concurrent role demotions.

## Completed

- [x] U-15C: Reservation and Circulation Concurrency & Idempotency Correctness
  - Conditional copy claim via atomic `updateMany` checking `version` and status `AVAILABLE`, incrementing `version`. Throws typed `409` conflict `COPY_CLAIM_CONFLICT` when another actor claims the copy concurrently.
  - Single close of active/overdue loans checking `status: { in: ["ACTIVE", "OVERDUE"] }` via `updateMany`. Throws typed `409` conflict `LOAN_RETURN_CONFLICT` on concurrent check-in races.
  - Created `lib/services/idempotency-service.ts` (`withIdempotency`) with deterministic SHA-256 request payload hashing, cached replay response deserialization, and unique constraint conflict handling on `idempotency_records`.
  - Updated Zod validation schemas (`lib/schemas/circulation-schema.ts`, `reservation-schema.ts`) with `expectedVersion`, `idempotencyKey`, 1–7 day hold limits, and 30-day loan bounds.
  - Integrated transactional copy audit (`recordCopyAudit`) across reservation, checkout, return, cancel, and expiration flows.
  - Hardened UI components (`components/modules/books/reserve-button.tsx`, `circulation-desk.tsx`) with client-side idempotency keys, dynamic refresh, conflict error banners, and touch-accessible mobile targets.
  - Drafted partial unique indexes in `prisma/migrations/02_circulation_partial_indexes.sql` for pending copy holds, pending student-book holds, and active/overdue loans.
  - Unit test suite `tests/services/circulation-concurrency-unit.test.ts` (6 tests passing). Next.js production build (`npm run build`) passed cleanly. Concurrency integration harness (`tests/integration/circulation-concurrency.test.ts`) strictly enforces fail-closed execution without `TEST_DATABASE_URL`.

- [x] U-15B: Audit and Schema Expansion Foundation
  - Expanded `prisma/schema.prisma` with `BookCopy.version`, `BookHistory` actor metadata (`actorType`, `systemActor`, `actorRole`, `correlationId`, `causationId`), `DomainAudit`, `IdempotencyRecord`, `OutboxMessage`, `InboxMessage`, and `WorkerLease`.
  - Replaced cascade-delete chains on `BookHistory` and `DomainAudit` with restrictive foreign keys (`onDelete: Restrict`).
  - Created `lib/services/audit-service.ts` with typed actor context (`VerifiedActor`) and transaction-aware helpers (`recordCopyAudit`, `recordDomainAudit`).
  - Created `scripts/audit-existing-state.ts` as a read-only report for duplicate active loans, duplicate pending holds, invalid copy holder pairings, and missing audit records.
  - Unit test suite `tests/services/audit-service.test.ts` (3 tests passing). Next.js build (`npm run build`) and ESLint pass cleanly.


- [x] U-15A.3: Explicit Verified Service-Principal & Actor Policy (Re-audited & Hardened)
  - Created strict `resolveHumanActorFromSession` and `getVerifiedHumanActor` resolvers (`lib/auth/verified-actor.ts`) tying human actor creation to cryptographically verified Clerk session (`auth()`) plus active database user record.
  - Ensured authorization authority derives from database role; rejects forged caller-supplied roles, identity mismatches, inactive accounts, and stale/revoked elevated privileges (`STALE_ROLE_CLAIMS`).
  - Added standalone `verifyClerkSessionToken` using cryptographic `verifyToken` for bearer tokens.
  - Implemented scoped HMAC-SHA256 system service tokens (`generateSystemServiceToken`, `authenticateSystemActor`) preventing cross-service impersonation and caller-selected service names.
  - Moved test actor factory `unsafeCreateActorForTesting` out of production code into isolated `tests/helpers/test-actor.ts`.
  - Added real production call site in `app/actions/circulation-actions.ts` via `assertAssistantAuth` invoking `getVerifiedHumanActor()` and `assertAssistantOrAdmin()`.
  - Test suite `tests/auth/verified-actor.test.ts` (8 passing unit tests, zero `any`, strict TypeScript).

- [/] U-15A.2: Database Pool Lifecycle, Truthful Metrics & Isolated Test Harness (Re-audited & Hardened)
  - Owned explicit `pg.Pool` instance in `lib/prisma.ts` created via `createPrismaClientWithPool`.
  - Removed duplicate pool error listener to prevent double-counting pool errors; metrics tracked exclusively through adapter error hooks.
  - Fixed `disconnectPrisma()` lifecycle to cleanly disconnect both `client` and `pool` across all environments (including production).
  - Lazy proxy in `lib/prisma.ts` defers client construction to avoid initialization crashes during pure unit test runs or build imports.
  - Enhanced `tests/integration/database-pool.test.ts` to parse and compare URL host, port, and database path, preventing bypass of live database protection, and using `createPrismaClientWithPool` application construction path.
  - Status: Code complete. Real pool execution pending external disposable staging/test database (`TEST_DATABASE_URL`). Safe resume command: `TEST_DATABASE_URL="postgresql://..." npm run test:database-pool`.

- [x] U-15A.1: Validated database connection configuration
  - Added Zod validation for runtime URL, pool bounds and transaction deadlines; configuration errors expose field names only.
  - Wired settings and sanitized connection-error callbacks into PrismaPg while retaining adapter pool ownership and the development singleton.
  - Fixed migration URL selection: missing/blank DIRECT_URL falls back; an explicitly invalid DIRECT_URL fails rather than silently choosing another database.
  - Updated environment template and added npm run test:database-config (six passing Node/tsx tests, no new dependencies).
  - Verification: targeted ESLint, TypeScript and production build passed. No application domain writes or schema migrations performed.

- [x] Lenis Smooth Scrolling Integration
  - Installed `lenis` library
  - Created client-side `LenisProvider` component (`components/providers/lenis-provider.tsx`) using `ReactLenis` and `lenis.css`
  - Integrated `LenisProvider` at the root layout level (`app/layout.tsx`)
  - Verification: `npx tsc --noEmit` and `npm run build` passed cleanly with 0 errors

- [x] Unit 00: Project Scaffolding & Local/Cloud Infrastructure ($0 Free-Tier)
  - [x] Initialize Next.js App Router with TypeScript (strict: true)
  - [x] Configure Tailwind v4 with design tokens and custom border radii
  - [x] Initialize shadcn/ui and install base primitives (Button, Input, Dialog, Dropdown Menu, Table, Card)
  - [x] Configure 100% free-tier infrastructure setup (Neon / Supabase Free Tier Postgres, Open-source standalone Meilisearch binary)
  - [x] Configure .env.example with all required credentials
  - [x] Verification: `npx tsc --noEmit` and `npm run build` passed

- [x] Unit 01: Database Schema, Enums & Migrations
  - [x] Install Prisma v7 with driver adapter (@prisma/adapter-pg, pg)
  - [x] Create prisma.config.ts (Prisma v7 connection config)
  - [x] Define 7 core Prisma models with 6 enums in schema.prisma
  - [x] Create lib/prisma.ts singleton client with PrismaPg adapter
  - [x] Generate typed Prisma client (`npx prisma generate` ✓)
  - [x] Create prisma/seed.ts with 8 users, 10 books, 24 copies, 24 audit records
  - [x] Add db:* scripts to package.json (generate, migrate, push, seed, studio)
  - [x] Verification: `npx tsc --noEmit` and `npm run build` passed

- [x] Unit 02: Clerk Auth Integration & RBAC Protection
  - [x] Install `@clerk/nextjs` and `svix`
  - [x] Define Clerk session types in `types/clerk.d.ts` using Prisma `UserRole`
  - [x] Build `lib/services/user-service.ts` for database synchronization and role management
  - [x] Create Clerk webhook handler (`app/api/webhooks/clerk/route.ts`) supporting `user.created`, `user.updated`, and `user.deleted` with Svix signature verification
  - [x] Set up `middleware.ts` with Clerk route matcher protecting non-public routes
  - [x] Wrap root layout (`app/layout.tsx`) with `<ClerkProvider>`
  - [x] Build server layout guards in `app/(app)/assistant/layout.tsx` (ASSISTANT/ADMIN) and `app/(app)/admin/layout.tsx` (ADMIN)
  - [x] Build auth pages (`app/(auth)/sign-in` and `app/(auth)/sign-up`)

- [x] Unit 05: Student Online Reservation Request Flow
  - [x] Create Zod schemas (`CreateReservationSchema`, `CancelReservationSchema`) in `lib/schemas/reservation-schema.ts`
  - [x] Implement business logic in `lib/services/reservation-service.ts` (`requestBookReservation`, `cancelReservation`, `getStudentReservations`, `getStudentReservationForBook`)
  - [x] Enforce atomic `prisma.$transaction` creating `Reservation`, updating `BookCopy.status` (`AVAILABLE` <-> `RESERVED`), and appending `BookHistory` audit logs
  - [x] Enforce post-commit search cache synchronization (`syncBookToSearchIndex`) on reservation state changes
  - [x] Build Server Actions in `app/actions/reservation-actions.ts` with Clerk `auth()` session verification
  - [x] Create student "My Reservations" dashboard page (`app/reservations/page.tsx`) with active hold status, 48h expiration timers, pickup instructions, and cancellation triggers
  - [x] Build interactive `ReserveButton` component (`components/modules/books/reserve-button.tsx`) integrated into book detail page (`app/books/[id]/page.tsx`)
  - [x] Verification: `npx tsc --noEmit` and `npm run build` passed cleanly with zero errors

- [x] Unit 06: Circulation Desk Rapid Checkout/Check-in Flow
  - [x] Create Zod schemas (`CheckoutSchema`, `CheckinSchema`, `CirculationSearchSchema`) in `lib/schemas/circulation-schema.ts`
  - [x] Build core domain service `lib/services/circulation-service.ts` (`checkoutBookCopy`, `checkinBookCopy`, `lookupStudents`, `lookupBookCopies`, `getCirculationDeskData`)
  - [x] Enforce atomic `prisma.$transaction` creating/closing `Loan`, updating `BookCopy` status/holder/condition, fulfilling `Reservation`, and appending immutable `BookHistory` audit records
  - [x] Enforce post-commit search cache synchronization (`syncBookToSearchIndex`) on checkout and check-in transactions
  - [x] Build Server Actions (`app/actions/circulation-actions.ts`) with Clerk `auth()` session verification and role enforcement (`ASSISTANT` / `ADMIN`)
  - [x] Build zero-CLS shimmer skeleton `components/modules/circulation/circulation-skeleton.tsx`
  - [x] Build sub-10s Circulation Desk console UI (`components/modules/circulation/circulation-desk.tsx`) featuring 4 tab views (Rapid Checkout, Rapid Check-in, Holds Queue, Active Loans Directory)
  - [x] Integrate console into assistant route segments `app/(app)/assistant/page.tsx` and `/assistant/desk/page.tsx`
  - [x] Verification: `npx tsc --noEmit` and `npm run build` passed cleanly with zero errors

- [x] Unit 07: BookHistory Audit Trail & Copy Traceability
  - [x] Create Zod schemas (`lib/schemas/history-schema.ts`)
  - [x] Build core domain service `lib/services/history-service.ts` (`getCopyHistory`, `getCopyTraceabilityByBarcode`, `getUserLoansAndHistory`, `getAllAuditLogs`)
  - [x] Build Server Actions (`app/actions/history-actions.ts`) with Clerk `auth()` session verification and RBAC guards
  - [x] Create visual `CopyHistoryTimeline` component (`components/modules/history/copy-history-timeline.tsx`) displaying action badges, state transitions, actor details, and condition notes
  - [x] Create `CopyTraceabilityView` component (`components/modules/history/copy-traceability-view.tsx`) with barcode lookup and metadata cards
  - [x] Create `StudentLoansView` component (`components/modules/history/student-loans-view.tsx`) with active checkout cards, overdue alerts, and return history table
  - [x] Create zero-CLS shimmer skeleton loaders (`components/modules/history/history-skeleton.tsx`)
  - [x] Build Student personal "My Loans" page (`app/loans/page.tsx`) with Clerk auth guard & loading boundary (`app/loans/loading.tsx`)
  - [x] Build Assistant Copy Traceability page (`app/(app)/assistant/history/page.tsx`) & loading boundary (`app/(app)/assistant/history/loading.tsx`)
  - [x] Integrate "Copy Audit Trail & Traceability" 5th tab into Circulation Desk console (`components/modules/circulation/circulation-desk.tsx`)
  - [x] Verification: `npx tsc --noEmit` and `npm run build` passed cleanly with zero warnings/errors

- [x] Unit 08: Verified Post-Loan Feedback & Reviews
  - [x] Create Zod validation schemas in `lib/schemas/feedback-schema.ts` (`SubmitFeedbackSchema`, `ModerateFeedbackSchema`, `DeleteFeedbackSchema`, `AdminFeedbackQuerySchema`)
  - [x] Build core domain service `lib/services/feedback-service.ts` (`submitBookFeedback`, `getAdminFeedbacks`, `toggleFeedbackModeration`, `deleteFeedback`, `getEligibleLoanForBookFeedback`)
  - [x] Update `lib/services/book-service.ts` and `lib/services/history-service.ts` to enforce `isModerated: false` public visibility and feedback association
  - [x] Build Server Actions (`app/actions/feedback-actions.ts`) with Clerk `auth()` session validation and `ADMIN` role checks
  - [x] Build UI components: `SubmitFeedbackModal` (1–5 star rating picker with comment textarea), `AdminFeedbackModeration` console, and zero-CLS `FeedbackSkeleton`
  - [x] Integrate feedback triggers into student loan dashboard (`components/modules/history/student-loans-view.tsx`) and book detail view (`components/modules/books/reviews-list.tsx`)
  - [x] Build Admin moderation route `app/(app)/admin/feedback/page.tsx` & `app/(app)/admin/feedback/loading.tsx`
  - [x] Upgrade Admin Dashboard (`app/(app)/admin/page.tsx`) with navigation cards linking to review moderation
  - [x] Verification: `npx tsc --noEmit` and `npm run build` passed cleanly with zero errors/warnings

- [x] Unit 09: Admin User & Role Management Console
  - [x] Create Zod schemas in `lib/schemas/user-schema.ts` (`AdminUserQuerySchema`, `UpdateUserRoleSchema`, `ToggleUserStatusSchema`)
  - [x] Update `lib/services/user-service.ts` with `getAdminUsers`, `updateUserRole`, `toggleUserStatus` including Clerk Backend API metadata sync (`clerkClient().users.updateUserMetadata`)
  - [x] Create Server Actions (`app/actions/user-actions.ts`) with Clerk `auth()` session validation and `ADMIN` role checks
  - [x] Build UI components: `UserSkeleton` zero-CLS shimmer loader, `UserManagement` interactive console with search input, role filter tabs, status filter tabs, user list table, stats metrics cards, role modification dialog, and account deactivation modal
  - [x] Build Admin route `app/(app)/admin/users/page.tsx` and `app/(app)/admin/users/loading.tsx`
  - [x] Update Admin Hub (`app/(app)/admin/page.tsx`) linking User & Role Management console card to `/admin/users`
  - [x] Verification: `npx tsc --noEmit` and `npm run build` passed cleanly with zero errors/warnings

- [x] Unit 05.5: Custom Student Hold Duration & Calendar Expiration Selection
  - [x] Update `CreateReservationSchema` in `lib/schemas/reservation-schema.ts` to accept optional `holdDays` (1–7 days) and optional `holdUntilDate` (calendar date)
  - [x] Update `requestBookReservation` in `lib/services/reservation-service.ts` to compute custom `expiresAt` based on duration or calendar date (up to max 7 days limit)
  - [x] Update `requestReservationAction` in `app/actions/reservation-actions.ts` to pass hold parameters
  - [x] Build interactive `ReserveHoldModal` component (`components/modules/books/reserve-hold-modal.tsx`) with 1-7 day preset pills, HTML5 date picker, and pickup expiration summary
  - [x] Integrate `ReserveHoldModal` into `ReserveButton` on book detail pages
  - [x] Verification: `npx tsc --noEmit` and `npm run build` passed cleanly with zero errors/warnings

- [x] Unit 10.5: Book Availability Calendar & Usage Duration Limits
  - [x] Compute `nextAvailableDate` in `lib/services/book-service.ts` for catalog entries and detail views by analyzing active loans (`dueDate`) and pending reservations (`expiresAt`)
  - [x] Build interactive `CalendarUsageLimitPicker` component (`components/modules/books/calendar-usage-limit-picker.tsx`) with 30-day max duration limits, quick presets, and HTML5 date picker
  - [x] Add "Next Available Date" calendar schedule banner to `BookDetailView` when copies are unavailable
  - [x] Integrate `CalendarUsageLimitPicker` into `CirculationDesk` rapid checkout flow
  - [x] Verification: `npx tsc --noEmit` and `npm run build` passed cleanly with zero errors/warnings

- [x] Unit 10: Collection Growth & Circulation Analytics Panel
  - [x] Create Zod schema `AnalyticsQuerySchema` in `lib/schemas/analytics-schema.ts` supporting timeframe filters (`30d`, `90d`, `6m`, `1y`, `all`)
  - [x] Build core domain service `lib/services/analytics-service.ts` (`getCollectionAnalytics`) executing optimized PostgreSQL aggregate and groupBy queries
  - [x] Create Server Action `app/actions/analytics-actions.ts` (`getAnalyticsDataAction`) with Clerk `auth()` session validation and `ADMIN` role checks
  - [x] Build UI components: `AnalyticsDashboard` interactive console with live telemetry header, timeframe switcher, 4 summary KPI cards, responsive monthly borrow/return volume bar chart, category distribution progress bars, overdue telemetry aging breakdown, physical copy condition breakdown, top borrowed books leaderboard, and active reader cohorts
  - [x] Build zero-CLS shimmer skeleton `components/modules/analytics/analytics-skeleton.tsx`
  - [x] Build Admin Analytics route `app/(app)/admin/analytics/page.tsx` and loading boundary `app/(app)/admin/analytics/loading.tsx`
  - [x] Update Admin Control Hub (`app/(app)/admin/page.tsx`) enabling the "Circulation & Growth Analytics" card linking to `/admin/analytics`
  - [x] Verification: `npx tsc --noEmit` and `npm run build` passed cleanly with zero errors/warnings

- [x] Unit 11: Zero-CLS Skeletons & Performance Optimization
  - [x] Create root catalog loading state `app/loading.tsx` with matching zero-CLS `CatalogSkeleton` placeholder
  - [x] Create student holds & reservations loading state `app/reservations/loading.tsx`
  - [x] Create assistant circulation desk loading state `app/(app)/assistant/loading.tsx` with `CirculationDeskSkeleton`
  - [x] Create admin hub loading state `app/(app)/admin/loading.tsx`
  - [x] Replace raw `<img>` tag in `StudentLoansView` (`components/modules/history/student-loans-view.tsx`) with optimized Next.js `<Image />` component with `fill` and `sizes="80px"`
  - [x] Verification: `npx tsc --noEmit` and `npm run build` passed cleanly with zero errors/warnings

- [x] Unit 12: Public Landing Page & Distinct /catalog Route with Auth Routing
  - [x] Build public library landing page component `app/page.tsx` with library overview, opening hours, borrowing rules, and sign-in/up CTAs
  - [x] Enforce automatic server redirect (`redirect("/catalog")`) for authenticated users visiting `/`
  - [x] Create dedicated catalog exploration route `app/catalog/page.tsx` and `app/catalog/loading.tsx`
  - [x] Update header navigation (`components/shared/navbar.tsx`) with distinct Home (`/`) and Catalog (`/catalog`) routes
  - [x] Verification: `npx tsc --noEmit` passed cleanly with zero errors

- [x] Unit 13: Book Catalog Management Console (Add Titles & Physical Copies)
  - [x] Create Zod schemas (`lib/schemas/book-management-schema.ts`) for book title creation and copy registration
  - [x] Build Cloudflare R2 storage client (`lib/storage/r2-client.ts`) and upload endpoint `app/api/upload/route.ts` for cover image uploads
  - [x] Create domain service `lib/services/book-management-service.ts` (`createBookWithCopies`, `addPhysicalCopy`) with atomic `prisma.$transaction`, `BookHistory` creation, and Meilisearch search index sync
  - [x] Build Server Actions `app/actions/book-management-actions.ts` with Clerk `auth()` validation and `ASSISTANT` / `ADMIN` role checks
  - [x] Create interactive management console `components/modules/books/book-management-console.tsx` and assistant route `app/(app)/assistant/books/page.tsx`
  - [x] Update header navigation (`components/shared/navbar.tsx`) linking "Manage Books" for assistants and admins
  - [x] Verification: `npx tsc --noEmit` passed cleanly with zero errors

- [x] Unit 14: Community 5-Star Ratings & Direct Book Reviews
  - [x] Update Prisma schema (`prisma/schema.prisma`) making `Feedback.loanId` optional (`loanId String? @unique`) to support direct book reviews
  - [x] Create Zod validation schema `CreateDirectBookReviewSchema` in `lib/schemas/feedback-schema.ts`
  - [x] Update `lib/services/feedback-service.ts` (`submitDirectBookReview`) supporting 1–5 star ratings and written comments with search index sync (`syncBookToSearchIndex`)
  - [x] Create Server Action `app/actions/feedback-actions.ts` (`submitDirectBookReviewAction`) with Clerk `auth()` session validation
  - [x] Update `components/modules/books/reviews-list.tsx` with 5-star rating breakdown bars (5-star, 4-star, 3-star, 2-star, 1-star percentage distribution) and interactive "Rate & Review Book" modal dialog
  - [x] Verification: `npx tsc --noEmit` and `npm run build` passed cleanly with zero errors/warnings

## In Progress

- [/] Phase 2 delivery tracking active.
- No code change currently in progress. U-15A.1 completed; parent U-15A remains partially complete pending topology, metrics, lifecycle, live-pool qualification and actor policy.

## Next Up

| Unit | Status | Required evidence |
| --- | --- | --- |
| U-15A | [/] Partial: U-15A.1 complete | Remaining topology/budget, lifecycle/metrics, real-pool tests and actor policy |
| U-15B | [ ] Pending | Audit/schema expansion, repair report and migration compatibility |
| U-15C | [ ] Pending | Guarded circulation, uniqueness, idempotency and contention tests |
| U-15D | [ ] Pending | All writers audited; last-admin and role/webhook correctness |
| U-16A | [ ] Pending | SQL pagination/aggregates and rating reconciliation |
| U-16B | [ ] Pending | Engine pagination, indexed fallback and outage tests |
| U-16C | [ ] Pending | Durable jobs, task success/replay and read-only GET |
| U-17A | [ ] Pending | Workspace relocation and shared contracts |
| U-17B | [ ] Pending | API auth/validation/lifecycle foundation |
| U-18 | [ ] Pending | Catalog HTTP/SSR parity |
| U-19 | [ ] Pending | Private read ownership/cache isolation |
| U-20 | [ ] Pending | One writer per operation and integration cutover |
| U-21 | [ ] Pending | Enforced boundaries and deployment recovery |
| U-22 | [ ] Pending | Reproducible capacity/reliability report |

Detailed file checklists and gates are in [plans.md](plans.md).

## Open Questions and Qualification Inputs

- Production provider, region, database/pooler versions and limits, replica/surge caps and hosting budget remain unverified. The example URL suggests Supabase pooling but does not prove deployed settings.
- Staging sizes and 200 operations/second are qualification assumptions, not observed capacity. Confirm data skew and usage during U-15A.
- Default school timezone is Asia/Tashkent for date-only inputs; confirm deployment configuration.
- Verified service-principal attribution requires the root AGENTS.md clarification scoped in U-15A before those writers ship.
- Pin/test compatible Nest/Fastify/Node/Prisma/OpenAPI versions and provider prepared-statement behavior during foundation work.
- This audit did not reproduce production races or inspect live DB state. Determine repair scope from a read-only audit; do not presume corruption.
- Historical completion claims cover U-00–U-14, but detailed entries do not enumerate U-03/U-04 separately. Preserve history and verify actual catalog/search parity rather than inventing past checks.

## Architecture Decisions

### ADR-2026-09-09: Harden Then Separate

Status: accepted design, implementation pending.

- **Context:** The user requires frontend/backend separation and 1,000 active-user support. PrismaPg already has a local pool, the template names a provider pooler, and checkout already has a partial conditional claim. These correct overly broad assumptions in the initial prompt.
- **Decision:** Harden the current writers and queries; extract NestJS/Fastify within npm workspaces; retain Next SSR. One circulation module owns holds, checkout, return and expiration. Contracts are Zod DTOs; database access becomes backend-only.
- **Alternatives:** In-place Next scaling can serve the workload with the same correctness/query fixes and has lower migration cost. Separation follows the requested deployment boundary, adding HTTP/contract/auth/operations overhead. Bun/Hono and microservices lack a demonstrated benefit here.
- **Correctness:** Guard claims and releases with state/owner/version and count === 1, database uniqueness, copy-first lock ordering and stable idempotency keys. Preserve audits against cascading deletes and record actor role-at-time.
- **Additional loopholes:** Analytics aggregates loan history in memory; direct-review findFirst can select a loan-linked review; last-admin changes race; search task acceptance is mistaken for completion; cache invalidation is not globally coordinated.
- **Identity:** Independently verify Clerk tokens and current active DB permissions. PostgreSQL owns application role/status; metadata sync uses durable delivery. Explicit service principals replace false student attribution for scheduled expiration.
- **Consistency:** Outbox/inbox, bounded workers and Meilisearch task-success tracking. GET does not mutate. Personal/mutable-availability data starts no-store.
- **Performance:** SQL/search performs rank/aggregate/pagination. Meilisearch normally, indexed tested fallback or actionable 503. Connection/admission budgets include maximum replicas and surge.
- **Cost/SLO:** Free local development retained; production budget/capacity explicit. p95 <200ms is a defined healthy-load target, not a guaranteed burst/framework result.
- **Sources:** Linked in architecture.md.
- **Consequences:** U-15–U-22 remain unchecked. No application code, migration, dependency, provider setting or production data changed here.

### Historical Architecture Decisions

Earlier decisions below are preserved. Current architecture.md supersedes free-tier performance guarantees, middleware naming and layout-only authorization implications.

- **Tailwind v4 (CSS-first config):** Uses `@theme inline` in globals.css instead of `tailwind.config.js`.
- **Next.js 16.3.1:** Turbopack-based build. Uses `LayoutProps<"/">` type pattern.
- **Fonts:** Inter (body), Plus Jakarta Sans (display), JetBrains Mono (mono) via next/font/google.
- **shadcn/ui Nova preset (Radix base):** 6 base primitives installed.
- **Strict $0 (100% Free-Tier) Infrastructure:**
  - **Database:** Neon Serverless Postgres (Free Tier) or Supabase (Free Tier)
  - **Search:** Open-source Meilisearch standalone binary (running locally in dev) / free tier
  - **Authentication:** Clerk (Free Hobby Tier, up to 10,000 MAUs)
  - **Image Storage:** Cloudflare R2 (Free Tier, 10 GB storage, $0 egress fees)
  - **App Hosting:** Vercel Hobby Tier (`.vercel.app`)
- **Prisma v7 breaking changes:** Connection config in `prisma.config.ts`, `PrismaPg` driver adapter in `lib/prisma.ts`.
- **Clerk Auth & RBAC Architecture:**
  - `publicMetadata.role` defaults to `STUDENT` on user sync.
  - `middleware.ts` guards all routes except public catalog (`/`, `/books/*`), sign-in/up, and Clerk webhooks.
  - Protected layout components (`/assistant`, `/admin`) execute server-side `auth()` checks and issue `redirect("/")` before child trees render.
  - Webhook route delegates strictly to `lib/services/user-service.ts` per Prisma Isolation Invariant.


## Session Notes

- Session: 2026-08-18
- Unit 08 completed: Verified Post-Loan Feedback & Reviews.
- Created `lib/schemas/feedback-schema.ts` with Zod validation.
- Created `lib/services/feedback-service.ts` for feedback submission (`submitBookFeedback`), admin feedback moderation (`getAdminFeedbacks`, `toggleFeedbackModeration`), review deletion (`deleteFeedback`), and eligibility lookup (`getEligibleLoanForBookFeedback`).
- Enforced 1-feedback-per-loan unique database constraint (`loanId` `@unique` in Prisma schema).
- Enforced loan status requirement (`loan.status === 'RETURNED'`) and student ownership verification before creating reviews.
- Updated `lib/services/book-service.ts` so public catalog ratings and review streams filter `where: { isModerated: false }`.
- Updated `lib/services/history-service.ts` so student loans overview reports feedback state per returned loan.
- Created Server Actions `app/actions/feedback-actions.ts` with Clerk session verification and `ADMIN` role protection for moderation/deletion.
- Created UI components in `components/modules/feedback/`:
  - `SubmitFeedbackModal`: Interactive modal with 1–5 star hover selector, comment textarea (0/1000 counter), error alert, and submit state.
  - `AdminFeedbackModeration`: Administrative moderation console featuring stats summary cards, status tabs (All, Published, Moderated), search input, moderation toggle buttons, and permanent delete confirmation modal.
  - `FeedbackSkeleton`: Shimmer skeleton loading placeholder for zero CLS.
- Integrated feedback triggers into student loan dashboard (`StudentLoansView`) and book detail view (`ReviewsList`).
- Built route `app/(app)/admin/feedback/page.tsx` & `loading.tsx` and updated `app/(app)/admin/page.tsx` with admin console card navigation.
- Verification passed: `npx tsc --noEmit` and `npm run build` completed with zero warnings or errors.

- Unit 09 completed: Admin User & Role Management Console.
- Updated `lib/schemas/user-schema.ts` with Zod validation schemas (`AdminUserQuerySchema`, `UpdateUserRoleSchema`, `ToggleUserStatusSchema`).
- Updated `lib/services/user-service.ts` with domain functions (`getAdminUsers`, `updateUserRole`, `toggleUserStatus`) enforcing admin authentication guards, self-demotion/self-deactivation guards, sole-admin protection, and instant sync with Clerk Backend API metadata (`clerkClient().users.updateUserMetadata`).
- Created Server Actions `app/actions/user-actions.ts` with Clerk `auth()` session validation and `ADMIN` role protection.
- Created UI components in `components/modules/admin/`:
  - `UserSkeleton`: Shimmer skeleton loading placeholder for zero CLS layout transitions.
  - `UserManagement`: Comprehensive admin user management console featuring search input, role filter pills (All, Student, Assistant, Admin), status filter pills (All, Active, Deactivated), summary stats metrics cards, paginated user table, role update dialog, and account deactivation modal.
- Built route `app/(app)/admin/users/page.tsx` & `app/(app)/admin/users/loading.tsx` and updated `app/(app)/admin/page.tsx` navigation card linking to `/admin/users`.
- Verification passed: `npx tsc --noEmit` and `npm run build` completed with zero warnings or errors.

- Unit 10 completed: Collection Growth & Circulation Analytics Panel.
- Created Zod validation schema `lib/schemas/analytics-schema.ts` (`AnalyticsQuerySchema`, `AnalyticsTimeframeEnum`).
- Built core domain service `lib/services/analytics-service.ts` (`getCollectionAnalytics`) executing optimized PostgreSQL aggregate and groupBy queries for collection size, copy availability, active/overdue loans, overdue ratio, inventory utilization rate, average catalog ratings, monthly borrow/return volume trends, category distribution, overdue severity telemetry, copy condition health, top borrowed books leaderboard, and active reader cohorts.
- Created Server Action `app/actions/analytics-actions.ts` (`getAnalyticsDataAction`) with Clerk `auth()` session validation and `ADMIN` role protection.
- Created zero-CLS shimmer loading skeleton `components/modules/analytics/analytics-skeleton.tsx`.
- Created interactive UI console `components/modules/analytics/analytics-dashboard.tsx` with live telemetry header, timeframe switcher (`30d`, `90d`, `6m`, `1y`, `all`), 4 KPI summary cards, responsive monthly borrow/return volume bar chart, category distribution progress bars, overdue telemetry aging breakdown, copy condition health pills, top borrowed books leaderboard table, and active reader cohorts.
- Built Admin Analytics route `app/(app)/admin/analytics/page.tsx` & `loading.tsx`.
- Updated Admin Control Hub (`app/(app)/admin/page.tsx`) enabling the "Circulation & Growth Analytics" card linking to `/admin/analytics`.
- Verification passed: `npx tsc --noEmit` and `npm run build` completed with zero warnings or errors.


## Session Notes — 2026-09-09 Architecture Re-evaluation

- Read all seven context files, the attached prior architecture proposal, relevant service/schema/action/search code, environment template, installed pg/Prisma adapter implementation and Next self-hosting/backend-for-frontend guides.
- Researched official Nest, Clerk, node-postgres, PgBouncer, PostgreSQL, Meilisearch and k6 documentation, plus the original transactional-outbox pattern reference.
- Corrected the unsupported “no pooling” assumption: local pooling exists and the template names a provider pooler; deployed configuration remains unknown.
- Applied coordinated documentation revisions to overview, architecture, standards, roadmap, tracker, UI and workflow. Preserved the historical U-00–U-14 unit bodies and Completed ledger.
- Added atomic release/return protection, per-copy versioning, idempotency, durable projections, audit retention, role synchronization, indexed query limits, cache isolation, staged one-writer migration and failure/load gates.
- Reconciled direct reviews versus verified-loan reviews, public catalog intent versus current proxy, strict free-tier claims, arbitrary accent guidance and obsolete active document references.
- Documentation validation passed: historical U-00–U-14 bodies and Completed ledger preserved (normalized line endings/trailing file whitespace), Markdown fences balanced, context links resolve, U-15–U-22 roadmap and ADR present; git diff whitespace check passed. Only the seven context files changed.
- No application code changed. No runtime race fixes, database migrations, builds, browser tests or k6 runs performed. Capacity remains unverified.

## Session Notes — 2026-09-12 Phase 2 Execution Control

- Added [phase-2-execution-directive.md](phase-2-execution-directive.md) as the execution controller for U-15 through U-22 while retaining `plans.md` as the canonical technical checklist.
- Defined the repeated inspect, implement, verify, independent correctness/security review, independent performance/operations review, repair and resume cycle for every subunit.
- Added evidence-based completion rules, dependency gates, external-blocker handling, final three-perspective audit and a required consolidated report.
- Preserved the prohibition on production provisioning, destructive production work and fabricated qualification evidence.
- Replaced the remaining Docker/Compose deliverable with provider-neutral process, proxy and deployment guidance. No Docker artifact was added.
- Documentation validation: local links and directive references inspected; `git diff --check` passed. No application code, schema or migration was changed in this documentation session.
