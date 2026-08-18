# Progress Tracker

Update this file after every meaningful implementation
change.

### Current Phase

- In Progress (Unit 11: Zero-CLS Skeletons & Performance Optimization)

## Current Goal

- Unit 11: Zero-CLS Skeletons, Suspense & Performance Optimization.

## Completed

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

## In Progress

- None.

## Next Up

- Production Deployment & Operations Monitoring

## Open Questions

- None.

## Architecture Decisions

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

