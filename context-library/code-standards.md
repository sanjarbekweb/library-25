```markdown
# Code Standards

## General

- **Single Responsibility:** Keep components, service functions, and route handlers focused on one specific job[cite: 3].
- **Root Cause Resolution:** Fix core schema, type, and transaction issues directly rather than adding defensive UI patches or string-matching workarounds[cite: 3].
- **Separation of Concerns:** Keep presentation, business logic, validation schemas, and database operations strictly segregated across architectural boundaries[cite: 3].
- **Naming Conventions:** Use `kebab-case` for filenames, `PascalCase` for React components/types, and `camelCase` for functions, variables, and database fields[cite: 3].

## TypeScript

- **Strict Mode:** `strict: true` must be enabled across `tsconfig.json` with zero compiler exceptions allowed[cite: 3].
- **Banned `any`:** `any` is strictly prohibited[cite: 3]. Use `unknown` with type narrowing or derive types directly from Zod schemas via `z.infer<typeof schema>`[cite: 3].
- **Discriminated Unions:** Prefer discriminated unions over multiple optional boolean flags (e.g., `LoanStatus: 'ACTIVE' | 'RETURNED' | 'OVERDUE'` rather than `isActive: boolean; isReturned: boolean`)[cite: 3].
- **Boundary Validation:** Every external payload (API parameters, query strings, form inputs, webhook bodies) must be parsed through a Zod schema before consumption[cite: 3].

## Next.js & React

- **Server-First Execution:** Default to Server Components for layouts, catalog browsing, and detail views[cite: 3]. Add `'use client'` strictly when lifecycle hooks, browser APIs, or local state are required[cite: 3].
- **Data Ingestion:** Fetch data for pages directly in Server Components by calling `lib/services/*` functions—never execute client-side `fetch` + `useEffect` waterfalls for initial renders[cite: 3].
- **Mutation Pattern:** Execute user mutations using Server Actions where applicable[cite: 3]. Reserve `/api/*` endpoints for webhook receivers or client-side debounced queries[cite: 3].
- **Role Enforcement:** Route segment `layout.tsx` files serve as the primary security checkpoint[cite: 3]. Check `auth()` from Clerk and issue server-side `redirect()` calls before child trees render[cite: 3].

## Styling

- **Utility Merging:** Use the `cn()` utility (`clsx` + `tailwind-merge`) for all conditional class compositions[cite: 3]. Never manually string-concatenate class names[cite: 3].
- **Token Consistency:** Use design tokens defined in `tailwind.config.js` (`canvas-warm`, `brand-yellow`, `brand-blue`, `gamify-streak`) instead of arbitrary hardcoded color hex values[cite: 1, 3].
- **Radius Scale:** Strictly follow defined border radius tokens (`rounded-2xl` for cards, `rounded-full` for badges/pills)[cite: 1].
- **Zero-CLS Skeletons:** Skeleton placeholders must match the exact dimensions, margin, and padding of the target elements to prevent layout shift during loading[cite: 1].

## API Routes & Error Handling

- **Uniform Response Format:** All API route handlers must adhere to the standardized response envelope[cite: 3]:
  ```ts
  // Success
  { ok: true, data: T }

  // Failure
  { ok: false, error: { code: string, message: string } }

```

* **HTTP Status Mapping:**
* `401` — Unauthenticated (user session missing)


* `403` — Unauthorized (authenticated user lacks required role)


* `404` — Resource not found


* `409` — Conflict (e.g., attempting to check out an already-borrowed physical copy)


* `422` — Validation error (Zod parse failure with structured field errors)


* `500` — Internal server error (log full trace server-side; return generic message to client)




* **Custom Service Errors:** Service layer functions throw typed `ServiceError(code, message)` instances rather than generic `Error` objects so route handlers can map HTTP status codes without string parsing.



## Data and Storage

* **Database Authority:** PostgreSQL via Prisma is the single source of truth for all operational records, state, and audit logs.


* **Search Index as Cache:** Meilisearch is a derived cache strictly for typo-tolerant query relevance—never query Meilisearch for transactional verification or analytics.


* **Media Storage:** Cloudflare R2 stores cover images. Store only immutable public CDN URLs within the database.


* **Atomic Operations:** Multi-record state modifications (e.g., checkout/check-in) must execute inside `prisma.$transaction`.


* **Prisma Client Singleton:** Instantiate a single Prisma client in `lib/prisma.ts` utilizing the standard Next.js global development cache guard.



## Package Management & Dependencies

* **Approved Dependencies:**
* `zod` for shared schema validation


* `date-fns` for date formatting and interval calculations


* `@tanstack/react-query` (restricted to debounced search-as-you-type and polling only)


* `lucide-react` for icon consistency




* **Prohibited Libraries:**
* `moment.js` (use `date-fns` or native `Intl`)


* `lodash` (use modern native JavaScript ES methods or `es-toolkit`)


* Any runtime CSS-in-JS framework (Tailwind CSS utility engine only)





## Testing Discipline

* **Audit Trail Coverage:** Every service test modifying `BookCopy.status` or `BookCopy.currentHolderId` must explicitly assert that a corresponding `BookHistory` record is written.


* **Validation Contract Testing:** Test Zod schemas against edge cases (empty strings, invalid dates, out-of-range ratings, negative numbers) in addition to happy paths.


* **Role Boundary Testing:** Verify that unauthorized roles attempting access to protected assistant and admin routes trigger immediate redirects.



## File Organization

* `app/` — Next.js App Router pages, layouts, error boundaries, and route handlers.


* `components/` — Reusable React UI components divided into `shared/` primitives and feature-specific `modules/`.


* `lib/services/` — Core business logic, domain operations, and Prisma database queries.


* `lib/schemas/` — Zod validation schemas shared between client forms and backend route handlers.


* `lib/search/` — Meilisearch client instance, search helpers, and index synchronization routines.


* `types/` — TypeScript interfaces, global declarations, and inferred schema types.



```

<ElicitationsGroup message="File 3 complete. Ready for File 4 (4-ui-context.md)?">
  <Elicitation label="Proceed to 4-ui-context.md" query="Let's build File 4: 4-ui-context.md based on ShelfSync requirements."/>
  <Elicitation label="Make changes to File 3" query="I'd like to adjust some rules in 3-code-standards.md before proceeding."/>
</ElicitationsGroup>

```