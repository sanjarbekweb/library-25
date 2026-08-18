# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Complete (Unit 01)

## Current Goal

- Unit 01 complete. Ready for Unit 02: Clerk Auth Integration & RBAC Protection.

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

## In Progress

- None.

## Next Up

- Unit 02: Clerk Auth Integration & RBAC Protection

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
  - **Constraint:** No feature, cron job, or external service may require a paid subscription, credit card requirement, or pay-as-you-go billing threshold.
- **Prisma v7 breaking changes:**
  - `url` removed from `datasource` block in schema.prisma; connection URL now configured in `prisma.config.ts` via `defineConfig()`.
  - PrismaClient requires a driver adapter (`@prisma/adapter-pg` with `PrismaPg`) passed to constructor.
  - `dotenv/config` imported in prisma.config.ts for env variable loading.
- **Prisma client singleton:** `lib/prisma.ts` uses globalThis cache guard pattern with PrismaPg adapter.
- **Seed script:** Uses `upsert` for idempotent re-runs. Creates BookHistory CREATED records for all copies per Immutable Audit Guarantee invariant.

## Session Notes

- Session: 2026-08-18
- Unit 00 and Unit 01 fully complete. All quality gates passed.
- **100% Free-Tier Requirement Enforced:** Updated `architecture.md`, `plans.md`, `.env.example`, and `progress-tracker.md`.
- **Migration & Seed:** Set `DATABASE_URL` in `.env` (Neon/Supabase Free Tier or local native Postgres), then run `npm run db:migrate` followed by `npm run db:seed`.
- `cn()` utility at `lib/utils.ts`, Prisma singleton at `lib/prisma.ts`.
- Custom Tailwind tokens: `bg-canvas-warm`, `bg-brand-yellow`, `bg-brand-blue`, `text-gamify-streak`, etc.
