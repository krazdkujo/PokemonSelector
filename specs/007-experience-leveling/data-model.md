# Data Model: Experience and Leveling System

**Feature**: 007-experience-leveling
**Date**: 2026-01-11

## Entity Changes

### Modified: PokemonOwned

The `pokemon_owned` table receives a new `experience` field.

**Current Schema** (from `sql/004_create_pokemon_owned.sql`):
```sql
CREATE TABLE IF NOT EXISTS pokemon_owned (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  pokemon_id INTEGER NOT NULL,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 10),
  selected_moves JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT false,
  is_starter BOOLEAN DEFAULT false,
  captured_at TIMESTAMPTZ DEFAULT NOW()
);
```

**New Field**:
| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| experience | INTEGER | 0 | >= 0 | Accumulated XP toward next level |

**Migration** (`sql/010_add_experience.sql`):
```sql
-- Add experience column to pokemon_owned
ALTER TABLE pokemon_owned
ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0 CHECK (experience >= 0);
```

### TypeScript Interface Updates

**Modified: PokemonOwned** (`src/lib/types.ts`):
```typescript
export interface PokemonOwned {
  id: string;
  user_id: string;
  pokemon_id: number;
  level: number;
  experience: number;        // NEW
  selected_moves: string[];
  is_active: boolean;
  is_starter: boolean;
  captured_at: string;
}
```

**Modified: PokemonOwnedWithDetails** (`src/lib/types.ts`):
```typescript
export interface PokemonOwnedWithDetails extends PokemonOwned {
  name: string;
  types: string[];
  sr: number;
  sprite_url: string;
  experience_to_next: number;  // NEW: calculated field
}
```

## New Utility Types

**New: ExperienceInfo** (`src/lib/types.ts`):
```typescript
export interface ExperienceInfo {
  current: number;           // Current XP
  required: number;          // XP needed to level up
  isMaxLevel: boolean;       // True if level 10
}
```

**New: LevelUpResult** (`src/lib/experience.ts`):
```typescript
export interface LevelUpResult {
  newLevel: number;
  newExperience: number;
  levelsGained: number;
}
```

## State Transitions

### Experience Flow

```
[Battle Victory]
       |
       v
[Calculate XP: max(1, wildLevel - playerLevel)]
       |
       v
[Add XP to Pokemon.experience]
       |
       v
[Check: experience >= (level * 2) + 10]
       |
      / \
    Yes   No
     |     |
     v     v
[Level Up] [Done]
     |
     v
[experience -= threshold]
[level += 1]
     |
     v
[Check: level < 10 AND experience >= new_threshold]
     |
    / \
  Yes   No
   |     |
   v     v
[Repeat] [Done]
```

### Level-Up Logic

```typescript
function applyExperience(pokemon: PokemonOwned, xpGained: number): LevelUpResult {
  let level = pokemon.level;
  let experience = pokemon.experience + xpGained;
  let levelsGained = 0;

  while (level < 10) {
    const threshold = (level * 2) + 10;
    if (experience >= threshold) {
      experience -= threshold;
      level += 1;
      levelsGained += 1;
    } else {
      break;
    }
  }

  // Cap at level 10
  if (level >= 10) {
    level = 10;
    // Experience can accumulate but has no effect at max level
  }

  return { newLevel: level, newExperience: experience, levelsGained };
}
```

## Validation Rules

| Rule | Implementation | Error Code |
|------|----------------|------------|
| Experience >= 0 | Database CHECK constraint | N/A (DB enforced) |
| Level 1-10 | Existing CHECK constraint | N/A (DB enforced) |
| XP only on victory | API logic check | N/A (not exposed) |

## Relationships

```
trainers
    |
    | 1:N
    v
pokemon_owned
    - id (PK)
    - user_id (FK -> trainers)
    - pokemon_id
    - level
    - experience [NEW]
    - selected_moves
    - is_active
    - is_starter
    - captured_at
```

No new relationships introduced. The `experience` field is a simple attribute on the existing entity.
