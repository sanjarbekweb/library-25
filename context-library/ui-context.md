# UI Context

## Theme & Foundational Design Blueprint

The design language unites B2B Technical Precision with a Tactile, Clean, and Gamified Visual Blueprint. It relies on layered neutral surfaces, extra-large squircle geometry (`rounded-3xl` / `rounded-2xl`), hairline depth, frosted glassmorphism, spring physics transitions, and soft atmospheric accent glows:
- **Light Theme:** Built upon soft light gray canvases (`#F4F4F6` / `#FBF9F5`) and tech grid canvases (`#F9F9F8`), paired with pure white card surfaces (`#FFFFFF`), inner wells (`#F1F3F5`), near-black typography (`#0F172A`), crisp hairline borders (`rgba(0,0,0,0.04)`), and vibrant canary-yellow (`#FFE500`) & cobalt-blue (`#1D61FF`) accents.
- **Dark Theme:** Deep obsidian canvas (`#0D0F12`) with elevated charcoal surfaces (`#16191E`), inner dark wells (`#1E232B`), white hairline borders (`rgba(255,255,255,0.08)`), and soft neon accent glows.

## Color Palette Discipline & Surface Hierarchy

Stick strictly to a restrained, disciplined color palette. Atmospheric glow blooms (`blur(40px)` to `blur(60px)`) are positioned behind primary icons or active state indicators:
- **Primary / Highlight Glow:** Vibrant Violet/Purple (`#7C3AED` to `#A855F7`)
- **Warm Action / Warning Glow:** Coral Orange (`#FF5733` to `#FF6B4A`)
- **Info / Success Glow:** Sky Blue (`#0284C7`) & Emerald Mint (`#10B981`)
- **Brand Tokens:** Core canary-yellow (`#FFE500`) and cobalt-blue (`#1D61FF`).

## Colors

All UI components must use these CSS custom property tokens—hardcoded arbitrary hex values are prohibited in component code.

| Role | CSS Variable | Value |
| :--- | :--- | :--- |
| Canvas Background (Soft) | `--bg-canvas-soft` | `#F4F4F6` |
| Canvas Background (Warm) | `--bg-canvas-warm` | `#FBF9F5` |
| Canvas Background (Tech Grid) | `--bg-canvas-tech` | `#F9F9F8` |
| Dark Mode Root Canvas | `--bg-canvas-dark` | `#0D0F12` |
| Card Surface (Light) | `--bg-surface-card` | `#FFFFFF` |
| Card Surface (Dark) | `--bg-surface-dark` | `#16191E` |
| Inner Well Sub-container | `--bg-surface-well` | `#F1F3F5` / `rgba(0,0,0,0.02)` |
| Primary Text (Light) | `--text-primary` | `#0F172A` |
| Primary Text (Dark) | `--text-primary-dark` | `#FFFFFF` |
| Muted Text | `--text-muted` | `#64748B` |
| Primary Accent / Highlight | `--accent-yellow` | `#FFE500` |
| Action CTA / Listen Button | `--accent-blue` | `#1D61FF` |
| Hairline Border (Light) | `--border-default` | `rgba(0,0,0,0.04)` |
| Hairline Border (Dark) | `--border-dark` | `rgba(255,255,255,0.08)` |
| Streak / Flame Indicator | `--gamify-streak` | `#FF7A00` |
| Success / Mission Complete | `--state-success` | `#10B981` |
| Category Badge / Tag Accent | `--gamify-purple` | `#8B5CF6` |

## Typography Rules

- **Font Family:** Geometric Neo-Grotesque Sans (`Plus Jakarta Sans`, `Rubik`, `Inter`).
- **Headings:** Bold (`font-bold` / `700`) with negative letter spacing (`tracking-tight` / `-0.02em` to `-0.03em`) and tight line height (`leading-tight`).
- **Body & Labels:** Medium/Regular weight (`400`–`500`), clean baseline, relaxed line height (`leading-relaxed`).

## Geometry, Spacing & Border Radius

| Context | Class | Pixels / Notes |
| :--- | :--- | :--- |
| Badges, Status Pills & Action Buttons | `rounded-full` | `9999px` standard button/pill shape |
| Nested Sub-cards, Lists & Widgets | `rounded-2xl` | `16px – 20px` squircle frame |
| Containers, Feature Cards & Modals | `rounded-3xl` | `24px – 32px` with internal padding (`p-6` to `p-10`) |
| Avatars & Icon Badges | `rounded-2xl` / `rounded-3xl` | Squircle profile frames with `ring-2 ring-white` |

## Depth, Borders, and Elevation (Soft Floating Look)

- **Hairline Borders:** `border-hairline` (`1px solid rgba(0, 0, 0, 0.04)` light / `rgba(255, 255, 255, 0.08)` dark).
- **Dispersed Ambient Shadows:** `shadow-soft-floating` (`0 1px 2px rgba(0, 0, 0, 0.02), 0 8px 24px rgba(0, 0, 0, 0.04)`).
- **Frosted Glass (Glassmorphism):** `glass-frosted` (`background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px)`).

## Motion & Interaction

- **Spring Physics:** `transition-spring` using `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Hover Elevation:** Subtle card scaling (`scale-[1.015]`) and smooth button lift (`hover:-translate-y-[1px]`).
- **Glow Reveal:** `.glow-bloom-violet`, `.glow-bloom-coral`, `.glow-bloom-sky` radial gradient blurs.

## Component Library & Layout Patterns

- **Primitives:** Built on `shadcn/ui` primitives styled with Tailwind CSS v4 design tokens in `components/ui/`.
- **Bento Grid Architecture:** Multi-column asymmetric container system. Each tile follows a two-part anatomy:
  1. **Visual Graphic Zone (Top/Center):** Abstracted diagram, chart, or interactive badge.
  2. **Content Zone (Bottom):** Bold title + 1–2 sentence muted description.
- **Sticky Frosted Navbar:** Header bar with glassmorphism (`glass-frosted border-b border-hairline`), pill view-switchers, and theme toggles.