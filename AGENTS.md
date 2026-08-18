<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Single Responsibility & Architectural Isolation Law

Whenever any new feature, file, component, service function, schema, or route is added:
1. **Single Responsibility:** Every newly added file, component, service function, schema, or route handler must have a clear, isolated, and single responsibility. Never mix database mutations, presentation logic, or authentication handling in a single place.
2. **Actor Accountability & Traceability:** Any addition or state modification touching system domain data must explicitly record and attribute the responsible actor (`actorId`, `actorRole`, `BookHistory` audit entry) derived strictly from server-verified session claims (`auth()`).
3. **Zero Orphaned or Ambiguous Additions:** Every newly created component or endpoint must be fully typed with strict TypeScript, validated at system boundaries via Zod schemas, and fully integrated into the UI and progress tracking documentation.

# Design Responsiveness & Mobile/Desktop Visual Responsibility Law

Whenever any UI component, page layout, modal, header, table, or control panel is created or modified:
1. **Flawless Mobile & Desktop Responsiveness:** Every interface must be meticulously designed, formatted, and optimized to look stunning and function effortlessly on both mobile screens (smartphones/tablets) and desktop viewports. Layouts must reflow cleanly using Tailwind breakpoint utilities (`sm:`, `md:`, `lg:`, `xl:`).
2. **Zero Mobile Horizontal Overflow:** Unintended horizontal scrolling on mobile viewports is strictly prohibited. All cards, dialogs, buttons, forms, and telemetry bars must fit within the screen boundaries with proper responsive padding (`px-4 sm:px-6`).
3. **Touch-Friendly Targets & Ergonomic Legibility:** All interactive controls (buttons, input fields, star rating pickers, tab switches, exit buttons) must maintain accessible touch target sizes on mobile screens without cramped spacing or overlapping text.
4. **Visual Excellence Across Form Factors:** Preserve design system tokens (`canvas-warm`, `brand-yellow`, `brand-blue`), dark/light mode balance, zero-CLS shimmer skeletons, and smooth micro-interactions consistently across all device sizes.

# Color Palette Discipline & Minimalist Palette Law

Whenever styling components, layouts, badges, cards, or status indicators:
1. **Restrained & Minimal Palette:** Stick strictly to a core, unified color palette (`brand-yellow`, `brand-blue`, neutral warm/dark canvas tones, and semantic state indicators like emerald for success/active and rose for overdue/errors). Avoid introducing excessive, arbitrary accent colors (e.g. rainbow badges or too many mismatched pastel tints).
2. **Design Token Authority:** Always use established design tokens (`bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `brand-yellow`, `brand-blue`). Hardcoded hex codes or ad-hoc Tailwind colors outside the core palette are strictly prohibited.
3. **Visual Hierarchy through Tone & Contrast:** Rely on typography weights, subtle opacity layers (`bg-accent`, `bg-muted/50`), and crisp hairline borders rather than multi-colored background fills to create depth and structure.
