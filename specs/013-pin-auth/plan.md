# Implementation Plan: PIN Authentication Layer

**Branch**: `013-pin-auth` | **Date**: 2026-01-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-pin-auth/spec.md`

## Summary

Add a lightweight 4-digit PIN authentication layer that gates access to the main application after primary authentication. New users must create a PIN during account creation; existing users without PINs are prompted on login. PINs are hashed with bcryptjs and stored in Supabase. The PIN layer is UI-only and does not affect API authentication. Admins can reset PINs, unlock accounts, and set temporary PINs via the admin portal.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 14.2, React 18, @supabase/supabase-js 2.89, @supabase/ssr 0.8, bcryptjs
**Storage**: Supabase PostgreSQL (existing `trainers` table extended with PIN fields)
**Testing**: Manual testing via development server (existing project pattern)
**Target Platform**: Vercel (serverless deployment)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: PIN verification adds <2 seconds to login experience
**Constraints**: PIN is UI-only gating; API authentication unchanged; 5 attempts before 15-minute lockout
**Scale/Scope**: Existing user base, single admin portal

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Unique Ownership Constraint | N/A | PIN feature does not affect Pokemon ownership |
| II. Authentication-First | COMPLIANT | PIN adds secondary auth layer after Supabase Auth; all state-modifying operations still require primary auth |
| III. Serverless Architecture | COMPLIANT | PIN validation via Next.js API routes; no long-running processes; state in Supabase |
| IV. Single Source of Truth | COMPLIANT | PIN data stored in Supabase `trainers` table extension; session state managed via existing patterns |
| V. API Simplicity | COMPLIANT | PIN does NOT affect external API endpoints; existing `X-API-Key` authentication preserved |

**Gate Result**: PASS - All principles compliant or N/A.

## Project Structure

### Documentation (this feature)

```text
specs/013-pin-auth/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── pin-api.yaml     # OpenAPI spec for PIN endpoints
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   └── pin/                 # NEW: PIN-related API routes
│   │       ├── create/route.ts  # POST - Create/set PIN
│   │       ├── verify/route.ts  # POST - Verify PIN
│   │       ├── reset/route.ts   # POST - Self-service reset
│   │       └── admin/           # Admin PIN management
│   │           ├── reset/route.ts      # POST - Admin reset PIN
│   │           ├── unlock/route.ts     # POST - Admin unlock account
│   │           └── set-temp/route.ts   # POST - Admin set temporary PIN
│   ├── pin/                     # NEW: PIN UI pages
│   │   ├── create/page.tsx      # PIN creation form
│   │   └── verify/page.tsx      # PIN entry form
│   └── admin/
│       └── page.tsx             # MODIFY: Add PIN management section
├── components/
│   ├── PinInput.tsx             # NEW: 4-digit PIN input component
│   ├── PinCreateForm.tsx        # NEW: PIN creation with confirmation
│   └── AdminPinManager.tsx      # NEW: Admin PIN controls
├── lib/
│   ├── pin.ts                   # NEW: PIN hashing/verification utils
│   └── session.ts               # MODIFY: Add PIN verification state
└── middleware.ts                # MODIFY: Add PIN check redirect logic

sql/
└── 011_add_pin_fields.sql       # NEW: Migration for PIN columns
```

**Structure Decision**: Extends existing Next.js App Router structure. PIN-specific code organized under `/api/pin/` and `/pin/` routes. Follows existing patterns for API routes and components.

## Complexity Tracking

> No constitution violations requiring justification.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| PIN storage | Extend `trainers` table | Simpler than new table; PIN is 1:1 with user |
| Hashing | bcryptjs (existing) | Already used for API key hashing; proven pattern |
| Session state | localStorage + cookie | Matches existing session management pattern |

## Post-Design Constitution Re-Check

*Verified after Phase 1 design completion.*

| Principle | Status | Post-Design Notes |
|-----------|--------|-------------------|
| I. Unique Ownership Constraint | N/A | No changes to Pokemon ownership logic |
| II. Authentication-First | COMPLIANT | PIN extends auth; trainer_id cookie still required for all API routes |
| III. Serverless Architecture | COMPLIANT | All PIN routes are stateless Next.js API routes; no new server processes |
| IV. Single Source of Truth | COMPLIANT | PIN data in Supabase `trainers` table; new `pin_admin_log` table for audit |
| V. API Simplicity | COMPLIANT | External API unchanged; PIN is UI-layer only |

**Post-Design Gate Result**: PASS - Design complies with all constitution principles.

## Generated Artifacts

| Artifact | Path | Description |
|----------|------|-------------|
| Research | `specs/013-pin-auth/research.md` | Technical decisions and rationale |
| Data Model | `specs/013-pin-auth/data-model.md` | Entity definitions and migrations |
| API Contract | `specs/013-pin-auth/contracts/pin-api.yaml` | OpenAPI 3.0 specification |
| Quickstart | `specs/013-pin-auth/quickstart.md` | Setup and testing guide |

## Next Steps

Run `/speckit.tasks` to generate the implementation task list.
