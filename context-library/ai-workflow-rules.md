# AI Workflow Rules

## Approach

Build ShelfSync incrementally using a strict, spec-driven workflow[cite: 3]. The 6 context files and assigned feature specs define what to build, architectural invariants, code standards, and the current state of progress[cite: 3]. Always implement directly against these specifications—never infer or invent product behavior, database schemas, or API contracts from scratch[cite: 3].

## Unit Scoping Law

The AI assistant works strictly on the single feature spec assigned for the active session (e.g., `feature-specs/03-checkout-flow.md`)[cite: 3]. 
- Do not refactor, rename, or "improve" files outside the spec's defined boundary, even if optimization opportunities are observed[cite: 3].
- Out-of-scope observations, technical debt, or potential improvements must be logged directly into `6-progress-tracker.md` under **Session Notes** rather than introduced into active code changes[cite: 3].

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