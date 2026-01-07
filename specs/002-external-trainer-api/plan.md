# Implementation Plan: External Trainer API

**Branch**: `002-external-trainer-api` | **Date**: 2026-01-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-external-trainer-api/spec.md`

## Summary

Create a single external-facing API endpoint that students can call to retrieve their trainer information using their trainer name and a shared secret key. The endpoint returns trainer ID, name, and Pokemon details. All other existing APIs remain internal. This extends the existing Next.js application with one additional API route secured by environment-variable-based secret key authentication.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Framework**: Next.js 14+ (App Router)
**Primary Dependencies**: `@supabase/supabase-js`, `@supabase/ssr` (existing)
**Storage**: Supabase Postgres (existing `trainers` table)
**Testing**: Manual API testing via curl/Postman
**Target Platform**: Web (Vercel deployment)
**Project Type**: Web application (Next.js fullstack - extending existing)
**Performance Goals**: API response <2 seconds
**Constraints**: Serverless-only, secret key shared among all students
**Scale/Scope**: Classroom-sized user base (~30-50 users), single endpoint

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Unique Ownership | ✅ PASS | Read-only endpoint, does not modify ownership |
| II. Authentication-First | ⚠️ DEVIATION | Uses shared secret key instead of Supabase Auth. See Complexity Tracking. |
| III. Serverless Architecture | ✅ PASS | Next.js API route on Vercel, no server processes |
| IV. Single Source of Truth | ✅ PASS | Queries Supabase for trainer, local JSON for Pokemon |
| V. API Simplicity | ⚠️ DEVIATION | Accepts trainer name (not username from profiles). See Complexity Tracking. |

## Project Structure

### Documentation (this feature)

```text
specs/002-external-trainer-api/
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
├── app/
│   ├── api/
│   │   ├── trainer/           # Existing internal APIs
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── starter/
│   │   │           └── route.ts
│   │   ├── trainers/          # Existing internal API
│   │   │   └── route.ts
│   │   └── external/          # NEW: External API
│   │       └── trainer/
│   │           └── route.ts   # GET with secret key auth
│   └── ...                    # Existing pages (unchanged)
├── lib/
│   ├── types.ts               # Add ExternalTrainerResponse type
│   └── ...                    # Existing utilities (unchanged)
└── ...                        # Existing structure (unchanged)

.env.local                     # Add EXTERNAL_API_SECRET_KEY
```

**Structure Decision**: Add single new API route at `/api/external/trainer`. Separates external endpoint from internal APIs for clarity. Minimal changes to existing structure.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Shared secret key (Principle II) | Students need programmatic access without individual accounts | Individual API keys would require auth system not appropriate for classroom setting |
| Trainer name lookup (Principle V) | Spec requires lookup by trainer name in header | Students know their name, not their UUID; name is more user-friendly for external callers |
