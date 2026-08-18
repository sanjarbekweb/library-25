# Architecture Context

## Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| Framework | Next.js 15 (App Router) + TypeScript | Core application platform, SSR catalog pages, Server Actions, and API routing |
| UI & Styling | Tailwind CSS + shadcn/ui | Design tokens, accessible component primitives, and responsive layout system |
| Authentication | Clerk | User auth, session handling, and RBAC via `publicMetadata.role` (`STUDENT`, `ASSISTANT`, `ADMIN`) |
| Database & ORM | PostgreSQL + Prisma ORM | System of record for users, books, physical copies, loans, reservations, and history |
| Search Engine | Meilisearch (Docker self-hosted) | Typo-tolerant search index (`books`) for rapid catalog querying |
| Object Storage | Cloudflare R2 (S3-compatible) | Storage for book cover images (stores URLs in PostgreSQL) |
| Data Visualization | Recharts (via shadcn `chart`) | Admin dashboard visual analytics for borrow volume, category trends, and overdue metrics |
| Validation | Zod | Runtime schema validation shared across client forms, Server Actions, and API routes |
| Deployment | Vercel + Managed Postgres + Railway/Fly | App hosting, managed relational database, and persistent container for Meilisearch |

## System Boundaries

- `app/api/*` — Request handling layer. Responsible for parsing and validating input payloads via Zod, verifying session auth, delegating directly to `lib/services/*`, and returning typed JSON. Never calls Prisma or Meilisearch directly.
- `app/(app)/admin/*` & `app/(app)/assistant/*` — Protected route segments. Layout boundaries (`layout.tsx`) enforce server-side role validation using Clerk's `auth()` before rendering children. UI hiding alone is never treated as a security boundary.
- `lib/services/*` — Domain business logic layer. The only layer authorized to interact with Prisma ORM. Orchestrates multi-table database transactions and triggers search synchronization.
- `lib/search/*` — Meilisearch client wrapper and index synchronization handlers (`syncBookToSearchIndex`). Handles derived search document formatting and index updates.
- `components/*` — UI presentation and interaction layer. Separated into shared design primitives and module-specific views. Client components (`'use client'`) communicate exclusively via Server Actions or `/api/*` endpoints.

## Storage Model

- **Relational Database (PostgreSQL via Prisma):** The single source of truth for all operational data. Stores user records, catalog books, individual physical copies (`BookCopy`), active and past loans, reservations, feedback ratings/comments, and the immutable audit log (`BookHistory`).
- **Search Index (Meilisearch `books` index):** Derived, denormalized search cache containing book titles, authors, categories, tags, and real-time available copy counts. Never used as a system of record; rebuilt from PostgreSQL on demand.
- **Blob / Object Storage (Cloudflare R2):** Binary media storage for uploaded book cover images. PostgreSQL holds only the immutable public CDN URLs.

## Auth and Access Model

- **Authentication:** All users authenticate via Clerk. On user creation, a default role of `STUDENT` is assigned in `publicMetadata.role`.
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