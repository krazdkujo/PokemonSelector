# Data Model: Pokemon Nickname

**Feature**: 004-pokemon-nickname
**Date**: 2026-01-07

## Entity Changes

### Trainer (Modified)

The `trainers` table is extended with a new nullable column for storing the Pokemon nickname.

#### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique trainer identifier |
| `name` | VARCHAR(20) | NOT NULL, CHECK length >= 1 | Trainer display name |
| `role` | VARCHAR(10) | NOT NULL, DEFAULT 'trainer', CHECK IN ('trainer', 'admin') | User role |
| `starter_pokemon_id` | INTEGER | NULLABLE | Pokemon species ID (1-151) |
| `starter_pokemon_uuid` | UUID | NULLABLE | Unique instance ID for trainer's Pokemon |
| **`starter_pokemon_nickname`** | **VARCHAR(20)** | **NULLABLE, CHECK length >= 1 OR NULL** | **NEW: Custom nickname for Pokemon** |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation time |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last modification time |

#### Validation Rules

1. **Nickname Length**: When provided, must be 1-20 characters after trimming whitespace
2. **Whitespace Handling**: Leading/trailing whitespace is trimmed before storage
3. **Empty String**: Empty strings are converted to NULL
4. **Only-Whitespace**: Input that is only whitespace is rejected/converted to NULL

#### State Transitions

```
[No Pokemon] --> [Pokemon Selected, No Nickname]
                        |
                        v
              [Pokemon Selected, Has Nickname]
                        |
                        v
              [Pokemon Selected, Nickname Changed/Cleared]
```

**Important**: When `starter_pokemon_id` changes (if allowed in future), `starter_pokemon_nickname` MUST be cleared to NULL. Currently, starter selection is permanent per Constitution Principle I, but the clear-on-change behavior should be implemented defensively.

### Pokemon (Unchanged)

Static Pokemon data continues to be loaded from `src/data/pokemon.json`. No changes required.

## Migration

### SQL Migration: `sql/005_add_nickname.sql`

```sql
-- Migration: 005_add_nickname
-- Description: Add nickname column for trainer's Pokemon
-- Created: 2026-01-07

-- Add nullable nickname column with same constraints as name
ALTER TABLE trainers
ADD COLUMN IF NOT EXISTS starter_pokemon_nickname VARCHAR(20);

-- Add check constraint: if provided, must have at least 1 character after trim
ALTER TABLE trainers
ADD CONSTRAINT trainers_nickname_length
CHECK (char_length(trim(starter_pokemon_nickname)) >= 1 OR starter_pokemon_nickname IS NULL);

-- Note: updated_at will be automatically updated by existing trigger
```

### Rollback

```sql
-- Rollback: 005_add_nickname
ALTER TABLE trainers DROP CONSTRAINT IF EXISTS trainers_nickname_length;
ALTER TABLE trainers DROP COLUMN IF EXISTS starter_pokemon_nickname;
```

## Type Definitions

### TypeScript Updates (`src/lib/types.ts`)

```typescript
// Trainer types from Supabase (MODIFIED)
export interface Trainer {
  id: string;
  name: string;
  role: 'trainer' | 'admin';
  starter_pokemon_id: number | null;
  starter_pokemon_uuid: string | null;
  starter_pokemon_nickname: string | null;  // NEW
  created_at: string;
  updated_at: string;
}

// External API response type (MODIFIED)
export interface ExternalTrainerResponse {
  trainer_id: string;
  trainer_name: string;
  pokemon: {
    uuid: string;
    number: number;
    name: string;
    types: string[];
    nickname: string | null;  // NEW
  } | null;
}
```

## Relationships

```
Trainer (1) -----> (0..1) Pokemon Instance
   |                        |
   +-- starter_pokemon_id   +-- number (from static data)
   +-- starter_pokemon_uuid +-- name (from static data)
   +-- starter_pokemon_nickname (user-defined)
```

The nickname is an attribute of the trainer's relationship to their Pokemon, not an attribute of the Pokemon itself. Multiple trainers can have the same Pokemon species but different nicknames.
