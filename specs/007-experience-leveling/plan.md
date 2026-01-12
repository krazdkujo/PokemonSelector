# Implementation Plan: Experience and Leveling System

**Branch**: `007-experience-leveling` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-experience-leveling/spec.md`

## Summary

Implement a simple experience and leveling system where Pokemon gain XP from battle victories. Experience gained equals `max(1, wildLevel - playerLevel)`. Level-up threshold is `(currentLevel * 2) + 10`. Additionally, fix the move selector to display all available moves regardless of Pokemon level.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 14.2, React 18, @supabase/supabase-js, @supabase/ssr, seedrandom
**Storage**: Supabase Postgres (existing `pokemon_owned` and `battles` tables)
**Testing**: Manual testing via browser (no test framework currently in use)
**Target Platform**: Web application (Vercel deployment)
**Project Type**: web (Next.js App Router monolith)
**Performance Goals**: Standard web app responsiveness
**Constraints**: Level cap at 10, experience values are integers
**Scale/Scope**: Single-user Pokemon battle game

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Unique Ownership Constraint | PASS | Experience is per-owned-Pokemon; no ownership changes |
| II. Authentication-First | PASS | All XP/level changes occur via authenticated API routes |
| III. Serverless Architecture | PASS | Uses Next.js API routes; no long-running processes |
| IV. Single Source of Truth | PASS | XP stored in Supabase `pokemon_owned`; moves from local JSON |
| V. API Simplicity | PASS | No new public API endpoints required; internal changes only |

**Gate Status**: PASSED - No violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/007-experience-leveling/
+-- plan.md              # This file
+-- research.md          # Phase 0 output
+-- data-model.md        # Phase 1 output
+-- quickstart.md        # Phase 1 output
+-- contracts/           # Phase 1 output
+-- tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
+-- app/
|   +-- api/
|   |   +-- battle/
|   |   |   +-- round/route.ts  # Modify: add XP grant on victory
|   |   +-- moves/route.ts      # Modify: remove level-based filtering
|   +-- dashboard/page.tsx      # Modify: display XP progress
|   +-- pokecenter/page.tsx     # Modify: display XP progress
+-- components/
|   +-- PokemonCard.tsx         # Modify: show XP/level info
+-- lib/
|   +-- experience.ts           # NEW: XP calculation utilities
|   +-- moves.ts                # Modify: remove level filter
|   +-- types.ts                # Modify: add experience field
sql/
+-- 010_add_experience.sql      # NEW: migration for experience column
```

**Structure Decision**: Web application using existing Next.js App Router structure. Changes are additive to existing files with one new utility module and one database migration.

## Complexity Tracking

> No violations to justify - all changes align with existing patterns.
