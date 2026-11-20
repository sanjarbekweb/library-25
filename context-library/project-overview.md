# ShelfSync (School Library Management Platform)

## Overview

ShelfSync is a digital layer and system of record for physical school libraries, designed to streamline book discovery, circulation desk handoffs, and collection tracking. Students can search the catalog with typo-tolerant search, view live copy availability, and place online reservations; library assistants fulfill requests and record physical checkouts/returns in under 10 seconds; and administrators access collection analytics and role management tools without the system ever dealing with digital files or complex multi-tenant overhead.

## Goals

1. **Typo-Tolerant Search & Live Inventory:** Enable students to find catalog items even with misspelled queries and check real-time availability down to individual physical copies.
2. **Sub-10-Second Circulation:** Reduce in-person checkout and check-in desk workflows to under 10 seconds (≤3 clicks) per transaction.
3. **Immutable Copy Traceability:** Maintain a complete, unbroken audit log (`BookHistory`) for every physical copy, recording every holder, handoff, and condition change.
4. **Actionable Collection Intelligence:** Provide administrators with real-time analytics covering borrowing volume, category demand, overdue rates, and active reader counts.
5. **Student Engagement:** Support completed-loan reviews and U-14 direct student reviews. Clearly label verified-loan reviews; direct reviews must not overwrite a loan-linked review.

## Core User Flow

1. **Sign-in & Discovery:** Student signs in via Clerk, searches the catalog using typo-tolerant search, and checks copy availability.
2. **Reservation:** Student requests an available book copy online.
3. **Desk Handoff:** Student visits the library circulation desk in person.
4. **Rapid Checkout:** Assistant searches for the student or requested title, selects the physical copy, and confirms checkout (system sets due date, updates holder, and appends a `BookHistory` log).
5. **Active Loan Tracking:** The borrowed book appears in the student's personal "My Loans" view with the return deadline.
6. **Return & Check-in:** Student returns the physical book to the desk; the assistant inspects the condition, records check-in, and clears the current holder.
7. **Feedback:** Student leaves a 1–5 star rating and comment on the book's catalog page.

## Features

### Catalog & Student Experience

- Typo-tolerant search powered by Meilisearch.
- Real-time, per-copy availability status (Available, Reserved, Checked Out, Maintenance).
- Online reservation request pipeline.
- Personal "My Loans" dashboard displaying active checkouts, return due dates, and borrowing history.
- Completed-loan reviews and direct student reviews with 1–5 star ratings and written feedback; verified borrowing is displayed only when supported by a completed loan.

### Circulation Desk Operations

- Rapid-action checkout and check-in console optimized for ≤3 clicks per operation.
- Direct walk-up checkout support (bypassing prior online reservation).
- Full CRUD management for book titles and individual physical copies (`BookCopy`).
- Automated, immutable audit trail generation (`BookHistory`) tracking loans, returns, handlers, and physical condition flags.

### Administration & Collection Analytics

- Role-based access control (Student, Assistant, Admin) with user promotion and deactivation.
- Real-time collection analytics dashboard: borrow volume over time, top books/categories, overdue rates, and active student metrics.
- Feedback and review moderation tools.

## Scope

### In Scope

- Authentication and role-based access control (Student / Assistant / Admin) via Clerk.
- Book catalog and physical copy (`BookCopy`) CRUD management.
- Typo-tolerant search integration using Meilisearch.
- Online reservation request queue with in-person desk fulfillment.
- Direct in-person circulation desk checkout and check-in.
- Immutable per-copy audit trail (`BookHistory`).
- Verified completed-loan ratings/reviews plus direct authenticated student reviews introduced in U-14.
- Admin analytics dashboard and user/role administration.
- Server-rendered catalog pages with dynamic SEO metadata and JSON-LD schema.

### Out of Scope

- Payments, overdue fines, fee collection, or billing systems.
- Multi-branch or multi-school tenancy architecture.
- Direct hardware barcode/RFID scanner drivers (data schema allows future identifiers, but no native hardware scanner code in MVP).
- External SMS or email push notification infrastructure (due dates displayed strictly in-app for MVP).
- Digital file distribution (no PDF/e-book downloads or digital lending).
- Public third-party developer APIs.

## Success Criteria

1. **Typo Tolerance:** A misspelled search query (e.g., `"hary poter"`) returns the intended book within the top search results.
2. **Circulation Speed:** An authenticated assistant can execute a full checkout transaction (search student → select book → confirm) in ≤3 clicks and under 10 seconds.
3. **Audit Integrity:** 100% of checkouts, returns, and condition changes produce an immutable `BookHistory` row with zero orphan loans.
4. **Data Freshness:** Admin analytics update upon page reload within ≤60 seconds of a checkout or return event.
5. **SEO & Performance:** Catalog and book detail pages achieve Google Lighthouse scores of ≥90 for Performance and ≥95 for SEO with valid server-rendered `<title>`, meta descriptions, and JSON-LD structured data.
## Scale and Architecture Target (2026-09-09)

- 3,000 registered users and 1,000 concurrently active users. Qualification uses 10,000 titles, 30,000 copies and realistic historical loan/review volume as specified in [plans.md](plans.md).
- Independently deployable Next.js presentation/SSR frontend and NestJS/Fastify modular backend in one npm-workspace repository. Retain PostgreSQL/Prisma, Clerk, Meilisearch and R2. This is an internal product API, not a public developer API.
- Harden transactions, database pooling and bounded queries before extracting backend slices. U-15A.1 introduces bounded database configuration; remaining implementation and capacity qualification are tracked separately in [progress-tracker.md](progress-tracker.md).
- Healthy-state interactive API SLO: p95 <200ms, p99 <500ms, unexpected error rate <0.1% under the defined active-user and 200-operations/second profiles. This excludes login-provider flows and browser rendering, which are separately measured. It is a qualification target, not a guarantee already achieved.
- Test 1,000-request bursts separately for exclusive allocation, audit integrity and recovery. Registered users, active users, requests/second and in-flight requests are different measurements.
- Search availability is advisory, normally indexed within 5 seconds at p95. The database validates the actual reservation/checkout. Loan due dates are estimates of expected return, not guarantees that a physical copy will be back.
- Preserve the <=60-second analytics freshness goal and existing Lighthouse/desk-workflow goals. Bound staleness across all caches rather than assigning 60 seconds independently at every layer.
- Normal production search requires Meilisearch; an indexed, tested PostgreSQL fallback is permitted during failure. Do not silently fall back to catalog-wide in-process search.
- Free local development is retained. Production hosting/capacity budget is unresolved and must be supported by load evidence; no assumption that free tiers guarantee the target.

## Product Consistency Rules

- Target catalog/search/details are public, while requests, loans and staff tools require current authorization. The current proxy protects /catalog and /api/search; U-21 explicitly closes this implementation/documentation mismatch.
- Reservations: active students, default 48h and supported 1–7 day/calendar hold selection. Staff circulation retains the current maximum 30-day loan duration. Calendar dates use the school timezone (initial Asia/Tashkent deployment assumption); API timestamps are UTC.
- Direct reviews: one direct review per student/title, distinct from one review per completed loan. Aggregates include visible reviews only; preserve existing per-loan records. No new UI review policy is silently inferred from a schema migration.
- State-changing operations record the verified actor and an atomic audit. Scheduled expiration has an explicit authenticated service actor, never attribution to a student who happens to view a page.
- Historical feature completion is retained. Production readiness additionally requires the new transaction, migration, operational and capacity gates.
