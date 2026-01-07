# Data Model: External Trainer API

**Date**: 2026-01-07
**Branch**: `002-external-trainer-api`

## Entities

### ExternalTrainerResponse (API Response Type)

Represents the data structure returned by the external API.

| Field | Type | Description |
|-------|------|-------------|
| trainer_id | string (UUID) | Unique trainer identifier |
| trainer_name | string | Trainer's display name |
| pokemon | PokemonDetails \| null | Selected starter Pokemon, null if not selected |

### PokemonDetails (Nested in Response)

| Field | Type | Description |
|-------|------|-------------|
| number | integer | Pokemon national dex number (1-151) |
| name | string | Pokemon name (e.g., "Pikachu") |
| types | string[] | Array of type names (e.g., ["Electric"]) |

## No New Database Changes

This feature is **read-only** and uses the existing `trainers` table from feature 001. No new tables or columns required.

### Existing Table Reference: `trainers`

| Field | Type | Usage in this feature |
|-------|------|----------------------|
| id | UUID | Returned as `trainer_id` |
| name | VARCHAR(20) | Used for lookup, returned as `trainer_name` |
| starter_pokemon_id | INTEGER | Used to fetch Pokemon details |

## TypeScript Types

```typescript
// Add to src/lib/types.ts

export interface ExternalTrainerResponse {
  trainer_id: string;
  trainer_name: string;
  pokemon: {
    number: number;
    name: string;
    types: string[];
  } | null;
}

// Reuse existing ApiError for error responses
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| EXTERNAL_API_SECRET_KEY | Shared secret for API authentication | `pokemon-class-2026-secret` |

Add to `.env.local`:
```
EXTERNAL_API_SECRET_KEY=your-secret-key-here
```

## Query Pattern

```sql
-- Find trainer by name (case-insensitive)
SELECT id, name, starter_pokemon_id
FROM trainers
WHERE LOWER(name) = LOWER($1)
LIMIT 1;
```

Note: Using `LOWER()` for case-insensitive matching is portable across databases.
