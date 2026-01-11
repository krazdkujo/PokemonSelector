# Implementation Plan: Expand Constitution for Pokemon Battle and Capture System

**Branch**: `005-expand-constitution` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-expand-constitution/spec.md`

## Summary

Expand the Pokemon Starter Selector application into a full MIT Pokemon Automation and Gameplay Application. This involves amending the project constitution to support:
- Multi-Pokemon ownership (one active at a time, swappable at Pokecenter)
- Round-based battle system with capture mechanics
- User secret keys for API authentication (all endpoints authenticated)
- Condensed leveling system (1-10) with evolution rules
- Optional LLM-narrated combat

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**:
- Next.js 14+ (App Router)
- `@supabase/supabase-js` ^2.89.0
- `@supabase/ssr` ^0.8.0
- React 18+
- Tailwind CSS 3.4.x

**Storage**: Supabase Postgres (existing infrastructure)
**Testing**: Contract tests for API endpoints (existing pattern), integration tests for ownership logic
**Target Platform**: Vercel (serverless deployment)
**Project Type**: Web application (Next.js full-stack)
**Performance Goals**:
- API responses under 2 seconds (SC-004)
- 100 concurrent users without degradation (SC-007)
- Battle rounds deterministic and reproducible (SC-010)

**Constraints**:
- Serverless architecture (no long-running processes)
- Cold start optimization for Vercel functions
- Supabase connection pooling (handled by Supabase)

**Scale/Scope**:
- 100+ concurrent users
- Gen 1 Pokemon (151 species) with moves data
- Battle/capture mechanics per PRD specifications

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Current Constitution Principles vs. Feature Requirements

| Principle | Current State | Required Change | Impact |
|-----------|---------------|-----------------|--------|
| **I. Unique Ownership Constraint** | One Pokemon per user, one user per Pokemon (globally unique) | Allow multiple Pokemon per user, one active at a time, remove global uniqueness | MAJOR amendment |
| **II. Authentication-First** | Supabase Auth for state-modifying operations, anonymous browse allowed | All endpoints require secret key authentication | MINOR expansion |
| **III. Serverless Architecture** | Next.js App Router, Vercel deployment | No change needed | COMPLIANT |
| **IV. Single Source of Truth** | Pokemon from local JSON, user data in Supabase | Expand Supabase schema for battles, captures, items, money | MINOR expansion |
| **V. API Simplicity** | Public unauthenticated starter lookup | All endpoints authenticated with user secret keys | MAJOR amendment |

### Constitution Amendments Required

1. **Principle I Amendment (MAJOR)**:
   - Remove: "each Pokemon can be claimed by exactly one user"
   - Remove: unique constraint on `pokemon_id` in starters table
   - Add: "users may own multiple Pokemon but MUST have exactly one active Pokemon at any time"
   - Add: "Pokemon swapping is only permitted at the Pokecenter and outside of active battles"

2. **Principle II Expansion (MINOR)**:
   - Add: "All API endpoints MUST authenticate via user-specific secret keys"
   - Add: "Secret keys can be regenerated from the user dashboard"
   - Retain: Supabase Auth as identity provider

3. **Principle V Amendment (MAJOR)**:
   - Remove: "No authentication required for public lookup"
   - Add: "All endpoints require valid secret key authentication"
   - Add: Gameplay endpoints (battle, capture, pokecenter, moves)
   - Add: API documentation requirements

4. **New Principles Required**:
   - **VI. Battle System**: Round-based combat rules, victory conditions (first to 3 wins)
   - **VII. Capture System**: DC-based capture mechanics, flee chances
   - **VIII. Pokemon Progression**: Condensed leveling (1-10), evolution rules (level 3/5/6)
   - **IX. Optional Enhancements**: LLM narration is optional, does not affect mechanics

5. **Database Schema Expansion**:
   - `user_secrets` table: user_id, secret_key (hashed), created_at
   - `pokemon_owned` table: user_id, pokemon_id, level, moves (JSONB), is_active, captured_at
   - `battles` table: user_id, wild_pokemon (JSONB), player_wins, wild_wins, status, created_at
   - `user_stats` table: user_id, money, items (JSONB), battles_won, pokemon_captured

### Gate Evaluation

| Gate | Status | Notes |
|------|--------|-------|
| Constitution amendments documented | PASS | 5 amendment areas identified above |
| Amendments follow governance process | PENDING | Requires PR to constitution.md with rationale |
| No unjustified complexity | PASS | All changes are required by PRD specifications |
| Serverless architecture preserved | PASS | All new endpoints as Next.js API routes |

**GATE RESULT**: PASS - Proceed to Phase 0 with constitution amendments documented

## Project Structure

### Documentation (this feature)

```text
specs/005-expand-constitution/
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
│   ├── api/
│   │   ├── battle/
│   │   │   └── route.ts          # Battle initiation and round resolution
│   │   ├── capture/
│   │   │   └── route.ts          # Capture attempt handling
│   │   ├── pokecenter/
│   │   │   └── route.ts          # Pokemon swap and healing
│   │   ├── moves/
│   │   │   └── route.ts          # Move selection for active Pokemon
│   │   ├── trainer/              # Existing trainer endpoints
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── starter/
│   │   │           └── route.ts
│   │   ├── external/
│   │   │   └── trainer/
│   │   │       └── route.ts      # Existing external API
│   │   ├── secret-key/
│   │   │   └── route.ts          # Generate/regenerate secret keys
│   │   └── dashboard/
│   │       └── route.ts          # Dashboard data aggregation
│   ├── admin/                    # Existing admin pages
│   ├── dashboard/                # Existing dashboard (expand)
│   ├── select/                   # Existing starter selection
│   ├── battle/
│   │   └── page.tsx              # Battle UI
│   ├── pokecenter/
│   │   └── page.tsx              # Pokemon management UI
│   └── layout.tsx
├── components/
│   ├── ConfirmationModal.tsx     # Existing
│   ├── PokemonCard.tsx           # Existing
│   ├── PokemonGrid.tsx           # Existing
│   ├── BattleArena.tsx           # New: battle visualization
│   ├── CaptureAttempt.tsx        # New: capture UI
│   ├── PokemonCollection.tsx     # New: owned Pokemon display
│   ├── MoveSelector.tsx          # New: move configuration
│   └── SecretKeyManager.tsx      # New: API key management
├── lib/
│   ├── pokemon.ts                # Existing Pokemon data access
│   ├── session.ts                # Existing session management
│   ├── types.ts                  # Existing + expanded types
│   ├── battle.ts                 # New: battle logic
│   ├── capture.ts                # New: capture DC calculations
│   ├── secret-key.ts             # New: key generation/validation
│   └── supabase/
│       ├── client.ts             # Existing
│       └── server.ts             # Existing
└── middleware.ts                 # New: API key authentication

docs/
├── pokemon-cleaned.json          # Existing (includes SR, moves, evolution)
├── moves-cleaned.json            # Existing (move types and descriptions)
└── api/
    └── openapi.yaml              # New: API documentation

tests/
├── contract/
│   ├── battle.test.ts            # Battle endpoint contracts
│   ├── capture.test.ts           # Capture endpoint contracts
│   └── secret-key.test.ts        # Auth endpoint contracts
└── integration/
    ├── battle-flow.test.ts       # Full battle flow tests
    └── ownership.test.ts         # Multi-Pokemon ownership tests
```

**Structure Decision**: Web application using Next.js App Router pattern. New API routes added under `/api/` for battle, capture, pokecenter, moves, and secret-key endpoints. New page routes for `/battle` and `/pokecenter`. Existing structure preserved and extended.

## Complexity Tracking

> **No violations requiring justification** - All planned changes align with constitution principles or are documented amendments.

| Amendment | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Multi-Pokemon ownership | PRD requires capture and collection gameplay | Single Pokemon limits core gameplay loop |
| Secret key authentication | PRD requires automation support for MIT students | Session-only auth prevents programmatic access |
| New database tables | Multiple entity types (battles, owned pokemon, stats) | Single table would violate normalization |

---

## Post-Design Constitution Check

*Re-evaluation after Phase 1 design completion.*

### Design Artifacts Review

| Artifact | Status | Constitution Alignment |
|----------|--------|----------------------|
| research.md | Complete | All technical decisions align with serverless architecture |
| data-model.md | Complete | Schema follows Single Source of Truth principle |
| contracts/openapi.yaml | Complete | All endpoints require X-API-Key auth |
| quickstart.md | Complete | Implementation follows App Router pattern |

### Principle Compliance After Design

| Principle | Design Compliance | Notes |
|-----------|------------------|-------|
| **I. Ownership** (amended) | COMPLIANT | `pokemon_owned` table with `is_active` constraint enforces one-active rule |
| **II. Authentication** (expanded) | COMPLIANT | Middleware validates secret keys on all API routes |
| **III. Serverless** | COMPLIANT | All endpoints as Next.js API routes, no long-running processes |
| **IV. Single Source** | COMPLIANT | Pokemon data from JSON, user state in Supabase |
| **V. API** (amended) | COMPLIANT | OpenAPI spec documents all endpoints with X-API-Key requirement |
| **VI. Battle System** (new) | COMPLIANT | Round-based system with seeded RNG for determinism |
| **VII. Capture System** (new) | COMPLIANT | DC-based mechanics with flee chance per PRD |
| **VIII. Progression** (new) | COMPLIANT | Condensed levels 1-10, evolution at 3/5/6 |
| **IX. Optional** (new) | COMPLIANT | LLM narration deferred, core mechanics work without it |

### Final Gate Evaluation

| Gate | Status | Evidence |
|------|--------|----------|
| All amendments documented | PASS | 5 amendment areas in plan.md |
| Design follows serverless pattern | PASS | No stateful servers, all API routes |
| Data model normalized | PASS | Separate tables for distinct entities |
| API contracts complete | PASS | OpenAPI spec with all endpoints |
| No unjustified complexity | PASS | All complexity tied to PRD requirements |

**FINAL GATE RESULT**: PASS - Ready for Phase 2 task generation via `/speckit.tasks`

---

## Generated Artifacts Summary

| File | Purpose |
|------|---------|
| `specs/005-expand-constitution/plan.md` | This implementation plan |
| `specs/005-expand-constitution/research.md` | Technical research and decisions |
| `specs/005-expand-constitution/data-model.md` | Database schema and migrations |
| `specs/005-expand-constitution/quickstart.md` | Implementation guide and patterns |
| `specs/005-expand-constitution/contracts/openapi.yaml` | API contract specification |
