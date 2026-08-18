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
- [x] Unit 03: Public Catalog & SEO Book Detail Pages
  - [x] Implement `lib/services/book-service.ts` for server-side catalog queries (`getCatalogBooks`), detailed book retrieval (`getBookDetails`), and distinct categories (`getCategories`)
  - [x] Build sticky navigation header (`components/shared/navbar.tsx`) with Clerk auth controls and role badges
  - [x] Build Server Component public catalog (`app/page.tsx`) with category filtering, search, sorting, and pagination
  - [x] Create zero-CLS skeleton component (`components/modules/catalog/catalog-skeleton.tsx`) matching card layout
  - [x] Build `/books/[id]` detail view (`app/books/[id]/page.tsx`) with physical copy telemetry, rating distribution, and verified student reviews stream
  - [x] Implement dynamic OpenGraph metadata and Schema.org `Book` JSON-LD structured data on detail pages
  - [x] Verification: `npx tsc --noEmit` and `npm run build` passed cleanly

## In Progress

- None.

## Next Up

- Unit 04: Meilisearch Integration & Search Sync Engine

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
- Unit 02 completed. All 4 detailed steps implemented and verified.
- Routes built and verified: `/`, `/admin`, `/assistant`, `/api/webhooks/clerk`, `/sign-in/[[...sign-in]]`, `/sign-up/[[...sign-up]]`.
- Both `npx tsc --noEmit` and `npm run build` passed cleanly.
