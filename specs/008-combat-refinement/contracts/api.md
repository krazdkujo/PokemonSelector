# API Contracts: Combat System Refinement

**Feature**: 008-combat-refinement
**Date**: 2026-01-11

## Overview

This feature extends existing API endpoints. No new endpoints are created.

---

## Extended Endpoints

### POST /api/battle/round

Execute a battle round with move selection.

**Existing Behavior**: Executes round, returns result with DC in response.

**Enhanced Behavior**: No API changes needed - DC is already returned in `RoundResult`.

**Response** (unchanged):
```json
{
  "round": {
    "round_number": 1,
    "player_move": "Thunderbolt",
    "winner": "player",
    "roll": 15,
    "dc": 12,
    "base_chance": 0.55,
    "type_effectiveness": "super_effective",
    "had_stab": true
  },
  "battle": { ... },
  "battle_ended": false,
  "experience_gained": {
    "xp_awarded": 3,
    "previous_level": 2,
    "new_level": 2,
    "previous_experience": 5,
    "new_experience": 8,
    "levels_gained": 0
  }
}
```

---

### GET /api/battle/round/preview (NEW - Optional)

Preview DC for a specific move before executing.

**Request**:
```
GET /api/battle/round/preview?move_id=thunderbolt
```

**Response**:
```json
{
  "move_id": "thunderbolt",
  "move_name": "Thunderbolt",
  "move_type": "Electric",
  "dc": 12,
  "win_chance": 0.55,
  "factors": {
    "base": 0.50,
    "level_bonus": 0.05,
    "sr_bonus": -0.05,
    "type_bonus": 0.15,
    "stab_bonus": 0.10
  },
  "effectiveness": "super_effective",
  "has_stab": true
}
```

**Note**: This endpoint is optional. UI can compute DC locally if desired.

---

### POST /api/capture

Attempt to capture the wild Pokemon.

**Existing Behavior**: Attempts capture, creates pokemon_owned entry on success.

**Enhanced Behavior**: Adds ownership check before capture attempt.

**New Error Response** (added):
```json
{
  "error": "ALREADY_OWNED",
  "message": "You already have this Pokemon species in your collection"
}
```

**Status Code**: 400 Bad Request

**Full Error Cases**:
| Error Code | Status | Description |
|------------|--------|-------------|
| UNAUTHORIZED | 401 | No trainer session |
| NO_ACTIVE_BATTLE | 400 | No battle in progress |
| NOT_ENOUGH_WINS | 400 | Need at least 1 round win |
| ALREADY_OWNED | 400 | **NEW** Species already in collection |

---

### GET /api/capture

Get capture eligibility and DC for current battle.

**Existing Behavior**: Returns capture DC and eligibility.

**Enhanced Response**:
```json
{
  "dc": 14,
  "can_capture": true,
  "player_wins": 2,
  "wild_pokemon": "Pikachu",
  "already_owned": false,
  "ownership_message": null
}
```

**When Already Owned**:
```json
{
  "dc": 14,
  "can_capture": false,
  "player_wins": 2,
  "wild_pokemon": "Pikachu",
  "already_owned": true,
  "ownership_message": "Already caught - can only knock out"
}
```

---

### GET /api/battle

Get current active battle or null.

**Enhanced Response** (add ownership flag for wild Pokemon):
```json
{
  "id": "uuid",
  "status": "active",
  "wild_pokemon": {
    "pokemon_id": 25,
    "name": "Pikachu",
    "level": 5,
    "types": ["Electric"],
    "sprite_url": "..."
  },
  "player_wins": 1,
  "wild_wins": 0,
  "wild_pokemon_owned": true,
  ...
}
```

**New Field**:
- `wild_pokemon_owned`: boolean - True if player already owns this species

---

## Type Definitions (TypeScript)

### Extended Types

```typescript
// Add to src/lib/types.ts

interface PostBattleSummary {
  outcome: 'victory' | 'defeat' | 'capture' | 'fled';
  wild_pokemon: {
    name: string;
    level: number;
    sprite_url: string;
  };
  experience: ExperienceGained;
  score: {
    player_wins: number;
    wild_wins: number;
  };
}

interface CaptureEligibility {
  dc: number;
  can_capture: boolean;
  player_wins: number;
  wild_pokemon: string;
  already_owned: boolean;
  ownership_message: string | null;
}

interface MovePreview {
  move_id: string;
  move_name: string;
  move_type: string;
  dc: number;
  win_chance: number;
  factors: {
    base: number;
    level_bonus: number;
    sr_bonus: number;
    type_bonus: number;
    stab_bonus: number;
  };
  effectiveness: TypeEffectiveness;
  has_stab: boolean;
}
```

---

## UI Contract

### BattleArena Component

**Props** (extended):
```typescript
interface BattleArenaProps {
  battle: Battle & {
    player_pokemon?: PlayerPokemonInfo;
    wild_pokemon_owned?: boolean;  // NEW
  };
  availableMoves: Move[];
  lastRound: RoundResult | null;
  onMoveSelect: (moveId: string) => void;
  isExecuting: boolean;
  pendingDC?: number;  // NEW - DC to show before roll
}
```

### PostBattleScreen Component

**Props** (new component):
```typescript
interface PostBattleScreenProps {
  summary: PostBattleSummary;
  onContinue: () => void;
}
```

### CaptureAttempt Component

**Props** (extended):
```typescript
interface CaptureAttemptProps {
  battleId: string;
  wildPokemonName: string;
  playerWins: number;
  onCapture: (result: CaptureResult) => void;
  alreadyOwned?: boolean;  // NEW
  ownershipMessage?: string;  // NEW
}
```
