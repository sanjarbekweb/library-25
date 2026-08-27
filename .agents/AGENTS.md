# ShelfSync Agent Rules & Guidelines

## 1. Single Responsibility & Architectural Isolation Law

Whenever any new feature, file, component, service function, schema, or route is added:
- **Single Responsibility:** Every newly added file, component, service function, schema, or route handler must have a clear, isolated, and single responsibility. Never mix database mutations, presentation logic, or authentication handling in a single place.
- **Actor Accountability & Traceability:** Any addition or state modification touching system domain data must explicitly record and attribute the responsible actor (`actorId`, `actorRole`, `BookHistory` audit entry) derived strictly from server-verified session claims (`auth()`).
- **Zero Orphaned or Ambiguous Additions:** Every newly created component or endpoint must be fully typed with strict TypeScript, validated at system boundaries via Zod schemas, and fully integrated into the UI and progress tracking documentation.

## 2. Design Responsiveness & Mobile/Desktop Visual Responsibility Law

Whenever any UI component, page layout, modal, header, table, or control panel is created or modified:
- **Flawless Mobile & Desktop Responsiveness:** Every interface must be meticulously designed, formatted, and optimized to look stunning and function effortlessly on both mobile screens (smartphones/tablets) and desktop viewports. Layouts must reflow cleanly using Tailwind breakpoint utilities (`sm:`, `md:`, `lg:`, `xl:`).
- **Zero Mobile Horizontal Overflow:** Unintended horizontal scrolling on mobile viewports is strictly prohibited. All cards, dialogs, buttons, forms, and telemetry bars must fit within the screen boundaries with proper responsive padding (`px-4 sm:px-6`).
- **Touch-Friendly Targets & Ergonomic Legibility:** All interactive controls (buttons, input fields, star rating pickers, tab switches, exit buttons) must maintain accessible touch target sizes on mobile screens without cramped spacing or overlapping text.
- **Visual Excellence Across Form Factors:** Preserve design system tokens (`canvas-warm`, `brand-yellow`, `brand-blue`), dark/light mode balance, zero-CLS shimmer skeletons, and smooth micro-interactions consistently across all device sizes.

## 3. Color Palette Discipline & Minimalist Palette Law

Whenever styling components, layouts, badges, cards, or status indicators:
- **Restrained & Minimal Palette:** Stick strictly to a core, unified color palette (`brand-yellow`, `brand-blue`, neutral warm/dark canvas tones, and semantic state indicators like emerald for success/active and rose for overdue/errors). Avoid introducing excessive, arbitrary accent colors (e.g. rainbow badges or too many mismatched pastel tints).
- **Design Token Authority:** Always use established design tokens (`bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `brand-yellow`, `brand-blue`). Hardcoded hex codes or ad-hoc Tailwind colors outside the core palette are strictly prohibited.
- **Visual Hierarchy through Tone & Contrast:** Rely on typography weights, subtle opacity layers (`bg-accent`, `bg-muted/50`), and crisp hairline borders rather than multi-colored background fills to create depth and structure.

## 4. Text / Content Relevance & Library UX Copywriting Law

Whenever creating or reviewing UI copy, microcopy, modals, toasts, tooltips, or empty states:
- **Contextual Library Tone:** All headings, descriptions, empty states, search placeholders, and error messages must fit an educational, trustworthy, and modern library application. Use precise domain terminology (e.g. "Available on Shelf", "Loan Period", "Borrow Request", "Catalog Index", "Overdue Notice") that is student-friendly and librarian-accurate.
- **Actionable & Crisp Microcopy:** Action buttons, call-to-actions, and dialog prompts must clearly state the exact outcome (e.g. "Request Book", "Renew Borrowing", "Confirm Return") rather than vague verbs like "Submit" or "Click here".
- **Zero Developer Placeholder Slop:** Never leave generic phrases ("Lorem ipsum", "Something went wrong", "Test error"). Always provide constructive feedback and guidance on what the user should do next.

