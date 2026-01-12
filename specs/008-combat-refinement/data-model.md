# Data Model: Combat System Refinement

**Feature**: 008-combat-refinement
**Date**: 2026-01-11

## Overview

This feature requires no database schema changes. All functionality uses existing tables and extends API response structures.

## Existing Entities (No Changes)

### pokemon_owned

Used for ownership check when determining capture eligibility.

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key (instance ID) |
| user_id | uuid | Foreign key to trainers |
| pokemon_id | integer | Species ID from JSON data |
| level | integer | Current level (1-10) |
| experience | integer | Current XP toward next level |
| selected_moves | text[] | Array of move IDs |
| is_active | boolean | Currently active Pokemon |
| is_starter | boolean | Was starter selection |
| captured_at | timestamp | When captured |

**Ownership Query** (for capture restriction):
```sql
SELECT EXISTS (
  SELECT 1 FROM pokemon_owned
  WHERE user_id = :user_id
    AND pokemon_id = :species_id
) AS already_owned
```

### battles

No changes to battle table structure.

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to trainers |
| player_pokemon_id | uuid | FK to pokemon_owned |
| wild_pokemon | jsonb | Wild Pokemon data |
| player_wins | integer | Round wins |
| wild_wins | integer | Wild round wins |
| status | text | active/player_won/wild_won/captured/fled |
| ... | ... | Other existing fields |

## Extended Response Types

### RoundResult (Extended)

Already includes DC in current implementation. No changes needed.

```typescript
interface RoundResult {
  round_number: number;
  player_move: string;
  winner: 'player' | 'wild';
  roll: number;
  dc: number;                        // Already present
  base_chance: number;
  type_effectiveness: TypeEffectiveness;
  had_stab: boolean;
}
```

### PostBattleSummary (New Type)

New TypeScript interface for post-battle display.

```typescript
interface PostBattleSummary {
  outcome: 'victory' | 'defeat' | 'capture' | 'fled';
  wild_pokemon: {
    name: string;
    level: number;
    sprite_url: string;
  };
  experience: {
    xp_awarded: number;
    previous_xp: number;
    new_xp: number;
    previous_level: number;
    new_level: number;
    levels_gained: number;
    is_max_level: boolean;
  };
  score: {
    player_wins: number;
    wild_wins: number;
  };
}
```

### CaptureEligibility (New Type)

New TypeScript interface for capture button state.

```typescript
interface CaptureEligibility {
  can_capture: boolean;
  reason?: 'not_enough_wins' | 'already_owned' | 'battle_ended';
  owned_pokemon_name?: string;  // If already owned, show which one
}
```

## State Transitions

### Battle Flow with DC Display

```
[Select Move] -> [Show DC] -> [Reveal Roll] -> [Show Result]
     |              |              |               |
     v              v              v               v
  moveId        DC: 12        Roll: 15       "You won!"
```

### Post-Battle Flow

```
[Battle Ends] -> [Post-Battle Screen] -> [Level-Up?] -> [Return to Dashboard]
      |                  |                    |
      v                  v                    v
   status          XP Summary           Level Up Banner
                                        (if applicable)
```

### Capture Eligibility Flow

```
[Battle Active] -> [Check Wins >= 1] -> [Check Ownership] -> [Show Capture Button]
                         |                    |                      |
                         v                    v                      v
                    wins < 1?           owned? -> Disabled      Available
                         |                    |
                         v                    v
                   Disabled            "Already caught"
```

## Validation Rules

### Capture Restriction

- **Rule**: Cannot capture Pokemon species already in collection
- **Scope**: Species ID (pokemon_id), not instance ID
- **Check Point**: API-level (server-side enforcement)
- **UI Indication**: Disabled button with tooltip
- **Edge Case**: If previously owned species was released, capture becomes available again

### XP Display

- **Rule**: Always show XP summary on battle end
- **Scope**: Win and loss scenarios
- **Values**: Win grants `max(1, wildLevel - playerLevel)`, Loss grants 1 XP
- **Edge Case**: Max level (10) shows "MAX LEVEL" instead of XP bar

### Level-Up Display

- **Rule**: Show level-up notification only when `levels_gained > 0`
- **Scope**: Victory and defeat (XP granted in both)
- **Format**: "Level X -> Level Y!" for single level, same for multi-level
- **Edge Case**: Reaching max level shows special celebration

## No Schema Migrations Required

This feature uses only existing tables:
- `pokemon_owned` - For ownership lookup
- `battles` - For battle state
- `battle_rounds` - For round history

No new columns, tables, or indexes needed.
