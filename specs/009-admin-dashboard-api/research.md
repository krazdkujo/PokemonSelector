# Research: Admin Dashboard and External API Documentation

**Branch**: `009-admin-dashboard-api` | **Date**: 2026-01-11

## Overview

This research consolidates findings on the existing codebase patterns, API structure, and best practices for implementing the admin dashboard enhancements and comprehensive API documentation.

---

## Decision 1: Role Assignment API Design

**Decision**: Use a PATCH endpoint at `/api/trainers/[id]/role` for role assignment.

**Rationale**:
- Follows RESTful conventions (PATCH for partial updates to a resource)
- Mirrors existing patterns like `/api/trainer/[id]` and `/api/pokecenter/swap`
- Provides clear URL structure indicating the specific resource being modified
- Enables easy expansion for other role-related operations in the future

**Alternatives Considered**:
- PUT `/api/trainers/[id]` with full body: Rejected because it would overwrite all trainer fields
- POST `/api/admin/promote`: Rejected because it doesn't follow RESTful resource patterns
- Query parameter on existing endpoint: Rejected because it's less discoverable and harder to document

---

## Decision 2: Statistics Data Aggregation

**Decision**: Aggregate trainer statistics in the `/api/trainers` endpoint by joining with `user_stats` and `pokemon_owned` tables.

**Rationale**:
- User statistics are already tracked in the `user_stats` table (battles_won, battles_lost, pokemon_captured)
- Pokemon collection count can be derived from `pokemon_owned` table
- Single API call provides all data needed for admin dashboard
- Follows existing pattern in `/api/dashboard` which already aggregates similar data

**Alternatives Considered**:
- Separate `/api/trainers/[id]/stats` endpoint: Rejected because it would require N+1 API calls for the dashboard
- Client-side aggregation: Rejected because it exposes internal data structures unnecessarily
- Materialized view: Rejected as over-engineering for modest user base

---

## Decision 3: Last Admin Protection

**Decision**: Implement server-side check that counts admins before allowing role demotion.

**Rationale**:
- Prevents accidentally locking out all admin access
- Simple count query before role change is reliable and performant
- Already have admin role check pattern in `/api/trainers/route.ts`

**Alternatives Considered**:
- Database trigger: Rejected because it couples business logic to DB layer
- Client-side warning only: Rejected because it's not enforceable

---

## Decision 4: API Documentation Format

**Decision**: Use OpenAPI 3.0 specification with accompanying markdown documentation.

**Rationale**:
- OpenAPI is industry standard for REST API documentation
- Can generate interactive documentation (Swagger UI) if needed later
- Machine-readable for potential SDK generation
- Existing `docs/API.md` provides template for markdown style
- Dual format serves both developers who prefer reading docs and tools that consume OpenAPI

**Alternatives Considered**:
- Markdown only: Rejected because OpenAPI provides more structure and tooling benefits
- OpenAPI only: Rejected because markdown is more accessible for beginners/students
- AsyncAPI: Not applicable (no async/webhook endpoints)

---

## Decision 5: External API Endpoint Strategy

**Decision**: Document all endpoints that support API key authentication (X-API-Key header).

**Rationale**:
- Existing middleware (`src/middleware.ts`) already validates API keys for all `/api/*` routes
- Routes that accept `X-User-ID` header from middleware are API-accessible
- Consistency with existing `/api/external/trainer` documentation in `docs/API.md`

**External-Accessible Endpoints Identified**:
1. `GET /api/external/trainer` - Already documented
2. `GET /api/dashboard` - Returns aggregated dashboard data
3. `GET /api/battle` - Get current battle state
4. `POST /api/battle` - Start a new battle
5. `POST /api/battle/round` - Execute a battle round
6. `GET /api/capture` - Get capture eligibility/DC
7. `POST /api/capture` - Attempt capture
8. `GET /api/moves` - Get available/selected moves
9. `PUT /api/moves` - Update selected moves
10. `GET /api/pokecenter` - Get Pokemon collection
11. `POST /api/pokecenter/swap` - Swap active Pokemon
12. `GET /api/pokedex` - Get Pokedex with seen/caught status
13. `GET /api/zones` - List all combat zones (public)
14. `GET /api/zones/[zoneId]/preview` - Get zone preview

---

## Decision 6: Admin Dashboard Data Enhancement

**Decision**: Extend `TrainerWithStarter` type to include statistics for admin display.

**Rationale**:
- Existing type already includes basic trainer info and starter Pokemon
- Adding stats object maintains type safety
- Follows pattern used in `Dashboard` type

**New Type Structure**:
```typescript
interface TrainerWithStats extends TrainerWithStarter {
  stats: {
    battles_won: number;
    battles_lost: number;
    pokemon_captured: number;
    pokemon_count: number;
  } | null;
}
```

---

## Existing API Patterns Summary

### Authentication Patterns

1. **Session-based (Web UI)**: Uses `trainer_id` cookie
2. **API Key-based (External)**: Uses `X-API-Key` header, middleware injects `X-User-ID`
3. **Dual Support**: Most endpoints accept both via `request.headers.get('X-User-ID') || request.cookies.get('trainer_id')?.value`

### Error Response Pattern

All endpoints use consistent `ApiError` type:
```typescript
interface ApiError {
  error: string;   // Machine-readable error code
  message: string; // Human-readable message
}
```

Common error codes: `UNAUTHORIZED`, `NOT_FOUND`, `VALIDATION_ERROR`, `DATABASE_ERROR`, `INTERNAL_ERROR`

### Admin Authorization Pattern

From `/api/trainers/route.ts`:
1. Get requester ID from query params
2. Fetch requester's role from database
3. Return 403 if role !== 'admin'

---

## Database Schema (Relevant Tables)

### trainers
- `id` (uuid, PK)
- `name` (text)
- `role` ('trainer' | 'admin')
- `starter_pokemon_id` (integer, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### user_stats
- `id` (uuid, PK)
- `user_id` (uuid, FK to trainers)
- `money` (integer)
- `items` (jsonb)
- `battles_won` (integer)
- `battles_lost` (integer)
- `pokemon_captured` (integer)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### pokemon_owned
- `id` (uuid, PK)
- `user_id` (uuid, FK to trainers)
- `pokemon_id` (integer)
- `level` (integer)
- `experience` (integer)
- `selected_moves` (text[])
- `is_active` (boolean)
- `is_starter` (boolean)
- `captured_at` (timestamp)

---

## Unresolved Items

**None** - All technical decisions have been made based on existing codebase patterns and project constitution.
