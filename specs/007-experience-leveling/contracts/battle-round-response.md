# API Contract: Battle Round Response (Modified)

**Endpoint**: POST /api/battle/round
**Feature**: 007-experience-leveling

## Overview

The battle round endpoint response is extended to include experience information when a battle ends in player victory.

## Response Schema Changes

### Existing Response (unchanged fields)

```typescript
{
  round: RoundResult;
  battle: Battle;
  battle_ended: boolean;
}
```

### Extended Response (when battle_ended && battle.status === 'player_won')

```typescript
{
  round: RoundResult;
  battle: Battle;
  battle_ended: boolean;
  experience_gained?: {
    xp_awarded: number;           // XP gained this battle
    previous_level: number;       // Level before XP applied
    new_level: number;            // Level after XP applied
    previous_experience: number;  // XP before this battle
    new_experience: number;       // XP after level-ups applied
    levels_gained: number;        // Number of level-ups (0 or more)
  };
}
```

## Example Responses

### Victory with Level Up

```json
{
  "round": {
    "round_number": 3,
    "player_move": "Thunderbolt",
    "winner": "player",
    "roll": 15,
    "dc": 10,
    "base_chance": 0.55,
    "type_effectiveness": "super_effective",
    "had_stab": true
  },
  "battle": {
    "id": "abc-123",
    "status": "player_won",
    "player_wins": 3,
    "wild_wins": 1
  },
  "battle_ended": true,
  "experience_gained": {
    "xp_awarded": 3,
    "previous_level": 4,
    "new_level": 5,
    "previous_experience": 16,
    "new_experience": 1,
    "levels_gained": 1
  }
}
```

### Victory without Level Up

```json
{
  "round": {
    "round_number": 3,
    "player_move": "Tackle",
    "winner": "player",
    "roll": 12,
    "dc": 11,
    "base_chance": 0.50,
    "type_effectiveness": "neutral",
    "had_stab": false
  },
  "battle": {
    "id": "def-456",
    "status": "player_won",
    "player_wins": 3,
    "wild_wins": 2
  },
  "battle_ended": true,
  "experience_gained": {
    "xp_awarded": 1,
    "previous_level": 2,
    "new_level": 2,
    "previous_experience": 5,
    "new_experience": 6,
    "levels_gained": 0
  }
}
```

### Loss (no experience)

```json
{
  "round": {
    "round_number": 3,
    "player_move": "Scratch",
    "winner": "wild",
    "roll": 5,
    "dc": 12,
    "base_chance": 0.45,
    "type_effectiveness": "not_very_effective",
    "had_stab": false
  },
  "battle": {
    "id": "ghi-789",
    "status": "wild_won",
    "player_wins": 2,
    "wild_wins": 3
  },
  "battle_ended": true
}
```

Note: `experience_gained` field is only present when `status === 'player_won'`.

## Behavior Notes

1. Experience is calculated as `max(1, wildPokemonLevel - playerPokemonLevel)`
2. Experience is only awarded on victory (`player_wins === 3`)
3. Multiple level-ups are possible if XP exceeds multiple thresholds
4. At level 10 (max), `levels_gained` will always be 0 but XP is still tracked
