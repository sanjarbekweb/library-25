# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Complete (Unit 03)

## Current Goal

- Unit 03 complete. Ready for Unit 04: Meilisearch Integration & Search Sync Engine.

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
- [x] Unit 04: Meilisearch Integration & Search Sync Engine
  - [x] Install `meilisearch`, `@tanstack/react-query`, and `zod`
  - [x] Build Meilisearch client wrapper in `lib/search/client.ts` with `books` index settings (`title`, `author`, `category`, `isbn`, `description`)
  - [x] Implement `syncBookToSearchIndex` and `syncAllBooksToSearchIndex` in `lib/search/sync.ts` fetching live `BookCopy` availability counts from PostgreSQL
  - [x] Create `lib/schemas/search-schema.ts` Zod validation schema for search requests
  - [x] Build `/api/search` route handler with Meilisearch primary search and PostgreSQL fallback search
  - [x] Create `QueryProvider` in `components/providers/query-provider.tsx` and wrap root layout
  - [x] Build interactive `SearchHeader` component (`components/modules/search/search-header.tsx`) with debounced query input, TanStack Query integration, instant typo-tolerant preview dropdown, and availability badges
  - [x] Integrate `SearchHeader` into catalog filter bar (`components/modules/catalog/catalog-filter-bar.tsx`)
  - [x] Verification: `npx tsc --noEmit` and `npm run build` passed with 0 errors

## In Progress

- None.

## Next Up

- Unit 05: Student Online Reservation Request Flow

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
- Unit 04 completed: Meilisearch Integration & Search Sync Engine.
- Built Meilisearch client singleton wrapper (`lib/search/client.ts`) and index sync handlers (`lib/search/sync.ts`).
- Created `/api/search` route handler with Zod input validation (`lib/schemas/search-schema.ts`), typo tolerance via Meilisearch, and database fallback.
- Added `@tanstack/react-query` `QueryProvider` and built debounced instant search UI (`components/modules/search/search-header.tsx`) integrated into `CatalogFilterBar`.
- Verification passed: `npx tsc --noEmit` and `npm run build` completed with zero errors.

