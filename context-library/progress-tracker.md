# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Complete (Unit 07)

## Current Goal

- Unit 07 complete. Ready for Unit 08: Verified Post-Loan Feedback & Reviews.

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

## In Progress

- None.

## Next Up

- Unit 08: Verified Post-Loan Feedback & Reviews

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
- Unit 07 completed: Immutable BookHistory Audit Trail & Copy Traceability.
- Created `lib/schemas/history-schema.ts` with Zod validation.
- Created `lib/services/history-service.ts` for time-sequenced audit logs (`getCopyHistory`, `getCopyTraceabilityByBarcode`), student loan tracking (`getUserLoansAndHistory`), and system audit filtering (`getAllAuditLogs`).
- Created Server Actions `app/actions/history-actions.ts` with Clerk session validation and RBAC guards for assistants/admins.
- Built UI components in `components/modules/history/`:
  - `CopyHistoryTimeline`: Visual time-sequenced timeline showing action badges, actor info, state transitions (`previousState` -> `newState`), and condition notes.
  - `CopyTraceabilityView`: Physical copy barcode lookup console with metadata inspector, current holder info, and embedded audit log.
  - `StudentLoansView`: Student dashboard featuring active checkouts, overdue alert banner with calculated days overdue, and historical returns table.
  - `HistorySkeleton`: Matching zero-CLS shimmer skeleton placeholders.
- Created route segments:
  - `app/loans/page.tsx` & `app/loans/loading.tsx`: Student personal "My Loans" page.
  - `app/(app)/assistant/history/page.tsx` & `app/(app)/assistant/history/loading.tsx`: Assistant copy traceability console.
- Integrated "Copy Audit Trail & Traceability" 5th tab into `CirculationDesk` console.
- Verification passed: `npx tsc --noEmit` and `npm run build` completed with zero warnings or errors.

