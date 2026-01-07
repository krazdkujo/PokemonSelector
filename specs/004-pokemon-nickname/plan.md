# Implementation Plan: Pokemon Nickname

**Branch**: `004-pokemon-nickname` | **Date**: 2026-01-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-pokemon-nickname/spec.md`

## Summary

Add the ability for trainers to set, update, and remove a nickname for their selected starter Pokemon. The nickname is stored in the database as a new nullable column on the trainers table, displayed in the UI alongside the Pokemon's species name, and included in the external API response. The API documentation must be updated to reflect the new field.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 14.2, React 18, @supabase/supabase-js, @supabase/ssr, Tailwind CSS
**Storage**: Supabase Postgres (existing `trainers` table)
**Testing**: ESLint (no test framework configured yet)
**Target Platform**: Web application (Vercel deployment)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Standard web app expectations (<5 seconds for nickname operations per SC-001)
**Constraints**: 20 character max nickname length, must work with existing trainer session model
**Scale/Scope**: Classroom application, small user base

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Unique Ownership Constraint | PASS | Feature does not modify ownership model; nickname is an attribute of the trainer-Pokemon relationship, not a new ownership claim. |
| II. Authentication-First | PASS | Nickname operations will use existing trainer session model; only authenticated trainers can nickname their own Pokemon. |
| III. Serverless Architecture | PASS | Implementation uses existing Next.js API routes and Server Actions; no long-running processes. |
| IV. Single Source of Truth | PASS | Nickname stored in Supabase `trainers` table; Pokemon species data remains in local JSON. |
| V. API Simplicity | PASS | External API extended with single `nickname` field in existing response structure; no new endpoints required. |

**Gate Result**: PASS - All constitution principles satisfied. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/004-pokemon-nickname/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.yaml         # OpenAPI contract for nickname endpoint
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   ├── trainer/
│   │   │   └── [id]/
│   │   │       ├── route.ts         # GET trainer (add nickname to response)
│   │   │       ├── starter/
│   │   │       │   └── route.ts     # POST select starter (clear nickname on change)
│   │   │       └── nickname/
│   │   │           └── route.ts     # NEW: PUT/DELETE nickname
│   │   └── external/
│   │       └── trainer/
│   │           └── route.ts         # GET external API (add nickname to response)
│   └── page.tsx                     # Home page (may show nickname)
├── components/
│   ├── StarterDisplay.tsx           # MODIFY: Display nickname with species name
│   └── NicknameEditor.tsx           # NEW: Input component for nickname
├── lib/
│   └── types.ts                     # MODIFY: Add nickname to Trainer types
└── data/
    └── pokemon.json                 # Unchanged

sql/
└── 005_add_nickname.sql             # NEW: Migration to add nickname column

docs/
└── API.md                           # MODIFY: Document nickname field

tests/                               # Future: Add tests for nickname functionality
```

**Structure Decision**: Web application using Next.js App Router pattern with API routes. New nickname endpoint follows existing pattern at `/api/trainer/[id]/nickname`. UI components follow existing component structure.

## Constitution Check - Post-Design Re-evaluation

*Re-evaluated after Phase 1 design completion.*

| Principle | Status | Post-Design Notes |
|-----------|--------|-------------------|
| I. Unique Ownership Constraint | PASS | Design confirms nickname is stored on trainer record, not creating new ownership relationships. Migration adds single column to existing table. |
| II. Authentication-First | PASS | New `/api/trainer/[id]/nickname` endpoint uses existing trainer session validation pattern. |
| III. Serverless Architecture | PASS | New endpoint is a standard Next.js API route. No stateful processes introduced. |
| IV. Single Source of Truth | PASS | `starter_pokemon_nickname` stored in Supabase `trainers` table per data-model.md. Pokemon species data remains static. |
| V. API Simplicity | PASS | External API contract (api.yaml) adds single `nickname` field to existing response. No new external endpoints. |

**Post-Design Gate Result**: PASS - All principles remain satisfied after design phase.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Generated Artifacts

| Artifact | Path | Description |
|----------|------|-------------|
| Research | [research.md](./research.md) | Technical decisions and codebase analysis |
| Data Model | [data-model.md](./data-model.md) | Entity changes and migration SQL |
| API Contract | [contracts/api.yaml](./contracts/api.yaml) | OpenAPI 3.0 specification |
| Quickstart | [quickstart.md](./quickstart.md) | Implementation guide and testing |

## Next Steps

Run `/speckit.tasks` to generate the implementation task list.
