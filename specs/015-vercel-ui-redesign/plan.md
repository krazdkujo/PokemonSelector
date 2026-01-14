# Implementation Plan: Vercel-Inspired UI Redesign

**Branch**: `015-vercel-ui-redesign` | **Date**: 2026-01-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-vercel-ui-redesign/spec.md`

## Summary

Transform the Pokemon Starter Selector application's visual design from a conventional friendly aesthetic to a modern, technical, developer-focused appearance inspired by Vercel's Geist design system. This involves implementing a dark-first color scheme, adding Geist typography, creating a consistent design token system, and updating all pages and components to use the new visual language while maintaining full functionality.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) with Next.js 14.2
**Primary Dependencies**: Tailwind CSS 3.4.1, Next.js App Router, React 18, next/font (built-in)
**Storage**: N/A - No database changes (visual redesign only)
**Testing**: Manual visual testing, accessibility audit tools
**Target Platform**: Web (Desktop and Mobile browsers)
**Project Type**: Web application (Next.js)
**Performance Goals**: CLS < 0.1, interaction response < 100ms, font loading < 500ms
**Constraints**: WCAG AA color contrast, prefers-reduced-motion support
**Scale/Scope**: 10 pages, 26 components to update

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Evaluation | Status |
|-----------|------------|--------|
| I. Unique Ownership Constraint | No impact - visual changes only | PASS |
| II. Authentication-First | No impact - no auth changes | PASS |
| III. Serverless Architecture | No impact - CSS/client only | PASS |
| IV. Single Source of Truth | No impact - no data changes | PASS |
| V. API Simplicity | No impact - no API changes | PASS |

**Result**: All gates pass. This feature is purely presentational and fully compliant with the constitution.

## Project Structure

### Documentation (this feature)

```text
specs/015-vercel-ui-redesign/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Technology decisions and rationale
├── data-model.md        # Design token definitions
├── quickstart.md        # Implementation guide
├── contracts/           # N/A for visual features
│   └── README.md        # Explains why no API contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Task breakdown (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── globals.css          # Design tokens, component classes (MODIFY)
│   ├── layout.tsx           # Root layout with fonts (MODIFY)
│   ├── page.tsx             # Home/login page (MODIFY)
│   ├── admin/page.tsx       # Admin dashboard (MODIFY)
│   ├── battle/page.tsx      # Battle interface (MODIFY)
│   ├── dashboard/page.tsx   # User dashboard (MODIFY)
│   ├── pin/                  # PIN pages (MODIFY)
│   ├── pokecenter/page.tsx  # Pokemon center (MODIFY)
│   ├── pokedex/page.tsx     # Pokedex browser (MODIFY)
│   └── select/page.tsx      # Starter selection (MODIFY)
├── components/
│   ├── BattleArena.tsx      # Battle UI (MODIFY)
│   ├── PokemonCard.tsx      # Card component (MODIFY)
│   ├── ThemeToggle.tsx      # Theme switcher (MODIFY)
│   └── [20+ other components] # (MODIFY)
└── lib/
    └── theme.ts             # Theme utilities (MODIFY if needed)

tailwind.config.ts           # Tailwind configuration (MODIFY)
```

**Structure Decision**: This is an existing Next.js web application. All changes modify existing files - no new directories needed. The feature extends the Tailwind configuration and updates styling across all pages and components.

## Implementation Phases

### Phase 1: Design System Foundation

**Goal**: Establish the core design tokens and typography

| Task | Files | Estimated Effort |
|------|-------|------------------|
| Add Geist fonts via next/font | `layout.tsx` | Small |
| Define CSS custom properties | `globals.css` | Medium |
| Extend Tailwind config with tokens | `tailwind.config.ts` | Medium |
| Create base component classes | `globals.css` | Medium |
| Update body/root styling | `layout.tsx` | Small |

### Phase 2: Core Components

**Goal**: Update shared components used across multiple pages

| Component | Priority | Key Changes |
|-----------|----------|-------------|
| `ThemeToggle.tsx` | High | Update toggle styling to match aesthetic |
| `PokemonCard.tsx` | High | Card styling, type badges, hover effects |
| `NameEntryForm.tsx` | High | Input and button styling |
| `ConfirmationModal.tsx` | High | Modal container styling |
| Button components | High | Apply btn-* classes consistently |

### Phase 3: Page Updates

**Goal**: Apply design system to all pages

| Page | Priority | Complexity |
|------|----------|------------|
| `layout.tsx` | Critical | Low |
| `page.tsx` (home) | High | Low |
| `dashboard/page.tsx` | High | Medium |
| `select/page.tsx` | High | Medium |
| `battle/page.tsx` | High | High |
| `pokecenter/page.tsx` | Medium | Medium |
| `pokedex/page.tsx` | Medium | Medium |
| `admin/page.tsx` | Low | Medium |
| `pin/*` pages | Low | Low |

### Phase 4: Polish and Testing

**Goal**: Ensure consistency and accessibility

| Task | Description |
|------|-------------|
| Visual audit | Check all pages for consistent styling |
| Accessibility testing | Verify WCAG AA compliance |
| Responsive testing | Test on mobile, tablet, desktop |
| Motion testing | Verify reduced-motion support |
| Theme testing | Verify both dark and light themes |

## Key Design Decisions

1. **Dark-first approach**: Dark theme is the default; light theme is the override via `.light` class
2. **CSS variables for tokens**: Enables runtime theme switching without Tailwind class changes
3. **Component classes via @apply**: Reduces repetition while keeping Tailwind utility model
4. **Geist fonts**: Self-hosted via Next.js font optimization for best performance
5. **Incremental updates**: Pages and components updated systematically, not all at once

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Accessibility regression | Use contrast checker tools during implementation |
| Visual inconsistency | Follow quickstart patterns, review against design tokens |
| Performance impact | Monitor CLS, use Next.js font optimization |
| Breaking existing features | Test all user flows after visual changes |

## Success Metrics

- All pages use consistent design tokens
- WCAG AA contrast compliance (4.5:1 text, 3:1 large text)
- CLS < 0.1 during theme switching
- No functional regressions
- Modern, technical aesthetic achieved

## Next Steps

Run `/speckit.tasks` to generate the detailed task breakdown for implementation.
