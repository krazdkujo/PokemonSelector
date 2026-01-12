# Evolution API Contract

**Feature**: 012-pokemon-evolution
**Date**: 2026-01-11

## Endpoints

### POST /api/pokecenter/evolve

Evolve a Pokemon to its next evolution form.

**Authentication**: Required (session or API key)

**Request Body**:
```json
{
  "pokemon_id": "uuid-string"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "pokemon": {
    "id": "uuid-string",
    "user_id": "uuid-string",
    "pokemon_id": 2,
    "level": 3,
    "experience": 5,
    "selected_moves": ["tackle", "vine-whip", "growl", "leech-seed"],
    "is_active": true,
    "is_starter": true,
    "captured_at": "2026-01-10T12:00:00Z",
    "can_evolve": false,
    "name": "Ivysaur",
    "types": ["Grass", "Poison"],
    "sr": 0.55,
    "sprite_url": "/sprites/2.png",
    "experience_to_next": 16,
    "evolution_info": {
      "canEvolve": false,
      "currentStage": 2,
      "totalStages": 3,
      "evolvesAtLevel": 6,
      "nextEvolutionId": 3,
      "nextEvolutionName": "Venusaur"
    }
  },
  "evolved_from": {
    "pokemon_id": 1,
    "name": "Bulbasaur"
  },
  "evolved_to": {
    "pokemon_id": 2,
    "name": "Ivysaur"
  }
}
```

**Error Responses**:

| Status | Error Code | Message |
|--------|------------|---------|
| 400 | CANNOT_EVOLVE | Pokemon is not eligible for evolution |
| 400 | FINAL_STAGE | Pokemon is already at its final evolution |
| 401 | UNAUTHORIZED | Invalid or missing authentication |
| 404 | NOT_FOUND | Pokemon not found or not owned by user |

**Error Response Format**:
```json
{
  "error": "CANNOT_EVOLVE",
  "message": "Pokemon is not eligible for evolution"
}
```

---

### GET /api/pokecenter (Modified)

The existing Pokecenter endpoint now includes evolution information for each Pokemon.

**Modified Response Field**:
```json
{
  "pokemon": [
    {
      "...existing fields...",
      "can_evolve": true,
      "evolution_info": {
        "canEvolve": true,
        "currentStage": 1,
        "totalStages": 3,
        "evolvesAtLevel": 3,
        "nextEvolutionId": 2,
        "nextEvolutionName": "Ivysaur"
      }
    }
  ],
  "active_pokemon_id": "uuid"
}
```

---

### POST /api/battle/round (Modified)

Battle round response now includes evolution eligibility when a level-up occurs.

**Modified Response Fields** (when `experience_gained.levels_gained > 0`):
```json
{
  "round": { "...existing..." },
  "battle": { "...existing..." },
  "battle_ended": true,
  "experience_gained": {
    "xp_awarded": 3,
    "previous_level": 2,
    "new_level": 3,
    "previous_experience": 10,
    "new_experience": 1,
    "levels_gained": 1,
    "evolution_available": true,
    "evolution_details": {
      "from_name": "Bulbasaur",
      "from_id": 1,
      "to_name": "Ivysaur",
      "to_id": 2
    }
  }
}
```

---

### POST /api/capture (Modified)

Capture response also includes evolution eligibility when XP causes level-up.

**Modified Response Fields** (on successful capture with level-up):
```json
{
  "result": { "...existing..." },
  "battle": { "...existing..." },
  "captured_pokemon": { "...existing..." },
  "experience_gained": {
    "...existing fields...",
    "evolution_available": true,
    "evolution_details": {
      "from_name": "Charmander",
      "from_id": 4,
      "to_name": "Charmeleon",
      "to_id": 5
    }
  }
}
```

---

## Evolution Info Schema

Included in all Pokemon responses:

```typescript
interface EvolutionInfo {
  canEvolve: boolean;        // True if eligible right now
  currentStage: number;      // 1, 2, or 3
  totalStages: number;       // 1, 2, or 3
  evolvesAtLevel: number | null;  // Level threshold, null if final
  nextEvolutionId: number | null; // Pokemon ID after evolution
  nextEvolutionName: string | null; // Pokemon name after evolution
}
```

## Validation Rules

1. **Evolve Endpoint**:
   - User must own the Pokemon (`user_id` matches session)
   - Pokemon must have `can_evolve = true`
   - Pokemon must not be at final stage

2. **Evolution Trigger**:
   - Automatically set `can_evolve = true` when level reaches threshold
   - Check occurs after XP is applied in battle/capture

3. **Evolution Execution**:
   - Update `pokemon_id` to `pokemon_id + 1`
   - Reset `can_evolve` to false
   - Preserve all other fields
