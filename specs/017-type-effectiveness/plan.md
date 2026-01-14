# Implementation Plan: Type Effectiveness Reference

**Branch**: `017-type-effectiveness` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-type-effectiveness/spec.md`

## Summary

Add a type effectiveness reference page displaying an 18x18 grid showing all Pokemon type matchups, a single-type lookup feature with dropdown selector, and an API endpoint for programmatic type effectiveness queries. Also update API documentation and changelog.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) with Next.js 14.2
**Primary Dependencies**: `@supabase/supabase-js` 2.89, `@supabase/ssr` 0.8, React 18
**Storage**: N/A (uses existing static type-chart.ts data)
**Testing**: Manual verification, existing test infrastructure
**Target Platform**: Web (Vercel deployment)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Grid loads within 2 seconds, API responds within 500ms
**Constraints**: Read-only data, no database changes required
**Scale/Scope**: 18 types, 324 type combinations (18x18 grid)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Unique Ownership Constraint | N/A | Feature is read-only reference data, no ownership involved |
| II. Authentication-First | PASS | Types page and API are publicly readable (read-only, no state modification) |
| III. Serverless Architecture | PASS | Static data loaded client-side or via serverless API route |
| IV. Single Source of Truth | PASS | Type data loaded from local type-chart.ts (bundled with app) |
| V. API Simplicity | PASS | Simple GET endpoint with optional type parameter |

**Gate Status**: PASS - No violations. Feature aligns with constitution.

## Project Structure

### Documentation (this feature)

```text
specs/017-type-effectiveness/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── types/
│   │   └── page.tsx           # Types page with grid and selector
│   └── api/
│       └── types/
│           └── route.ts       # GET endpoint for type effectiveness
├── components/
│   ├── TypeEffectivenessGrid.tsx    # 18x18 grid component
│   ├── TypeSelector.tsx             # Dropdown for single type lookup
│   └── TypeDetailCard.tsx           # Detailed view for selected type
├── lib/
│   └── type-chart.ts          # Existing type effectiveness data
└── data/
    └── changelog.json         # Update with new entry
```

**Structure Decision**: Following existing Next.js App Router structure. Leverages existing `src/lib/type-chart.ts` for type effectiveness data.

## Complexity Tracking

> No violations - complexity tracking not required.
