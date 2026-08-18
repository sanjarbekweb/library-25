```markdown
# ShelfSync: Engineering Implementation Plan & Execution Specifications

**Target System:** ShelfSync (School Library Management Platform)[cite: 3]  
**Architecture Base:** Next.js 15 (App Router), TypeScript, PostgreSQL, Prisma, Meilisearch, Clerk, Tailwind CSS[cite: 3]  
**Methodology:** Spec-Driven Step-by-Step Execution[cite: 3]

---

## 1. Execution Protocol & Quality Gates

Each unit represents an isolated, verifiable milestone[cite: 3]. Before advancing to the next unit, the following quality gates must pass:
1. **Compilation Check:** `npx tsc --noEmit` and `npm run build` pass with zero errors[cite: 3].
2. **Invariant Verification:** System invariants defined in `2-architecture.md` are upheld (e.g., atomic `BookHistory` creation in `prisma.$transaction`, Meilisearch synchronization)[cite: 3].
3. **Tracking Update:** The corresponding milestone and checklist in `6-progress-tracker.md` are updated to reflect the completed state[cite: 3].

---

## 2. Milestone Roadmap & Detailed Unit Breakdown


```

┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                MILESTONE PIPELINE                                    │
├────────┬─────────────────────────────────────────────────┬───────────────────────────┤
│ Unit   │ Scope / Focus Area                              │ Primary Deliverable       │
├────────┼─────────────────────────────────────────────────┼───────────────────────────┤
│ U-00   │ Project Scaffolding & Containerized Environment │ Next.js + Docker Compose  │
│ U-01   │ Database Schema, Enums & Migrations             │ Prisma Models & Seeds     │
│ U-02   │ Clerk Authentication & RBAC Layer               │ Webhook Sync & Role Guard │
│ U-03   │ SSR Catalog & Book Detail SEO                   │ Server Components & Meta  │
│ U-04   │ Meilisearch Integration & Search Sync Engine    │ Typo-Tolerant Search UI   │
│ U-05   │ Online Copy Reservation Workflow                │ Reservation Queue & State │
│ U-06   │ Circulation Desk Rapid Checkout/Check-in Flow   │ Sub-10s Desk Console      │
│ U-07   │ Immutable BookHistory Audit Trail Views         │ Full Copy Lifecycle Log   │
│ U-08   │ Verified Post-Loan Feedback & Reviews           │ Rating System & Moderation│
│ U-09   │ Admin User & Role Management Console            │ RBAC Elevation Dashboard  │
│ U-10   │ Collection Growth & Circulation Analytics Panel │ PostgreSQL Aggregate Dash │
│ U-11   │ Zero-CLS Skeletons & Performance Optimization   │ Lighthouse Audit (>90/95) │
└────────┴─────────────────────────────────────────────────┴───────────────────────────┘

```

---

### Unit 00: Project Scaffolding & Containerized Infrastructure (`00-scaffold.md`)
* **Goal:** Initialize project workspace, styling system, container services, and base design tokens[cite: 1, 3].
* **Detailed Steps:**
  1. Initialize Next.js 15 App Router application with TypeScript (`strict: true`)[cite: 3].
  2. Configure `tailwind.config.js` with color tokens (`canvas-warm`, `brand-yellow`, `brand-blue`, `gamify-streak`), custom border radii (`rounded-2xl`, `rounded-full`), and coordinate grid utilities[cite: 1, 3].
  3. Initialize `shadcn/ui` components directory structure (`components/ui/`) and install base primitives (Button, Input, Dialog, Dropdown, Table, Card)[cite: 1, 3].
  4. Create `docker-compose.yml` defining local instances for PostgreSQL 16 and Meilisearch with persistent volumes[cite: 3].
  5. Configure `.env.example` with database URLs, Clerk public/secret keys, and Meilisearch master/search credentials[cite: 3].

---

### Unit 01: Database Schema, Enums & Migrations (`01-database.md`)
* **Goal:** Establish relational models, indices, relational constraints, and database seed scripts[cite: 3].
* **Detailed Steps:**
  1. Define core Prisma models[cite: 3]:
     * `User`: Clerk ID mapping, email, full name, role enum (`STUDENT`, `ASSISTANT`, `ADMIN`), active status[cite: 3].
     * `Book`: Title, author, ISBN, category, description, cover image URL, publication year[cite: 3].
     * `BookCopy`: Barcode/RFID identifier, copy condition (`MINT`, `GOOD`, `FAIR`, `DAMAGED`), status (`AVAILABLE`, `RESERVED`, `BORROWED`, `MAINTENANCE`, `LOST`), `currentHolderId`[cite: 3].
     * `Loan`: `bookCopyId`, `studentId`, `assistantId`, `borrowedAt`, `dueDate`, `returnedAt`, `status` (`ACTIVE`, `RETURNED`, `OVERDUE`)[cite: 3].
     * `BookHistory`: Immutable audit log table (`bookCopyId`, `action`, `actorId`, `previousState`, `newState`, `notes`, `createdAt`)[cite: 3].
     * `Reservation`: `bookId`, `bookCopyId`, `studentId`, `expiresAt`, `status` (`PENDING`, `FULFILLED`, `CANCELLED`, `EXPIRED`)[cite: 3].
     * `Feedback`: `bookId`, `studentId`, `loanId` (unique constraint), `rating` (1–5), `comment`, `isModerated`[cite: 3].
  2. Execute baseline Prisma migration and generate typed client[cite: 3].
  3. Create `prisma/seed.ts` with realistic school library catalogs, copies, and student fixtures[cite: 3].

---

### Unit 02: Clerk Auth Integration & RBAC Protection (`02-auth.md`)
* **Goal:** Implement secure authentication, automatic database user synchronization, and role-based route guards[cite: 3].
* **Detailed Steps:**
  1. Set up Clerk provider in `app/layout.tsx`[cite: 3].
  2. Implement webhook handler at `app/api/webhooks/clerk/route.ts` to sync user lifecycle events (`user.created`, `user.updated`, `user.deleted`) to the PostgreSQL `User` table[cite: 3].
  3. Establish server-side role assignment in Clerk `publicMetadata.role` (defaulting to `STUDENT`)[cite: 3].
  4. Build server layout guards in `app/(app)/assistant/layout.tsx` and `app/(app)/admin/layout.tsx` checking `auth()` role claims and executing redirect fallback on unauthorized access[cite: 3].

---

### Unit 03: Public Catalog & SEO Book Detail Pages (`03-catalog.md`)
* **Goal:** Deliver fast, server-rendered catalog exploration and book detail pages with real-time copy availability[cite: 3].
* **Detailed Steps:**
  1. Implement `lib/services/book-service.ts` for catalog queries and per-copy inventory fetching[cite: 3].
  2. Build Server Component catalog page with category filtering and sorting[cite: 3].
  3. Develop `/books/[id]` detail view showing metadata, cover art, available copy counts, and verified student reviews[cite: 3].
  4. Generate dynamic OpenGraph metadata, title tags, and schema.org `Book` JSON-LD structured data for every catalog entry[cite: 3].

---

### Unit 04: Meilisearch Integration & Search Sync Engine (`04-search.md`)
* **Goal:** Deliver typo-tolerant catalog search with automated index synchronization[cite: 3].
* **Detailed Steps:**
  1. Build Meilisearch client wrapper in `lib/search/client.ts`[cite: 3].
  2. Configure `books` index searchable attributes (`title`, `author`, `category`, `isbn`) and ranking rules[cite: 3].
  3. Implement `syncBookToSearchIndex(bookId)` inside `lib/search/sync.ts`[cite: 3].
  4. Build interactive search header with debounced query input using `@tanstack/react-query` calling `/api/search`[cite: 3].

---

### Unit 05: Student Online Reservation Request Flow (`05-reservation.md`)
* **Goal:** Allow students to place holds on available copies for in-person pickup[cite: 3].
* **Detailed Steps:**
  1. Implement `requestBookReservation(bookId, studentId)` service function in `lib/services/reservation-service.ts`[cite: 3].
  2. Validate copy availability; transition copy status to `RESERVED` and write a `BookHistory` log entry in `prisma.$transaction`[cite: 3].
  3. Build student "My Reservations" interface displaying active requests, pickup instructions, and expiration countdowns[cite: 3].
  4. Trigger `syncBookToSearchIndex` to immediately decrement available inventory in the search cache[cite: 3].

---

### Unit 06: Circulation Desk Rapid Checkout/Check-in Flow (`06-checkout-flow.md`)
* **Goal:** Enable assistants to execute in-person checkouts and check-ins in ≤3 clicks and under 10 seconds[cite: 3].
* **Detailed Steps:**
  1. Build assistant circulation console view (`/assistant/desk`) with rapid student and book lookup inputs[cite: 3].
  2. Implement atomic `checkoutBookCopy({ copyId, studentId, assistantId, dueDays })` in `lib/services/circulation-service.ts`:
     * Validate copy status[cite: 3].
     * Update `BookCopy` (`status: 'BORROWED'`, `currentHolderId: studentId`)[cite: 3].
     * Create active `Loan` record[cite: 3].
     * Append `BookHistory` entry (`action: 'CHECKOUT'`)[cite: 3].
     * Execute all operations inside `prisma.$transaction`[cite: 3].
  3. Implement atomic `checkinBookCopy({ copyId, assistantId, condition, notes })`:
     * Close active `Loan` (`status: 'RETURNED'`, `returnedAt: now()`)[cite: 3].
     * Clear `BookCopy.currentHolderId` and set `status: 'AVAILABLE'` (or `'MAINTENANCE'`)[cite: 3].
     * Append `BookHistory` entry (`action: 'CHECKIN'`)[cite: 3].
  4. Trigger `syncBookToSearchIndex` on all checkout and check-in mutations[cite: 3].

---

### Unit 07: BookHistory Audit Trail & Copy Traceability (`07-traceability.md`)
* **Goal:** Expose the complete, immutable historical lifecycle for every physical copy and student[cite: 3].
* **Detailed Steps:**
  1. Build `lib/services/history-service.ts` to fetch time-sequenced audit records by `copyId` or `userId`[cite: 3].
  2. Create Copy History Timeline component showing date, actor, action type, and physical condition notes[cite: 3].
  3. Create student personal "My Loans" page displaying active checkouts, historical returns, and due date alerts[cite: 3].

---

### Unit 08: Verified Post-Loan Feedback & Reviews (`08-feedback.md`)
* **Goal:** Enable 1–5 star ratings and reviews tied strictly to verified completed loans[cite: 3].
* **Detailed Steps:**
  1. Implement `submitBookFeedback({ loanId, rating, comment })` in `lib/services/feedback-service.ts` verifying that `loan.status === 'RETURNED'` and `loan.studentId === auth.userId`[cite: 3].
  2. Enforce one-feedback-per-loan unique database constraint[cite: 3].
  3. Calculate aggregated book review scores (average rating and distribution)[cite: 3].
  4. Add feedback moderation panel for administrators[cite: 3].

---

### Unit 09: Admin User & Role Management Console (`09-admin-users.md`)
* **Goal:** Provide administrative controls for user roles, assistant promotions, and account permissions[cite: 3].
* **Detailed Steps:**
  1. Build `/admin/users` management interface with search, role filters, and status badges[cite: 3].
  2. Implement Server Actions to promote users to `ASSISTANT`, demote roles, or deactivate accounts[cite: 3].
  3. Sync role changes with Clerk Backend API (`publicMetadata.role`) and PostgreSQL `User` table simultaneously[cite: 3].

---

### Unit 10: Collection Growth & Circulation Analytics Panel (`10-analytics.md`)
* **Goal:** Provide real-time data visualizations of library circulation, overdue rates, and category trends[cite: 3].
* **Detailed Steps:**
  1. Implement optimized PostgreSQL aggregation queries in `lib/services/analytics-service.ts` (monthly borrow volume, category distribution, overdue loan ratio, active reader cohorts)[cite: 3].
  2. Build Recharts visualization widgets via shadcn `chart` primitives[cite: 3].
  3. Ensure analytics dashboard queries load directly from Postgres within ≤60s freshness[cite: 3].

---

### Unit 11: Zero-CLS Skeletons, Suspense & Performance Audit (`11-performance.md`)
* **Goal:** Eliminate layout shifts, optimize loading states, and achieve Google Lighthouse targets[cite: 1, 3].
* **Detailed Steps:**
  1. Build matching shimmer skeleton components (`.skeleton-shimmer`) for Catalog cards, Book detail views, Circulation Desk, and Analytics widgets[cite: 1, 3].
  2. Wrap asynchronous data-fetching components in React `<Suspense fallback={<SkeletonComponent />}>` boundaries[cite: 1].
  3. Run Google Lighthouse audits on Catalog and Detail routes to confirm Performance ≥ 90, SEO ≥ 95, and Cumulative Layout Shift (CLS) = 0[cite: 1, 3].

---

## 3. Implementation Invariants Checklist (Every Unit)

* [ ] Database mutations touching `BookCopy` state execute within `prisma.$transaction` and write a `BookHistory` record[cite: 3].
* [ ] Any catalog or copy status change calls `syncBookToSearchIndex`[cite: 3].
* [ ] No direct Prisma calls exist inside Client Components or `app/api/*` routes (delegated to `lib/services/*`)[cite: 3].
* [ ] Input payloads pass through Zod `.safeParse()` validation[cite: 3].
* [ ] UI conforms to design tokens and zero-CLS skeleton specifications[cite: 1, 3].

```