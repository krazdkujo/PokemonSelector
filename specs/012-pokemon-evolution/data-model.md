# Data Model: Pokemon Evolution System

**Date**: 2026-01-11
**Feature**: 012-pokemon-evolution

## Database Changes

### Modified Table: `pokemon_owned`

Add new column to track evolution eligibility:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| can_evolve | boolean | false | True when Pokemon has reached evolution threshold |

**Migration**:
```sql
ALTER TABLE pokemon_owned
ADD COLUMN can_evolve BOOLEAN DEFAULT false;

-- Update existing Pokemon that may be eligible
-- (Will be handled by application logic on next level-up check)
```

### Existing Columns (unchanged)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to trainers |
| pokemon_id | integer | Pokemon species number (mutable on evolution) |
| level | integer | Current level (1-10) |
| experience | integer | XP toward next level |
| selected_moves | text[] | Array of 4 move IDs |
| is_active | boolean | Currently active for battles |
| is_starter | boolean | Original starter Pokemon |
| captured_at | timestamp | When obtained |

## Evolution State Transitions

```
                 ┌─────────────────┐
                 │  Level Up       │
                 │  (not at threshold)
                 └────────┬────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│              Normal State                           │
│              can_evolve = false                     │
└─────────────────────────────────────────────────────┘
                          │
                          │ Level reaches threshold
                          ▼
┌─────────────────────────────────────────────────────┐
│              Evolution Ready                        │
│              can_evolve = true                      │
│                                                     │
│  Trainer can:                                       │
│  - Evolve after battle (prompt)                    │
│  - Evolve from Pokecenter                          │
│  - Continue without evolving (stays eligible)      │
└─────────────────────────────────────────────────────┘
                          │
                          │ Evolution accepted
                          ▼
┌─────────────────────────────────────────────────────┐
│              Evolved State                          │
│              pokemon_id = next evolution            │
│              can_evolve = false                     │
│              (may become true again at next threshold)
└─────────────────────────────────────────────────────┘
```

## Static Data: Evolution Thresholds

Derived from `pokemon-cleaned.json` evolution field format: "Stage X of Y"

| Evolution Chain | Current Stage | Evolves At Level |
|-----------------|---------------|------------------|
| 2-stage (X of 2) | Stage 1 | Level 5 |
| 3-stage (X of 3) | Stage 1 | Level 3 |
| 3-stage (X of 3) | Stage 2 | Level 6 |
| Any | Final Stage | Never (null) |
| 1-stage (1 of 1) | Stage 1 | Never (null) |

## Evolution Chain Mapping

Evolution chains are sequential by Pokemon number in Gen 1 data:

| Example Chain | Numbers | Stages |
|---------------|---------|--------|
| Bulbasaur line | 1 -> 2 -> 3 | Stage 1 -> 2 -> 3 of 3 |
| Pikachu line | 25 -> 26 | Stage 1 -> 2 of 2 |
| Magikarp line | 129 -> 130 | Stage 1 -> 2 of 2 |

**Next Evolution**: For Pokemon at "Stage X of Y" where X < Y, the next evolution is `pokemon_number + 1`.

## Type Definitions

### New Types

```typescript
// Evolution eligibility info
export interface EvolutionInfo {
  canEvolve: boolean;
  currentStage: number;
  totalStages: number;
  evolvesAtLevel: number | null;
  nextEvolutionId: number | null;
  nextEvolutionName: string | null;
}

// Evolution result from API
export interface EvolutionResult {
  success: boolean;
  pokemon: PokemonOwnedWithDetails;
  evolvedFrom: {
    pokemon_id: number;
    name: string;
  };
  evolvedTo: {
    pokemon_id: number;
    name: string;
  };
}

// Extended experience gained with evolution flag
export interface ExperienceGainedWithEvolution extends ExperienceGained {
  evolution_available: boolean;
  evolution_details?: {
    from_name: string;
    from_id: number;
    to_name: string;
    to_id: number;
  };
}
```

### Modified Types

```typescript
// Extend PokemonOwnedWithDetails to include evolution info
export interface PokemonOwnedWithDetails extends PokemonOwned {
  // ... existing fields ...
  evolution_info: EvolutionInfo;
}
```

## Validation Rules

1. **Evolution Eligibility**:
   - `can_evolve` must be true
   - Pokemon must not be at final stage
   - Pokemon must be owned by requesting user

2. **Evolution Execution**:
   - Update `pokemon_id` to next evolution number
   - Set `can_evolve` to false
   - Preserve: `level`, `experience`, `selected_moves`, `is_active`, `is_starter`

3. **Level-Up Eligibility Check**:
   - After any level increase, check if new level >= evolution threshold
   - If yes and not at final stage, set `can_evolve = true`
