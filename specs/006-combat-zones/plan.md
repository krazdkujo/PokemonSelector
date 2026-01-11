# Implementation Plan: Combat Zone Selection with Difficulty Levels

**Branch**: `006-combat-zones` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-combat-zones/spec.md`

## Summary

Add zone-based combat encounters where trainers select from eight themed zones (Jungle, Ocean, Volcano, Power Plant, Haunted Tower, Frozen Cave, Dojo, Dragon Shrine) covering all 17 Pokemon types, then choose from three difficulty levels (Easy, Medium, Hard) with specific SR and level constraints relative to their active Pokemon.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 14.2, React 18, @supabase/supabase-js, @supabase/ssr, seedrandom
**Storage**: Supabase Postgres (existing `battles` table with JSONB `wild_pokemon` field)
**Testing**: Manual testing (existing pattern)
**Target Platform**: Web (Next.js on Vercel)
**Project Type**: Web application (single project with API routes)
**Performance Goals**: Zone selection and encounter generation under 2 seconds
**Constraints**: Serverless-compatible, no long-running processes
**Scale/Scope**: Single-player web game, existing trainer base

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Unique Ownership Constraint | N/A | Feature does not modify ownership |
| II. Authentication-First | PASS | All battle APIs already require authentication via session cookie or API key |
| III. Serverless Architecture | PASS | Using Next.js API routes, no state between requests |
| IV. Single Source of Truth | PASS | Pokemon data from local JSON, battles in Supabase |
| V. API Simplicity | PASS | Extends existing `/api/battle` endpoint pattern |

**Gate Result**: PASS - No violations

## Project Structure

### Documentation (this feature)

```text
specs/006-combat-zones/
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
│   ├── api/
│   │   └── battle/
│   │       └── route.ts          # Modify: add zone parameter
│   └── battle/
│       └── page.tsx              # Modify: add zone selection UI
├── components/
│   └── ZoneSelector.tsx          # NEW: zone selection component
├── lib/
│   ├── battle.ts                 # Modify: add zone-aware generation
│   ├── zones.ts                  # NEW: zone definitions and logic
│   └── types.ts                  # Modify: add zone types
└── data/
    └── zones.json                # NEW: zone configuration data

docs/
└── pokemon-cleaned.json          # Existing: contains type data
```

**Structure Decision**: Extending existing single-project structure. New components and lib files for zone logic, modifications to existing battle system.

## Complexity Tracking

> No constitution violations requiring justification.
