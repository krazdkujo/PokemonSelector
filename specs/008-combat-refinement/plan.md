# Implementation Plan: Combat System Refinement

**Branch**: `008-combat-refinement` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-combat-refinement/spec.md`

## Summary

Refine the battle system with four improvements: (1) Show DC before revealing roll results for tension and clarity, (2) Display post-battle XP summary with previous/new totals, (3) Show celebratory level-up notification when Pokemon gain levels, (4) Disable capture for already-owned Pokemon species to encourage collection diversity.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 14.2, React 18, @supabase/supabase-js, @supabase/ssr, seedrandom
**Storage**: Supabase Postgres (existing `battles`, `pokemon_owned`, `battle_rounds` tables)
**Testing**: Manual testing via dev server (no automated test framework currently configured)
**Target Platform**: Web (Vercel deployment)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Post-battle screen displays XP within 1 second of battle conclusion
**Constraints**: Serverless-first (Next.js API routes), no long-running processes
**Scale/Scope**: Single-user focused, existing trainer session system

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Unique Ownership Constraint | PASS | Capture restriction enforces species uniqueness in collection |
| II. Authentication-First | PASS | All battle endpoints already require trainer authentication |
| III. Serverless Architecture | PASS | All changes use Next.js API routes and React components |
| IV. Single Source of Truth | PASS | Pokemon data from local JSON, ownership from Supabase |
| V. API Simplicity | PASS | Extends existing battle API, no new public endpoints |

**Gate Status**: PASS - All principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/008-combat-refinement/
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
│   │   ├── battle/
│   │   │   ├── route.ts           # Start battle (add ownership check)
│   │   │   └── round/route.ts     # Execute round (DC already calculated)
│   │   └── capture/route.ts       # Capture attempt (add ownership check)
│   └── battle/page.tsx            # Battle UI (add DC preview, post-battle screen)
├── components/
│   ├── BattleArena.tsx            # Round display (show DC before roll)
│   ├── PostBattleScreen.tsx       # NEW: XP and level-up display
│   └── CaptureAttempt.tsx         # Capture UI (disable for owned species)
└── lib/
    ├── battle.ts                  # Battle logic (no changes needed)
    ├── experience.ts              # XP calculations (existing)
    └── types.ts                   # Type definitions (extend as needed)
```

**Structure Decision**: Web application structure using Next.js App Router with collocated API routes. Feature extends existing battle flow with UI enhancements and API-level validation.

## Complexity Tracking

> No violations - all changes follow existing patterns

| Aspect | Complexity | Justification |
|--------|------------|---------------|
| UI Components | Low | One new component (PostBattleScreen), minor updates to existing |
| API Changes | Low | Add ownership check to capture, extend round response |
| Data Model | None | No schema changes required |
