# AI Workflow Rules

## Approach

Build ShelfSync incrementally using a strict, spec-driven workflow[cite: 3]. The 6 context files and assigned feature specs define what to build, architectural invariants, code standards, and the current state of progress[cite: 3]. Always implement directly against these specifications—never infer or invent product behavior, database schemas, or API contracts from scratch[cite: 3].

## Unit Scoping Law

The AI assistant works strictly on the single feature spec assigned for the active session (e.g., `feature-specs/03-checkout-flow.md`)[cite: 3]. 
- Do not refactor, rename, or "improve" files outside the spec's defined boundary, even if optimization opportunities are observed[cite: 3].
- Out-of-scope observations, technical debt, or potential improvements must be logged directly into `6-progress-tracker.md` under **Session Notes** rather than introduced into active code changes[cite: 3].

## Responsibility & Accountability Law

Whenever any new feature, file, component, service function, schema, or route is added:
1. **Single Responsibility:** Every newly added file, component, service function, schema, or route handler must have a clear, isolated, and single responsibility. Never mix database mutations, presentation logic, or authentication handling in a single place.
2. **Actor Accountability & Traceability:** Any addition or state modification touching system domain data must explicitly record and attribute the responsible actor (`actorId`, `actorRole`, `BookHistory` audit entry) derived strictly from server-verified session claims (`auth()`).
3. **Zero Orphaned or Ambiguous Additions:** Every newly created component or endpoint must be fully typed with strict TypeScript, validated at system boundaries via Zod schemas, and fully integrated into the UI and progress tracking documentation.

## Design Responsiveness & Mobile/Desktop Visual Responsibility Law

Whenever any UI component, page layout, modal, header, table, or control panel is created or modified:
1. **Flawless Mobile & Desktop Responsiveness:** Every interface must be meticulously designed, formatted, and optimized to look stunning and function effortlessly on both mobile screens (smartphones/tablets) and desktop viewports. Layouts must reflow cleanly using Tailwind breakpoint utilities (`sm:`, `md:`, `lg:`, `xl:`).
2. **Zero Mobile Horizontal Overflow:** Unintended horizontal scrolling on mobile viewports is strictly prohibited. All cards, dialogs, buttons, forms, and telemetry bars must fit within the screen boundaries with proper responsive padding (`px-4 sm:px-6`).
3. **Touch-Friendly Targets & Ergonomic Legibility:** All interactive controls (buttons, input fields, star rating pickers, tab switches, exit buttons) must maintain accessible touch target sizes on mobile screens without cramped spacing or overlapping text.
4. **Visual Excellence Across Form Factors:** Preserve design system tokens (`canvas-warm`, `brand-yellow`, `brand-blue`), dark/light mode balance, zero-CLS shimmer skeletons, and smooth micro-interactions consistently across all device sizes.

## Color Palette Discipline & Minimalist Palette Law

Whenever styling components, layouts, badges, cards, or status indicators:
1. **Restrained & Minimal Palette:** Stick strictly to a core, unified color palette (`brand-yellow`, `brand-blue`, neutral warm/dark canvas tones, and semantic state indicators like emerald for success/active and rose for overdue/errors). Avoid introducing excessive, arbitrary accent colors (e.g. rainbow badges or too many mismatched pastel tints).
2. **Design Token Authority:** Always use established design tokens (`bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `brand-yellow`, `brand-blue`). Hardcoded hex codes or ad-hoc Tailwind colors outside the core palette are strictly prohibited.
3. **Visual Hierarchy through Tone & Contrast:** Rely on typography weights, subtle opacity layers (`bg-accent`, `bg-muted/50`), and crisp hairline borders rather than multi-colored background fills to create depth and structure.

## Step-by-Step Execution Protocol

1. **Context Ingestion:** Read all 6 context files and the assigned feature spec in full before generating any code[cite: 3].
2. **Plan Restatement:** State the implementation plan in 3–6 concise bullet points: files created/modified, and specific System Invariants (`2-architecture.md`) that apply to this unit[cite: 3].
3. **Status Update (Start):** Mark the unit as `[/] In Progress` in `6-progress-tracker.md`[cite: 3].
4. **Implementation:** Write production-ready code adhering strictly to `3-code-standards.md` and `4-ui-context.md` (no ad hoc styling, inline hex codes, or untyped structures)[cite: 1, 3].
5. **Verification:** Run `npm run build` and `npx tsc --noEmit`. Both must pass with zero warnings or errors[cite: 3].
6. **Audit Trail Verification:** If the unit mutates `BookCopy.status` or `BookCopy.currentHolderId`, manually verify that an accompanying `BookHistory` record is generated in the same `prisma.$transaction`[cite: 3].
7. **Search Index Synchronization:** Verify that any mutation affecting `Book` catalog entries or `BookCopy` availability calls `syncBookToSearchIndex`[cite: 3].
8. **Status Update (Finish):** Mark the unit as `[x] Completed` in `6-progress-tracker.md` with concise session notes (features built, deviations justified, new environment variables added)[cite: 3].

## Scoping & Splitting Rules

Prefer small, verifiable increments over large, speculative changes[cite: 3]. Split an implementation step immediately if it combines:
- Database schema migrations and client-side UI components[cite: 3].
- Multiple unrelated route handlers or service domains[cite: 3].
- Background search indexing synchronization with unrelated catalog CRUD logic[cite: 3].

If a change cannot be verified end-to-end within a single validation cycle, the unit is too large—split it into discrete sub-tasks[cite: 3].

## Handling Missing Requirements & Invariant Conflicts

- **No Speculative Features:** Do not invent behavior not documented in the specification or context files[cite: 3].
- **Resolving Ambiguity:** If a requirement is ambiguous, state the working assumption explicitly and note it in `6-progress-tracker.md` before writing code[cite: 3].
- **Invariant Conflicts:** If a feature requirement directly conflicts with a System Invariant in `2-architecture.md`, explicitly highlight the conflict and propose an invariant-compliant alternative rather than proceeding with a violation[cite: 3].

## Error Escalation Protocol

When encountering a build error, TypeScript compilation failure, or runtime exception:
1. **Full Trace Inspection:** Read the complete error output and stack trace before formulating a fix—do not assume root causes from surface patterns[cite: 3].
2. **Root Cause Statement:** State the root cause in one sentence before proposing or executing code changes[cite: 3].
3. **Targeted Remediation:** Propose the minimal change required to resolve the issue[cite: 3]. If a fix requires modifying more than 2 files outside the active unit's scope, stop and ask for guidance[cite: 3].
4. **Zero Type Suppressions:** Never suppress TypeScript errors using `@ts-ignore`, `@ts-nocheck`, or `any` type casting[cite: 3]. Resolve the underlying schema/type mismatch cleanly[cite: 3].

## Protected Files

Do not modify the following files unless explicitly directed by a designated spec:
- `components/ui/*` (Generated shadcn/ui primitives—extend via wrapper components or CSS variables instead)[cite: 3].
- `prisma/migrations/*` (Committed database migration histories)[cite: 3].
- Core library configuration files (`tailwind.config.js`, `tsconfig.json`, `next.config.js`) unless a new design token or global plugin is explicitly required[cite: 1, 3].

## Keeping Documentation in Sync

Update the relevant context files whenever an implementation step modifies:
- System boundaries or directory topology (`2-architecture.md`)[cite: 3].
- Shared TypeScript validation schemas or response envelopes (`3-code-standards.md`)[cite: 3].
- Design tokens, CSS variables, or layout patterns (`4-ui-context.md`)[cite: 1, 3].
- Completed sprint deliverables and open questions (`6-progress-tracker.md`)[cite: 3].

## Communication Style

- **Direct & Technical:** Skip conversational preambles and meta-announcements[cite: 3]. State the plan, trade-offs, and implementation directly[cite: 3].
- **Transparent Invariant Tracking:** State which invariants apply to each action and verify them upon completion[cite: 3].