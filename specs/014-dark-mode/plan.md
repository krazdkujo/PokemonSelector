# Implementation Plan: Dark Mode Toggle

**Branch**: `014-dark-mode` | **Date**: 2026-01-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-dark-mode/spec.md`

## Summary

Add a dark mode toggle to the Pokemon Selector website allowing users to switch between light and dark themes. The feature includes a visible toggle button on all pages, theme preference persistence via localStorage, and automatic OS preference detection for first-time visitors. Implementation uses Tailwind CSS dark mode with CSS custom properties for theming.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) with Next.js 14.2
**Primary Dependencies**: React 18, Tailwind CSS 3.4.1, @supabase/supabase-js 2.89, @supabase/ssr 0.8
**Storage**: Browser localStorage for theme preference persistence (no database changes)
**Testing**: Manual testing, visual regression verification
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Theme switch < 100ms, no flash of unstyled content on page load
**Constraints**: WCAG AA compliance (4.5:1 contrast ratio), works with JavaScript disabled (default light)
**Scale/Scope**: All 10+ pages in the application, 20+ components affected

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Unique Ownership Constraint | N/A | Dark mode is purely client-side, no database changes |
| II. Authentication-First | PASS | Theme toggle is available to all users (no auth required for read-only preference) |
| III. Serverless Architecture | PASS | Uses client-side state (localStorage), no server-side sessions needed |
| IV. Single Source of Truth | PASS | Theme preference stored in browser, Pokemon data unchanged |
| V. API Simplicity | PASS | No API changes required |

**Gate Result**: PASS - No constitution violations. Feature is purely client-side UI enhancement.

## Project Structure

### Documentation (this feature)

```text
specs/014-dark-mode/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (empty - no API contracts needed)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx           # Root layout - add ThemeProvider wrapper
│   ├── globals.css          # Add dark mode CSS variables and utility classes
│   ├── page.tsx             # Home page
│   ├── dashboard/page.tsx   # Dashboard page
│   ├── select/page.tsx      # Pokemon selection page
│   ├── battle/page.tsx      # Battle page
│   ├── pokecenter/page.tsx  # Pokecenter page
│   ├── pokedex/page.tsx     # Pokedex page
│   ├── admin/page.tsx       # Admin page
│   └── api-docs/page.tsx    # API docs page
├── components/
│   ├── ThemeToggle.tsx      # NEW: Theme toggle button component
│   ├── ThemeProvider.tsx    # NEW: React context for theme state
│   ├── PokemonCard.tsx      # Update: dark mode styles
│   ├── TrainerInfo.tsx      # Update: dark mode styles
│   └── [other components]   # Update: dark mode styles as needed
└── lib/
    └── theme.ts             # NEW: Theme utilities (localStorage, system detection)

tailwind.config.ts           # Update: Enable dark mode class strategy
```

**Structure Decision**: Single Next.js web application structure. New files are theme-related utilities and components. Most changes are CSS updates to existing components using Tailwind's `dark:` variant.

## Complexity Tracking

> No constitution violations - this section is not required.
