# UI Context

## Theme

The design language unites two complementary visual systems: B2B Technical Precision and Warm Gamified Consumer UI[cite: 1]. It supports both Light and Dark themes:
- **Light Theme:** Built upon warm bone/cream surfaces (`#FBF9F5`) and coordinate-grid tech canvases (`#F9F9F8`), paired with high-contrast jet-black typography, crisp hairline borders, and vivid canary-yellow and cobalt-blue accents[cite: 1].
- **Dark Theme:** Deep obsidian canvas (`#0D0F12`) with elevated charcoal cards (`#16191E`), subtle white hairline borders, and glowing neon accents[cite: 1].

## Color Palette Discipline & Minimalist Palette

Stick strictly to a restrained, disciplined color palette. Rather than using an overwhelming array of arbitrary accent colors or rainbow tints:
- Rely on core brand tokens (`brand-yellow`, `brand-blue`, neutral monochromatic tones).
- Use semantic state indicators sparingly (emerald for active/returned success, rose for overdue/deletion errors, amber for holds/ratings).
- Create visual hierarchy using font weights, crisp hairline borders, and subtle background opacity (`bg-accent`, `bg-muted/50`).

## Colors

All UI components must use these CSS custom property tokens—hardcoded arbitrary hex values are prohibited in component code[cite: 1, 3].

| Role | CSS Variable | Value |
| :--- | :--- | :--- |
| Canvas Background (Warm) | `--bg-canvas-warm` | `#FBF9F5`[cite: 1] |
| Canvas Background (Tech Grid) | `--bg-canvas-tech` | `#F9F9F8`[cite: 1] |
| Dark Mode Root Canvas | `--bg-canvas-dark` | `#0D0F12`[cite: 1] |
| Card Surface (Light) | `--bg-surface-card` | `#FFFFFF`[cite: 1] |
| Card Surface (Dark) | `--bg-surface-dark` | `#16191E`[cite: 1] |
| Primary Text (Light) | `--text-primary` | `#111111`[cite: 1] |
| Primary Text (Dark) | `--text-primary-dark` | `#FFFFFF`[cite: 1] |
| Muted Text | `--text-muted` | `#6B7280`[cite: 1] |
| Primary Accent / Highlight | `--accent-yellow` | `#FFE500`[cite: 1] |
| Action CTA / Listen Button | `--accent-blue` | `#1D61FF`[cite: 1] |
| Hairline Border (Light) | `--border-default` | `#E5E7EB`[cite: 1] |
| Hairline Border (Dark) | `--border-dark` | `#262B34`[cite: 1] |
| Streak / Flame Indicator | `--gamify-streak` | `#FF7A00`[cite: 1] |
| Success / Mission Complete | `--state-success` | `#10B981`[cite: 1] |
| Category Badge / Tag Accent | `--gamify-purple` | `#8B5CF6`[cite: 1] |

## Typography

| Role | Font Family | Variable |
| :--- | :--- | :--- |
| Display & Headings | `Cabinet Grotesk`, `Plus Jakarta Sans` | `--font-display`[cite: 1] |
| Body & UI Text | `Inter`, `SF Pro Text`, `system-ui` | `--font-sans`[cite: 1] |
| Telemetry, Code & Metrics | `JetBrains Mono`, `Fira Code` | `--font-mono`[cite: 1] |

## Border Radius

| Context | Class | Pixels |
| :--- | :--- | :--- |
| Badges, Status Pills & Action Annotations | `rounded-full` | `9999px`[cite: 1] |
| Feature Cards, Panels & Metric Widgets | `rounded-2xl` | `18px`[cite: 1] |
| Action Modals, Bottom Sheets & Dialogs | `rounded-3xl` | `24px`[cite: 1] |
| Code Snippets, Telemetry & Tech Controls | `rounded-xl` | `12px`[cite: 1] |
| Tooltips, Inline Badges & Small UI Tags | `rounded-lg` | `8px`[cite: 1] |

## Component Library

- **Primitives:** Built on `shadcn/ui` primitives and Radix UI headless components styled with Tailwind CSS[cite: 1].
- **Directory Structure:** Primitives reside in `components/ui/` and shared layout widgets reside in `components/shared/`[cite: 3].
- **Zero-CLS Skeletons:** Dedicated `Skeleton` primitive utilizing a `1.5s` linear gradient shimmer animation (`.skeleton-shimmer`) matching target layout dimensions identically to prevent layout shift[cite: 1].

## Layout Patterns

- **Coordinate Grid Canvas:** 32px light/dark linear gradient grid background applied to landing and developer console layouts (`.bg-grid-pattern`)[cite: 1].
- **Hero Keyword Annotations:** High-impact bold display titles with inline canary-yellow pill highlights (`px-2.5 py-0.5 rounded-full bg-[#FFE500] text-black`)[cite: 1].
- **Bento Grid Architecture:** Multi-column asymmetric container system for feature showcases, customer testimonials, and SDK integration flows[cite: 1].
- **Multi-Metric Streak Widget:** Segmented status widget dividing streak flame counters from weekly progress and key insights with vertical hairline dividers[cite: 1].
- **Modals & Bottom Sheets:** Centered card dialogs and slide-up mobile sheets with `backdrop-blur-md bg-black/40` backdrops and interactive completion checklist rows[cite: 1].
- **Sticky Navbar:** Top header with hairline border (`border-b border-border-default`), brand mark, active view switcher, live skeleton toggle, and dark/light theme switch[cite: 1, 3].

## Icons

- **Library:** `lucide-react` (stroke-based vector icons)[cite: 3].
- **Sizing Scale:**
  - `h-4 w-4`: Inline metadata tags, reading times, and small pill badges[cite: 1].
  - `h-5 w-5`: Standard button icons, search input indicators, and navigation links[cite: 1].
  - `h-8 w-8` to `h-10 w-10`: Gamified mission badges and category card icon containers with custom colored background fills[cite: 1].