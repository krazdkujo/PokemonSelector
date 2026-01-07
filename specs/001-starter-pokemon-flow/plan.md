# Implementation Plan: Starter Pokemon Selection Flow

**Branch**: `001-starter-pokemon-flow` | **Date**: 2026-01-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-starter-pokemon-flow/spec.md`

## Summary

Build a 3-screen web application flow: name entry → Pokemon selection with type filtering → dashboard. Users enter a name (no auth) to create a trainer record in Supabase, select a starter Pokemon from Gen 1 data filtered by type, and view their selection on a dashboard. Data persists in Supabase and is exposed via API for external consumption. Supports Trainer and Admin roles (admin set manually in DB).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Framework**: Next.js 14+ (App Router)
**Primary Dependencies**: `@supabase/supabase-js`, `@supabase/ssr`, React 18+
**Storage**: Supabase Postgres
**Testing**: Jest + React Testing Library (unit), Playwright (e2e)
**Target Platform**: Web (Vercel deployment)
**Project Type**: Web application (Next.js fullstack)
**Performance Goals**: Pokemon filtering <500ms, page transitions <1s
**Constraints**: Serverless-only (no long-running processes), classroom use case
**Scale/Scope**: ~151 Pokemon (Gen 1), classroom-sized user base (~30-50 users)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Unique Ownership | ✅ PASS | Each user gets one starter, enforced via unique constraint on `user_id` in starters table |
| II. Authentication-First | ⚠️ VIOLATION | Spec explicitly skips auth for classroom use. See Complexity Tracking. |
| III. Serverless Architecture | ✅ PASS | Next.js App Router + Vercel, no server processes |
| IV. Single Source of Truth | ✅ PASS | Pokemon data from local JSON, user data in Supabase |
| V. API Simplicity | ⚠️ DEVIATION | Lookup by trainer ID (not username) since duplicates allowed. See Complexity Tracking. |

## Project Structure

### Documentation (this feature)

```text
specs/001-starter-pokemon-flow/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI spec)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/                     # Next.js App Router pages
│   ├── page.tsx             # Login/name entry screen
│   ├── select/
│   │   └── page.tsx         # Pokemon selection screen
│   ├── dashboard/
│   │   └── page.tsx         # Trainer dashboard
│   ├── admin/
│   │   └── page.tsx         # Admin view (all trainers)
│   ├── api/
│   │   └── trainer/
│   │       └── [id]/
│   │           └── route.ts # GET /api/trainer/:id
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── PokemonCard.tsx
│   ├── PokemonGrid.tsx
│   ├── TypeFilter.tsx
│   ├── ConfirmationModal.tsx
│   └── TrainerInfo.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser Supabase client
│   │   └── server.ts        # Server Supabase client
│   ├── pokemon.ts           # Pokemon data utilities
│   └── types.ts             # TypeScript types
└── data/
    └── pokemon.json         # Gen 1 Pokemon with types

tests/
├── unit/
├── integration/
└── e2e/

public/
└── (static assets if needed)
```

**Structure Decision**: Next.js App Router with colocated API routes. Single project structure appropriate for serverless fullstack application.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Skip Supabase Auth (Principle II) | Hidden classroom endpoint; security is explicitly not a concern per user requirements | Auth would add friction for students in a controlled classroom setting; this is a teaching tool, not production |
| API lookup by ID not username (Principle V deviation) | Duplicate trainer names are allowed; trainer ID is the unique identifier displayed on dashboard | Username lookup would fail for duplicates; ID-based lookup is more reliable and was explicitly requested |

## Data Gap Identified

**Pokemon Types Missing**: Current `pokemon/pokemon.json` lacks `types` field required for filtering. Research phase must address adding type data to Pokemon records.
