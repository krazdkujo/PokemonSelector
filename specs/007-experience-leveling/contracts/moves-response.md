# API Contract: Moves API (Modified)

**Endpoint**: GET /api/moves, PUT /api/moves
**Feature**: 007-experience-leveling

## Overview

The moves API is modified to return ALL available moves for a Pokemon regardless of level. Previously, moves were filtered by `LEVEL_TO_MOVE_TIER` based on Pokemon level.

## GET /api/moves

### Response Schema (unchanged structure)

```typescript
{
  available_moves: Move[];      // Now includes ALL moves, not level-filtered
  selected_moves: string[];
  pokemon_id: string;
  pokemon_level: number;
}
```

### Behavior Change

**Before**: `available_moves` only included moves unlocked at or below current level tier.

**After**: `available_moves` includes ALL moves the Pokemon can learn:
- All moves from `start`, `level2`, `level6`, `level10`, `level14`, `level18` tiers
- All inherited moves from pre-evolution Pokemon

### Example Response

For a Level 1 Charmander (previously would only show `start` moves):

```json
{
  "available_moves": [
    { "id": "scratch", "name": "Scratch", "type": "Normal" },
    { "id": "growl", "name": "Growl", "type": "Normal" },
    { "id": "ember", "name": "Ember", "type": "Fire" },
    { "id": "leer", "name": "Leer", "type": "Normal" },
    { "id": "rage", "name": "Rage", "type": "Normal" },
    { "id": "slash", "name": "Slash", "type": "Normal" },
    { "id": "flamethrower", "name": "Flamethrower", "type": "Fire" },
    { "id": "fire-spin", "name": "Fire Spin", "type": "Fire" }
  ],
  "selected_moves": ["scratch", "growl", "ember", "leer"],
  "pokemon_id": "abc-123",
  "pokemon_level": 1
}
```

## PUT /api/moves

### Request Schema (unchanged)

```typescript
{
  moves: string[];  // Array of exactly 4 move IDs
}
```

### Validation Change

**Before**: Validated that selected moves were available at current level.

**After**: Validates that selected moves exist in the Pokemon's complete move pool (any level tier).

### Example Request

```json
{
  "moves": ["scratch", "ember", "flamethrower", "fire-spin"]
}
```

This would now be **valid** for a Level 1 Charmander (previously would fail because `flamethrower` is a high-level move).

### Error Response (unchanged structure)

```json
{
  "error": "INVALID_MOVES",
  "message": "Some moves are not available to your Pokemon: invalid-move-id"
}
```

## Notes

1. Move selection is now purely based on species, not level
2. Pre-evolution moves are still inherited (unchanged behavior)
3. Players have full control over moveset from the start
4. This enables strategic move selection without level grinding
