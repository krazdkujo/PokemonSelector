# Implementation Plan: Pokecenter API Sorting and Documentation Update

**Branch**: `011-pokecenter-api-sorting` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-pokecenter-api-sorting/spec.md`

## Summary

Update the Pokecenter API to return Pokemon ordered by capture date descending (most recent first) and update all API documentation to use the production Vercel URL (`https://pokemon-selector-rctq.vercel.app/`).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) with Next.js 14.2
**Primary Dependencies**: `@supabase/supabase-js` 2.89, `@supabase/ssr` 0.8, Next.js App Router
**Storage**: Supabase Postgres (`pokemon_owned` table with `captured_at` column)
**Testing**: Manual API testing via curl/Postman
**Target Platform**: Vercel serverless deployment
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: No change - existing API performance maintained
**Constraints**: No breaking changes to API response structure
**Scale/Scope**: Single API endpoint change + documentation updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance | Notes |
|-----------|------------|-------|
| I. Unique Ownership Constraint | N/A | No ownership changes |
| II. Authentication-First | PASS | Existing auth preserved |
| III. Serverless Architecture | PASS | Next.js API route pattern maintained |
| IV. Single Source of Truth | PASS | Supabase query unchanged except sort order |
| V. API Simplicity | PASS | Response structure unchanged |

**Gate Status**: PASS - No constitution violations

## Project Structure

### Documentation (this feature)

```text
specs/011-pokecenter-api-sorting/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal - no schema changes)
├── quickstart.md        # Phase 1 output
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
src/
├── app/
│   └── api/
│       └── pokecenter/
│           └── route.ts     # MODIFY: Change sort order
docs/
└── API.md                   # MODIFY: Update URLs
public/
└── docs/
    └── API.md               # MODIFY: Update URLs (if different from docs/)
```

**Structure Decision**: Minimal changes - one API file modification and documentation updates only.

## Complexity Tracking

No constitution violations requiring justification. This is a straightforward change with minimal complexity.
