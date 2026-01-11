# Data Model: Combat Zone Selection with Difficulty Levels

**Feature Branch**: `006-combat-zones`
**Date**: 2026-01-11

## Entities

### Zone (Static Configuration)

Represents a combat environment with themed Pokemon types.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique zone identifier (e.g., "jungle", "ocean") |
| name | string | Display name (e.g., "Jungle", "Ocean") |
| description | string | Thematic description of the zone |
| types | string[] | Pokemon types found in this zone |
| color | string | Theme color for UI (tailwind class or hex) |

**Zone Configuration (8 zones)**:

```json
[
  {
    "id": "jungle",
    "name": "Jungle",
    "description": "Dense vegetation filled with bugs, plants, and venomous creatures",
    "types": ["bug", "grass", "poison"],
    "color": "green"
  },
  {
    "id": "ocean",
    "name": "Ocean",
    "description": "Coastal and aquatic environments with sea creatures",
    "types": ["water", "flying", "normal"],
    "color": "blue"
  },
  {
    "id": "volcano",
    "name": "Volcano",
    "description": "Volcanic terrain with fire and rock dwellers",
    "types": ["fire", "rock", "ground"],
    "color": "red"
  },
  {
    "id": "power-plant",
    "name": "Power Plant",
    "description": "Industrial facilities housing electric and steel types",
    "types": ["electric", "steel", "normal"],
    "color": "yellow"
  },
  {
    "id": "haunted-tower",
    "name": "Haunted Tower",
    "description": "Abandoned structures with supernatural presence",
    "types": ["ghost", "psychic", "poison"],
    "color": "purple"
  },
  {
    "id": "frozen-cave",
    "name": "Frozen Cave",
    "description": "Frozen underground caverns with ice and rock types",
    "types": ["ice", "rock", "ground"],
    "color": "cyan"
  },
  {
    "id": "dojo",
    "name": "Dojo",
    "description": "Martial arts training grounds with fighting spirit",
    "types": ["fighting", "normal", "flying"],
    "color": "orange"
  },
  {
    "id": "dragon-shrine",
    "name": "Dragon Shrine",
    "description": "Ancient mystical location housing legendary creatures",
    "types": ["dragon", "fairy", "psychic"],
    "color": "indigo"
  }
]
```

### ZoneDifficulty (Enum)

Difficulty levels for zone encounters.

| Value | SR Constraint | Level Constraint |
|-------|---------------|------------------|
| easy | Max +2 SR above player | Same level or lower |
| medium | Max +5 SR above player | +0 to +3 levels |
| hard | Any SR | +4 to +6 levels |

### Battle (Modified - Existing Entity)

The existing `battles` table gains a `zone` column.

| Field | Type | Change | Description |
|-------|------|--------|-------------|
| id | uuid | existing | Primary key |
| user_id | string | existing | Trainer ID |
| player_pokemon_id | uuid | existing | Active Pokemon |
| wild_pokemon | jsonb | existing | Generated wild Pokemon |
| difficulty | string | **modified** | Now supports 'easy', 'medium', 'hard' |
| zone | string | **NEW** | Zone ID (nullable for backward compatibility) |
| player_wins | int | existing | Round wins |
| wild_wins | int | existing | Wild Pokemon wins |
| capture_attempts | int | existing | Capture attempts |
| status | string | existing | Battle status |
| seed | string | existing | RNG seed |
| created_at | timestamp | existing | Created timestamp |
| ended_at | timestamp | existing | Ended timestamp |

**Migration**: Add nullable `zone` column to `battles` table. Existing battles without zone will show "Random" in UI.

## Type Definitions (TypeScript)

```typescript
// Zone configuration
export interface Zone {
  id: string;
  name: string;
  description: string;
  types: string[];
  color: string;
}

// Zone difficulty levels
export type ZoneDifficulty = 'easy' | 'medium' | 'hard';

// Difficulty constraints
export interface DifficultyConstraints {
  maxSrOffset: number;      // Max SR above player (Infinity for 'hard')
  minLevelOffset: number;   // Min level offset from player
  maxLevelOffset: number;   // Max level offset from player
}

// Zone battle request
export interface StartZoneBattleRequest {
  zone_id: string;
  difficulty: ZoneDifficulty;
}

// Extend existing Battle type
export interface ZoneBattle extends Battle {
  zone: string | null;
}
```

## Validation Rules

1. **Zone ID**: Must be one of the 8 valid zone IDs
2. **Difficulty**: Must be 'easy', 'medium', or 'hard' for zone battles
3. **Type Match**: Generated wild Pokemon must have at least one type matching the zone
4. **SR Constraints**:
   - Easy: `wildSR <= playerSR + 2`
   - Medium: `wildSR <= playerSR + 5`
   - Hard: No SR limit
5. **Level Constraints**:
   - Easy: `wildLevel <= playerLevel`
   - Medium: `wildLevel >= playerLevel && wildLevel <= playerLevel + 3`
   - Hard: `wildLevel >= playerLevel + 4 && wildLevel <= playerLevel + 6`

## State Transitions

```
[No Battle] --select zone--> [Zone Selected] --select difficulty--> [Starting Battle]
[Starting Battle] --API success--> [Active Battle]
[Active Battle] --battle resolution--> [Battle Ended]
[Battle Ended] --new battle--> [No Battle]
```

## Relationships

- Zone (static) -> Pokemon (via type matching)
- Battle -> Zone (via zone_id column)
- Battle -> Difficulty (via difficulty column)
- Battle -> Trainer (via user_id)
- Battle -> Pokemon (via player_pokemon_id and wild_pokemon)
