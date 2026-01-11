# API Contract: Pokemon Owned Response (Modified)

**Feature**: 007-experience-leveling

## Overview

Any API endpoint returning `PokemonOwned` or `PokemonOwnedWithDetails` now includes the `experience` field.

## Affected Endpoints

- GET /api/dashboard
- GET /api/pokecenter
- GET /api/battle (player_pokemon in response)

## Schema Changes

### PokemonOwned

```typescript
{
  id: string;
  user_id: string;
  pokemon_id: number;
  level: number;
  experience: number;         // NEW: 0 to threshold-1
  selected_moves: string[];
  is_active: boolean;
  is_starter: boolean;
  captured_at: string;
}
```

### PokemonOwnedWithDetails

```typescript
{
  // ... all PokemonOwned fields ...
  name: string;
  types: string[];
  sr: number;
  sprite_url: string;
  experience_to_next: number;  // NEW: calculated (level * 2 + 10) - experience
}
```

## Example: Dashboard Response

```json
{
  "trainer_name": "Ash",
  "active_pokemon": {
    "id": "abc-123",
    "user_id": "user-456",
    "pokemon_id": 25,
    "level": 5,
    "experience": 8,
    "selected_moves": ["thunder-shock", "growl", "quick-attack", "double-team"],
    "is_active": true,
    "is_starter": true,
    "captured_at": "2026-01-10T12:00:00Z",
    "name": "Pikachu",
    "types": ["Electric"],
    "sr": 2,
    "sprite_url": "/sprites/025.png",
    "experience_to_next": 12
  },
  "pokemon_count": 3,
  "stats": { ... },
  "has_active_battle": false
}
```

## Experience Display Logic

For UI display purposes:

```typescript
// Calculate experience to next level
function getExperienceToNext(pokemon: PokemonOwned): number {
  if (pokemon.level >= 10) return 0;  // Max level
  const threshold = (pokemon.level * 2) + 10;
  return threshold - pokemon.experience;
}

// Calculate required experience for current level
function getExperienceRequired(level: number): number {
  return (level * 2) + 10;
}

// Format for display
function formatExperience(pokemon: PokemonOwned): string {
  if (pokemon.level >= 10) return "MAX LEVEL";
  const required = getExperienceRequired(pokemon.level);
  return `${pokemon.experience} / ${required} XP`;
}
```

## Notes

1. `experience` is always a non-negative integer
2. At level 10, `experience_to_next` will be 0
3. Frontend should handle level 10 specially (show "MAX" instead of progress bar)
