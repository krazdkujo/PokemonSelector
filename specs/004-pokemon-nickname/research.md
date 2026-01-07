# Research: Pokemon Nickname Feature

**Date**: 2026-01-07
**Feature**: 004-pokemon-nickname

## Overview

This document captures research findings for implementing the Pokemon nickname feature. All technical context was resolved through codebase analysis - no external research was required.

## Research Tasks Completed

### 1. Existing Database Schema Analysis

**Decision**: Add `starter_pokemon_nickname` column to existing `trainers` table

**Rationale**:
- The nickname is an attribute of the trainer's Pokemon relationship, not a separate entity
- The `trainers` table already contains `starter_pokemon_id` and `starter_pokemon_uuid`
- Adding a nullable VARCHAR(20) column follows the same pattern as `name`
- No new tables or foreign keys needed

**Alternatives Considered**:
- Separate `pokemon_instances` table: Rejected - over-engineering for a single attribute
- Store in `starter_pokemon_uuid` metadata: Rejected - UUIDs should remain identifiers only

**Existing Schema Reference** (`sql/001_initial_schema.sql`):
```sql
CREATE TABLE trainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(20) NOT NULL CHECK (char_length(trim(name)) >= 1),
  role VARCHAR(10) NOT NULL DEFAULT 'trainer',
  starter_pokemon_id INTEGER,
  starter_pokemon_uuid UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2. Existing API Pattern Analysis

**Decision**: Create new `PUT /api/trainer/[id]/nickname` endpoint following existing patterns

**Rationale**:
- Consistent with existing `/api/trainer/[id]/starter` pattern
- Separation of concerns: nickname updates are distinct from starter selection
- PUT method appropriate for idempotent update operations
- DELETE method can clear nickname (or PUT with empty/null value)

**Alternatives Considered**:
- Extend PATCH on `/api/trainer/[id]`: Rejected - existing route doesn't support PATCH
- Add to POST `/api/trainer/[id]/starter`: Rejected - violates single responsibility; starter selection is one-time, nickname is repeatable

**Existing Endpoint Reference** (`src/app/api/trainer/[id]/starter/route.ts`):
- Uses `createClient()` from `@/lib/supabase/server`
- Returns `TrainerWithStarter` type
- Follows consistent error response pattern with `ApiError` type

### 3. External API Response Extension

**Decision**: Add `nickname` field to existing `pokemon` object in external API response

**Rationale**:
- Backward compatible - new field, no existing fields changed
- Nickname is null when not set, consistent with Pokemon being null when not selected
- Follows existing response structure

**Response Structure Update**:
```json
{
  "trainer_id": "uuid",
  "trainer_name": "Ash",
  "pokemon": {
    "uuid": "uuid",
    "number": 25,
    "name": "Pikachu",
    "types": ["Electric"],
    "nickname": "Sparky"  // NEW - nullable string
  }
}
```

### 4. UI Component Pattern Analysis

**Decision**: Modify `StarterDisplay.tsx` and create new `NicknameEditor.tsx` component

**Rationale**:
- `StarterDisplay` already shows Pokemon details - natural place to display nickname
- Separate `NicknameEditor` component for input follows existing component patterns
- Existing components use Tailwind CSS classes consistently

**Existing Component Reference** (`src/components/StarterDisplay.tsx`):
- Client component (`'use client'`)
- Receives Pokemon data as props
- Uses Tailwind for styling
- Displays name, number, types, and sprite

### 5. Type System Extension

**Decision**: Add `starter_pokemon_nickname` to `Trainer` interface and `nickname` to `ExternalTrainerResponse.pokemon`

**Rationale**:
- TypeScript strict mode requires explicit type definitions
- Follows existing naming conventions in `src/lib/types.ts`
- Nullable types (`string | null`) match database schema

**Type Updates Required**:
```typescript
interface Trainer {
  // existing fields...
  starter_pokemon_nickname: string | null;  // NEW
}

interface ExternalTrainerResponse {
  // existing fields...
  pokemon: {
    // existing fields...
    nickname: string | null;  // NEW
  } | null;
}
```

### 6. Validation Requirements

**Decision**: Validate nicknames at API level with 1-20 character limit, whitespace trimming

**Rationale**:
- Matches existing `name` field validation pattern
- Database constraint prevents invalid data at storage level
- API validation provides user-friendly error messages

**Validation Rules**:
1. Trim leading/trailing whitespace
2. After trimming: must be 1-20 characters OR empty/null (to clear)
3. Only-whitespace input treated as clearing the nickname
4. Database CHECK constraint enforces: `char_length(trim(starter_pokemon_nickname)) >= 1 OR starter_pokemon_nickname IS NULL`

## Dependencies

No new dependencies required. Feature uses:
- `@supabase/supabase-js` (existing)
- `@supabase/ssr` (existing)
- Next.js API Routes (existing)
- React 18 (existing)
- Tailwind CSS (existing)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Database migration failure | Low | Medium | Test migration on dev database first; migration is additive (new nullable column) |
| External API breaking change | Low | Low | Field is additive; existing consumers unaffected |
| UI regression in StarterDisplay | Low | Low | Changes are additive; existing display logic unchanged |

## Conclusion

All technical decisions have been made based on existing codebase patterns. No external research or clarifications needed. Ready to proceed to Phase 1: Design & Contracts.
