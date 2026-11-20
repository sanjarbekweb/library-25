# AI Workflow Rules

Updated: 2026-09-12.

## Authority and Scope

Read root AGENTS.md, every context-library document and the active unit before implementation. Current [architecture.md](architecture.md), [code-standards.md](code-standards.md), [project-overview.md](project-overview.md) and [ui-context.md](ui-context.md) govern new work. [phase-2-execution-directive.md](phase-2-execution-directive.md) controls the repeated inspect, implement, verify, review, repair and resume cycle. U-00–U-14 in [plans.md](plans.md) is preserved historical context; [progress-tracker.md](progress-tracker.md) separates observed completion from future work.

User instructions define authorized scope. The initial architecture session changed documentation only; the subsequent user request authorizes a bounded implementation unit (U-15A.1), not production provisioning. Units use the file checklist in plans.md as the specification until a dedicated feature spec is authored. Do not invent missing feature-spec files or treat target paths as existing files.

For installed Next.js APIs, read relevant guides in node_modules/next/dist/docs before code changes. Recheck package/provider-specific documentation rather than relying on obsolete Next/Prisma recipes.

## Execution Protocol

1. Restate the active subunit, files, dependencies and applicable invariants. Keep tasks small enough to verify independently.
2. Inspect current implementation and git status; preserve unrelated user changes. Distinguish code facts, architectural choices and unverified runtime assumptions.
3. Mark only that subunit in progress. Do not reopen or falsely erase historical feature completion.
4. Implement schema expansions before consumers and constraints after reviewed data cleanup. Preserve immutable migration history. Verify backward compatibility before routing changes.
5. Enforce typed boundaries, verified actors, transactional audits and guarded state transitions. No fake human identity for jobs: the explicit AGENTS.md service-principal clarification in U-15A precedes those additions.
6. Keep one active writer per operation during extraction. Never duplicate business logic in frontend adapters or shadow live mutations.
7. Run relevant typecheck/build/lint, contract and integration tests. For concurrency use real independent PostgreSQL connections; mocks do not establish lock behavior.
8. For copy changes assert BookHistory and matching final state in the transaction; for other domain changes assert DomainAudit. Assert outbox intent commits with the mutation and replay is safe.
9. Verify any changed UI on mobile/desktop with library-relevant copy, semantic tokens, no horizontal overflow and stable skeletons.
10. Update progress with exact checks/results, deviations, migration status and remaining risks. Mark complete only when that subunit's gates pass.

## Documentation-Only Changes

Check Markdown structure, local links, cross-document decisions, roadmap IDs, preserved historical unit bodies and git diff. Do not run a production load test or application build solely for prose changes. Record that no runtime fixes were implemented and no capacity result was established.

Do not leave generated citation placeholders or interactive elicitation markup in active specifications. Keep historical unit content unchanged; its archival artifacts are explicitly labeled. Use descriptive source links and inspection dates for researched decisions.

## Isolation and Increment Size

- Separate persistence/schema work, UI integration, background jobs and unrelated domain slices into their listed subunits.
- Do not create new dependencies/packages without a concrete consumer and verification plan.
- Backend code must not import Next runtime APIs; frontend contracts must not import Prisma.
- Keep database transactions short; integration calls execute through durable outbox processing.
- Apply all system invariants, including conditional update count checks and database/search pagination/aggregation.
- Use verified identity and current account authorization at every protected boundary, never UI hiding.
- Record unrelated findings in progress notes rather than widening a feature implementation silently.

## Protected Artifacts and Rollout

- Do not rewrite committed prisma/migrations histories. Add migrations and review data-repair/backfill effects separately.
- Extend components/ui primitives through wrappers/tokens; scoped configuration changes are allowed when the active migration unit calls for them.
- Never log secrets while inspecting environment topology. Record endpoint mode/limits without credentials.
- Before backend cutover, prove contracts, old/new schema compatibility, idempotency continuity, cache isolation and a single writer/worker owner.
- Do not provision paid services, publish externally or run production data repairs solely because a future roadmap lists them.
- Investigate failures from full evidence, fix the root cause, and rerun affected checks. Never hide failures with any/type suppressions, lowered load thresholds or invented pass reports.

## Completion Evidence

Feature builds establish compilation, not production capacity. U-22 additionally requires versioned fixtures, reproducible k6 workloads, per-route latency/error results, DB/pool/worker metrics, integrity assertions and recovery evidence. Report separate healthy, degraded and burst behavior.

Keep unresolved hosting budget, runtime compatibility and measured capacity visible. A documentation decision can be complete while all implementation units remain pending.
