# ShelfSync (School Library Management Platform)

## Overview

ShelfSync is a digital layer and system of record for physical school libraries, designed to streamline book discovery, circulation desk handoffs, and collection tracking. Students can search the catalog with typo-tolerant search, view live copy availability, and place online reservations; library assistants fulfill requests and record physical checkouts/returns in under 10 seconds; and administrators access collection analytics and role management tools without the system ever dealing with digital files or complex multi-tenant overhead.

## Goals

1. **Typo-Tolerant Search & Live Inventory:** Enable students to find catalog items even with misspelled queries and check real-time availability down to individual physical copies.
2. **Sub-10-Second Circulation:** Reduce in-person checkout and check-in desk workflows to under 10 seconds (≤3 clicks) per transaction.
3. **Immutable Copy Traceability:** Maintain a complete, unbroken audit log (`BookHistory`) for every physical copy, recording every holder, handoff, and condition change.
4. **Actionable Collection Intelligence:** Provide administrators with real-time analytics covering borrowing volume, category demand, overdue rates, and active reader counts.
5. **Verified Student Engagement:** Allow students to rate (1–5 stars) and review books exclusively after completing a verified physical loan.

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
- Post-loan review system with 1–5 star ratings and written feedback.

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
- Verified ratings and reviews tied strictly to completed loans.
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