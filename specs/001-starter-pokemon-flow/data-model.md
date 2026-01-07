# Data Model: Starter Pokemon Selection Flow

**Date**: 2026-01-07
**Branch**: `001-starter-pokemon-flow`

## Entities

### Trainer (Supabase Table: `trainers`)

Represents a user in the system.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, auto-generated | Unique trainer identifier (displayed on dashboard, used for API) |
| name | varchar(20) | NOT NULL, 1-20 chars | Trainer's display name (duplicates allowed) |
| role | varchar(10) | NOT NULL, DEFAULT 'trainer' | Either 'trainer' or 'admin' |
| starter_pokemon_id | integer | UNIQUE, nullable, FK to Pokemon.number | Selected starter Pokemon (null until selection) |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Record creation timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**Constraints**:
- `starter_pokemon_id` is UNIQUE - each Pokemon can only be claimed once (Constitution Principle I)
- Once `starter_pokemon_id` is set, it cannot be changed (enforced at application level)

**Indexes**:
- Primary key on `id`
- Unique index on `starter_pokemon_id` (where not null)
- Index on `role` for admin queries

---

### Pokemon (Local JSON: `src/data/pokemon.json`)

Represents a selectable Pokemon. Static data bundled with the application.

| Field | Type | Description |
|-------|------|-------------|
| number | integer | Pokemon national dex number (1-151 for Gen 1) |
| name | string | Pokemon name (e.g., "Bulbasaur") |
| types | string[] | Array of type names (e.g., ["Grass", "Poison"]) |
| sprites.main | string | URL to official artwork image |
| sprites.sprite | string | URL to pixel sprite image |

**Notes**:
- Pokemon data is read-only at runtime
- Source of truth for Pokemon details (Constitution Principle IV)
- Types used for filtering on selection screen

---

## Relationships

```
┌─────────────────┐         ┌─────────────────┐
│     Trainer     │         │     Pokemon     │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ number (PK)     │
│ name            │         │ name            │
│ role            │    1:1  │ types[]         │
│ starter_pokemon ├────────►│ sprites         │
│ created_at      │         │                 │
│ updated_at      │         │                 │
└─────────────────┘         └─────────────────┘

Relationship: One Trainer → One Pokemon (optional)
             One Pokemon → One Trainer (optional, enforced by unique constraint)
```

---

## State Transitions

### Trainer Lifecycle

```
[New User]
    │
    ▼ (enters name, submits)
┌──────────────────┐
│ REGISTERED       │ starter_pokemon_id = null
│ (no starter)     │
└────────┬─────────┘
         │ (selects and confirms Pokemon)
         ▼
┌──────────────────┐
│ COMPLETE         │ starter_pokemon_id = <pokemon_number>
│ (has starter)    │
└──────────────────┘

Note: Transition from COMPLETE back to REGISTERED is not allowed.
      Selection is final per FR-008a.
```

### Session State (localStorage)

```
┌─────────────────┐
│ NO SESSION      │ trainerId = null
└────────┬────────┘
         │ (successful registration)
         ▼
┌─────────────────┐
│ ACTIVE SESSION  │ trainerId = <uuid>
└────────┬────────┘
         │ (logout)
         ▼
┌─────────────────┐
│ NO SESSION      │ trainerId = null
└─────────────────┘
```

---

## Validation Rules

### Trainer Name (FR-002, FR-003)
- Minimum length: 1 character (after trimming whitespace)
- Maximum length: 20 characters
- Must contain at least 1 non-whitespace character
- Validation: `name.trim().length >= 1 && name.trim().length <= 20`

### Starter Selection (FR-008a)
- Can only select if `starter_pokemon_id` is currently null
- Once set, cannot be changed
- Pokemon must exist in the local Pokemon data
- Pokemon must not already be claimed by another trainer

### Role (FR-014, FR-014a)
- Valid values: 'trainer', 'admin'
- Default: 'trainer'
- Only modifiable via direct database access (no in-app role management)

---

## Supabase Schema SQL

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trainers table
CREATE TABLE trainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(20) NOT NULL CHECK (char_length(trim(name)) >= 1),
  role VARCHAR(10) NOT NULL DEFAULT 'trainer' CHECK (role IN ('trainer', 'admin')),
  starter_pokemon_id INTEGER UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for admin queries
CREATE INDEX idx_trainers_role ON trainers(role);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trainers_updated_at
  BEFORE UPDATE ON trainers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security (optional, for future auth)
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (no auth)
CREATE POLICY "Allow all operations" ON trainers
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

---

## Pokemon Data Schema (TypeScript)

```typescript
interface Pokemon {
  number: number;        // 1-151
  name: string;          // "Bulbasaur"
  types: string[];       // ["Grass", "Poison"]
  sprites: {
    main: string;        // Official artwork URL
    sprite: string;      // Pixel sprite URL
  };
}

interface Trainer {
  id: string;            // UUID
  name: string;          // 1-20 chars
  role: 'trainer' | 'admin';
  starter_pokemon_id: number | null;
  created_at: string;    // ISO timestamp
  updated_at: string;    // ISO timestamp
}

// Derived type for dashboard display
interface TrainerWithStarter extends Trainer {
  starter: Pokemon | null;
}
```
