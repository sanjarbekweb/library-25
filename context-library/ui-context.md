# UI Context

Updated: 2026-09-09. Governs UI work during hardening and backend extraction. This documentation revision does not change existing components or CSS.

## Design Authority

Root AGENTS.md and the established Tailwind v4 tokens in `app/globals.css` (later `apps/web/app/globals.css`) are authoritative. The former violet/coral glow palette and mismatched hardcoded token table are superseded. Existing legacy CSS tokens may remain until a scoped UI change; they are not permission to add arbitrary accents.

| Purpose | Established token usage |
| --- | --- |
| Canvas | canvas-warm / background, with supported dark theme |
| Cards and panels | bg-card, text-card-foreground |
| Text | text-foreground, text-muted-foreground |
| Borders and subtle grouping | border-border, bg-muted/50, bg-accent |
| Brand actions | brand-yellow and brand-blue |
| State | Existing semantic success/emerald and destructive/rose tokens; always include a text label/icon |

Use tone, typography and hairline borders for hierarchy. No rainbow status/category badges, hardcoded hex values in components, or arbitrary purple/coral glows. Preserve dark/light contrast and focus visibility.

## Typography, Geometry and Motion

- Use configured fonts: Inter body, Plus Jakarta Sans display, JetBrains Mono only where useful for identifiers.
- Bold concise headings, readable body text, clear label/value hierarchy. Do not expose internal queue, ORM or pool terminology in normal library workflows.
- Cards use rounded-2xl/rounded-3xl, pills use rounded-full, with responsive spacing. Existing shadcn primitives are extended through wrappers/tokens, not broadly rewritten.
- Restrained hover/focus transitions; honor prefers-reduced-motion and avoid animations that obstruct reading or action completion.
- Skeletons match final card/table/dialog dimensions. Reserve image dimensions and avoid layout shifts on hydration or API completion.

## Responsive and Accessible Behavior

- Use px-4 sm:px-6 and mobile-first reflow with min-w-0, wrapping and bounded dialogs.
- No unintended horizontal page scrolling at 320px, 375px, 768px or desktop widths. Convert dense tables into readable mobile rows/cards when required.
- Controls target at least 44x44 CSS pixels with space between actions. Modals fit the viewport, scroll vertically, trap focus and restore it on close.
- Visible labels, semantic buttons, keyboard operation, accessible dialog titles and aria-live feedback for asynchronous outcomes. Do not communicate state only through color.
- Retain <=3-click and <10-second circulation workflow; exact copy confirmation must stay clear and quick.

## Data Ownership and Loading

Next Server Components use the typed backend API for SSR after each migrated slice. Preserve metadata, JSON-LD, deep links and browser history. Keep filter/sort/page state in URLs; fetch only the requested page. No browser catalog sorting of an unbounded dataset.

Personal loans/holds/staff data are private and no-store initially. Mutable availability is advisory until a transaction succeeds; render the committed response immediately and refresh the relevant list. Abort superseded search requests and debounce (initial 300ms); do not poll every mounted card independently.

Preserve existing public/private behavior until the explicit U-21 public-catalog correction. Backend authorization remains the authority even when navigation hides an action.

## Mutation and Error States

| Situation | User-facing behavior |
| --- | --- |
| Reservation available | “Request Book”; show hold duration and pickup deadline |
| Request pending | Disable duplicate submission and expose progress; keep the same idempotency key for retries |
| Another reader claims copy | “This copy was just reserved. Refresh availability to choose another copy.” |
| Stale circulation state | “This copy's status changed. Refresh the record before confirming checkout.” |
| Unknown timeout outcome | “We couldn't confirm the result. Check your reservations before trying again.” Offer same-key retry/status refresh, never assume failure |
| Search degradation | “Search is temporarily limited. Try the title, author, or ISBN.” Only when a qualified fallback is actually serving |
| Search unavailable | “Catalog search is temporarily unavailable. Try again shortly.” Do not fabricate zero results |
| Empty successful search | “No titles match your search. Try another title, author, or ISBN.” |
| Rate limited | Show retry guidance matching Retry-After; no aggressive automatic retries |
| Forbidden/inactive | Explain access restriction and offer appropriate sign-in/library support action |
| Successful return | “Return confirmed”; show committed condition/status |

Use clear actions such as Request Book, Confirm Checkout, Confirm Return and Refresh Availability. Do not add renewal features simply because example copy mentions them.

## Reviews, Dates and Staff Views

- Distinguish direct student reviews from reviews tied to a completed loan; only verified loans receive a borrowing-verification label.
- Rating totals/distributions come from API aggregates; round for display only. Paginate review history.
- Format UTC timestamps in the configured school/user display timezone. Date-only hold selection is interpreted in the configured school timezone.
- Label loan deadlines as “Expected return” where predicting availability; never promise a physical copy's return.
- Display actor role-at-time in audit views when available, and “Role not recorded” for legacy unknown roles. Never substitute the actor's current role.
- Keep implementation metrics in operational tooling, not student screens.

## Verification

For every changed UI slice: test mobile/desktop layout, keyboard focus, loading/empty/error/success/conflict states, slow network and session expiry. Verify no personal cache leakage between two accounts. Compare SSR metadata and deep links before/after extraction. Run final Lighthouse and desk timing gates in [plans.md](plans.md); do not claim visual checks that were not performed.
