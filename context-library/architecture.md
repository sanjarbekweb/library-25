# Architecture Context

## Stack

| Layer | Technology | Role / Tier |
| :--- | :--- | :--- |
| Framework | Next.js 15 (App Router) + TypeScript | Core application platform, SSR catalog pages, Server Actions, and API routing |
| UI & Styling | Tailwind CSS + shadcn/ui | Design tokens, accessible component primitives, and responsive layout system |
| Authentication | Clerk | User auth, session handling, and RBAC via `publicMetadata.role` (Free Hobby Tier, up to 10,000 MAUs) |
| Database & ORM | PostgreSQL + Prisma ORM | System of record (Neon Serverless Postgres Free Tier or Supabase Free Tier) |
| Search Engine | Meilisearch | Typo-tolerant search index (`books`) using open-source standalone local binary (dev) / free tier |
| Object Storage | Cloudflare R2 (S3-compatible) | Storage for book cover images (Free Tier: 10 GB storage, $0 egress fees) |
| Data Visualization | Recharts (via shadcn `chart`) | Admin dashboard visual analytics for borrow volume, category trends, and overdue metrics |
| Validation | Zod | Runtime schema validation shared across client forms, Server Actions, and API routes |
| Deployment | Vercel Hobby Tier (`.vercel.app`) | Zero-cost serverless hosting and deployment platform |

## System Boundaries

- `app/api/*` — Request handling layer. Responsible for parsing and validating input payloads via Zod, verifying session auth, delegating directly to `lib/services/*`, and returning typed JSON. Never calls Prisma or Meilisearch directly.
- `app/(app)/admin/*` & `app/(app)/assistant/*` — Protected route segments. Layout boundaries (`layout.tsx`) enforce server-side role validation using Clerk's `auth()` before rendering children. UI hiding alone is never treated as a security boundary.
- `lib/services/*` — Domain business logic layer. The only layer authorized to interact with Prisma ORM. Orchestrates multi-table database transactions and triggers search synchronization.
- `lib/search/*` — Meilisearch client wrapper and index synchronization handlers (`syncBookToSearchIndex`). Handles derived search document formatting and index updates.
- `components/*` — UI presentation and interaction layer. Separated into shared design primitives and module-specific views. Client components (`'use client'`) communicate exclusively via Server Actions or `/api/*` endpoints.

## Storage Model

- **Relational Database (PostgreSQL via Prisma):** The single source of truth for all operational data (Neon Serverless Postgres Free Tier or Supabase Free Tier). Stores user records, catalog books, individual physical copies (`BookCopy`), active and past loans, reservations, feedback ratings/comments, and the immutable audit log (`BookHistory`).
- **Search Index (Meilisearch `books` index):** Derived, denormalized search cache (Open-source standalone local binary in development). Rebuilt from PostgreSQL on demand.
- **Blob / Object Storage (Cloudflare R2):** Binary media storage for uploaded book cover images (Free Tier: 10 GB storage, $0 egress fees). PostgreSQL holds only the immutable public CDN URLs.

## Auth and Access Model

- **Authentication:** All users authenticate via Clerk (Free Hobby Tier). On user creation, a default role of `STUDENT` is assigned in `publicMetadata.role`.
- **Role-Based Access Control (RBAC):** Three discrete roles govern permissions: `STUDENT`, `ASSISTANT`, and `ADMIN`. Role checks are verified server-side on every protected Server Action and route handler using `auth()`.
- **Permission Matrix:**

| Capability | Student | Assistant | Admin |
| :--- | :---: | :---: | :---: |
| Search and browse catalog | ✅ | ✅ | ✅ |
| Reserve an available book copy | ✅ | — | — |
| In-person checkout & check-in at desk | — | ✅ | ✅ |
| Add, edit, or remove catalog books & copies | — | ✅ | ✅ |
| View personal active loans & history | ✅ | ✅ | ✅ |
| View all user loans and audit history | — | ✅ | ✅ |
| Submit review & rating (completed loans only) | ✅ | — | — |
| Moderate reviews & comments | — | — | ✅ |
| Manage assistant roles & deactivations | — | — | ✅ |
| View collection growth & circulation analytics | — | — | ✅ |

## Invariants

1. **Prisma Isolation:** Never call Prisma from a Client Component or directly inside an `app/api/*` route handler. Database operations must execute inside `lib/services/*`.
2. **Immutable Audit Guarantee:** Never mutate `BookCopy.currentHolderId` or `BookCopy.status` without creating an accompanying `BookHistory` log entry in the same atomic database transaction (`prisma.$transaction`).
3. **Server-Verified Identity:** Never trust client-submitted user identifiers or role claims. All authorization and actor tracking must read strictly from the server-side Clerk session (`auth()`).
4. **Search Credential Security:** Never expose Meilisearch master or administrative API keys to the browser. Client-side searches must execute through backend endpoints or use short-lived, search-scoped API tokens generated server-side.
5. **Atomic Circulation Transactions:** Checkouts and check-ins must execute as atomic units: updating `BookCopy`, creating/closing the `Loan`, and appending the `BookHistory` record must succeed together or fail entirely.
6. **Search Cache Synchronization:** Any insert, update, or deletion of a `Book` or its copy availability must immediately trigger `syncBookToSearchIndex(bookId)` post-commit.
7. **Analytics Source Integrity:** Aggregated collection analytics and reports must query PostgreSQL directly via Prisma aggregate queries, never the Meilisearch index.
8. **Strict Zero-Cost Infrastructure ($0):** The entire application stack must operate within 100% free-tier services (Vercel Hobby, Neon/Supabase Free Tier, Clerk Free Hobby Tier up to 10k MAUs, Cloudflare R2 10 GB Free Tier, and open-source standalone local Meilisearch binary). No feature, background job, or integration may require a paid subscription, credit card requirement, or pay-as-you-go billing threshold.