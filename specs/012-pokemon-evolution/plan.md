# Implementation Plan: Pokemon Evolution System

**Branch**: `012-pokemon-evolution` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-pokemon-evolution/spec.md`

## Summary

Implement a Pokemon evolution system that allows trainers to evolve their Pokemon when they reach specific level thresholds. Evolution can be triggered immediately after battle (when leveling up to threshold) or at any time from the Pokecenter once eligible. The evolution transforms the Pokemon's species while preserving level, experience, and selected moves.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) with Next.js 14.2
**Primary Dependencies**: `@supabase/supabase-js` 2.89, `@supabase/ssr` 0.8, React 18
**Storage**: Supabase Postgres (`pokemon_owned` table, new `can_evolve` column)
**Testing**: Manual testing via UI and API
**Target Platform**: Vercel serverless deployment
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Evolution completes in under 10 seconds
**Constraints**: No breaking changes to existing API contracts
**Scale/Scope**: Existing user base, ~151 Pokemon species

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance | Notes |
|-----------|------------|-------|
| I. Unique Ownership Constraint | PASS | Evolution changes species, not ownership. Pokemon record ID preserved. |
| II. Authentication-First | PASS | All evolution endpoints require authentication |
| III. Serverless Architecture | PASS | All endpoints are Next.js API routes |
| IV. Single Source of Truth | PASS | Pokemon data from JSON, ownership in Supabase |
| V. API Simplicity | PASS | New endpoints follow existing patterns |

**Gate Status**: PASS - No constitution violations

## Project Structure

### Documentation (this feature)

```text
specs/012-pokemon-evolution/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── evolution-api.md
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   └── pokecenter/
│   │       └── evolve/
│   │           └── route.ts     # NEW: Evolution endpoint
│   ├── pokecenter/
│   │   └── page.tsx             # MODIFY: Add Evolve button
│   └── battle/
│       └── page.tsx             # MODIFY: Add evolution prompt after battle
├── lib/
│   ├── evolution.ts             # NEW: Evolution logic
│   └── pokemon.ts               # MODIFY: Add evolution helpers
└── components/
    └── EvolutionModal.tsx       # NEW: Evolution prompt UI
```

**Structure Decision**: Extend existing Next.js App Router structure. Add new evolution library and API endpoint following established patterns.

## Complexity Tracking

No constitution violations requiring justification. This feature follows established patterns.
