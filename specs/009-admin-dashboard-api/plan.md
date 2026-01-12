# Implementation Plan: Admin Dashboard and External API Documentation

**Branch**: `009-admin-dashboard-api` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-admin-dashboard-api/spec.md`

## Summary

This feature enhances the existing admin dashboard to display comprehensive trainer statistics (battles won/lost, Pokemon captured, collection count) and enables admins to assign admin roles to other trainers. Additionally, it creates professional, public-release-quality API documentation covering all external endpoints with complete request/response specifications, code examples, and error references.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 14.2, React 18, @supabase/supabase-js 2.89, @supabase/ssr 0.8, bcryptjs
**Storage**: Supabase Postgres (existing tables: trainers, pokemon_owned, user_stats, user_secrets, battles)
**Testing**: ESLint with Next.js rules (no dedicated test runner configured)
**Target Platform**: Vercel serverless deployment (Next.js App Router)
**Project Type**: Web application (Next.js full-stack)
**Performance Goals**: Admin dashboard loads all trainers with stats in under 3 seconds
**Constraints**: Serverless-first architecture, no long-running processes
**Scale/Scope**: Educational platform, modest user base (classroom-sized)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Check (Phase 0)

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Unique Ownership Constraint | PASS | No changes to ownership model; admin features are read-only for Pokemon data |
| II. Authentication-First | PASS | Admin routes already require session auth; role assignment requires admin role |
| III. Serverless Architecture | PASS | All endpoints are Next.js API routes; no long-running processes |
| IV. Single Source of Truth | PASS | Pokemon data from local JSON; user/stats data from Supabase |
| V. API Simplicity | PASS | Documentation formalizes existing simple API patterns |

**Gate Status**: PASS - All constitution principles satisfied.

### Post-Design Re-Check (Phase 1)

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Unique Ownership Constraint | PASS | Design maintains read-only access to Pokemon ownership data; no mutations to ownership tables |
| II. Authentication-First | PASS | Role endpoint requires session auth + admin role check; uses existing cookie-based auth pattern |
| III. Serverless Architecture | PASS | New PATCH /api/trainers/[id]/role is stateless API route; statistics aggregation uses standard Supabase queries |
| IV. Single Source of Truth | PASS | TrainerWithStats joins Supabase tables (trainers, user_stats, pokemon_owned) with local Pokemon JSON; no data duplication |
| V. API Simplicity | PASS | Role endpoint follows REST conventions (PATCH for partial update); OpenAPI spec documents all endpoints consistently |

**Final Gate Status**: PASS - All constitution principles remain satisfied after design phase. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/009-admin-dashboard-api/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI specs)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx       # Existing - metadata
│   │   └── page.tsx         # Enhance with statistics display
│   └── api/
│       ├── trainers/
│       │   └── route.ts     # Enhance with statistics data
│       └── trainers/
│           └── [id]/
│               └── role/
│                   └── route.ts  # NEW - role assignment endpoint
├── components/
│   └── TrainerList.tsx      # Enhance with statistics columns
├── lib/
│   └── types.ts             # Add TrainerWithStats type
└── middleware.ts            # No changes needed

docs/
├── API.md                   # Enhance with complete documentation
└── openapi.yaml             # NEW - OpenAPI specification
```

**Structure Decision**: Follows existing Next.js App Router structure. New role assignment endpoint follows RESTful pattern `/api/trainers/[id]/role`. Documentation goes in existing `docs/` directory.

## Complexity Tracking

> No violations requiring justification - all constitution principles satisfied.
