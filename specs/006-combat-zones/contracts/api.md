# API Contracts: Combat Zone Selection

**Feature Branch**: `006-combat-zones`
**Date**: 2026-01-11

## Endpoints

### GET /api/zones

Retrieve all available combat zones.

**Authentication**: Optional (public endpoint)

**Response 200**:
```json
{
  "zones": [
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
    }
    // ... 6 more zones
  ]
}
```

---

### GET /api/zones/:zoneId/preview

Preview Pokemon available in a zone based on trainer's active Pokemon level.

**Authentication**: Required (session cookie or X-API-Key)

**Path Parameters**:
- `zoneId` (string): Zone identifier

**Response 200**:
```json
{
  "zone": {
    "id": "jungle",
    "name": "Jungle",
    "types": ["bug", "grass", "poison"]
  },
  "difficulties": {
    "easy": {
      "description": "Pokemon at your level or lower, up to +2 SR",
      "example_pokemon": ["Caterpie", "Weedle", "Oddish"],
      "pokemon_count": 15
    },
    "medium": {
      "description": "Pokemon 0-3 levels higher, up to +5 SR",
      "example_pokemon": ["Butterfree", "Venomoth", "Vileplume"],
      "pokemon_count": 25
    },
    "hard": {
      "description": "Pokemon 4-6 levels higher, any SR",
      "example_pokemon": ["Venusaur", "Victreebel", "Muk"],
      "pokemon_count": 30
    }
  }
}
```

**Response 401** (Unauthorized):
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

**Response 404** (Zone not found):
```json
{
  "error": "NOT_FOUND",
  "message": "Zone not found"
}
```

---

### POST /api/battle (Modified)

Start a new battle encounter. Extended to support zone-based battles.

**Authentication**: Required (session cookie or X-API-Key)

**Request Body** (zone battle):
```json
{
  "zone_id": "jungle",
  "difficulty": "medium"
}
```

**Request Body** (legacy random battle - backward compatible):
```json
{
  "difficulty": "normal"
}
```

**Response 201** (Battle created):
```json
{
  "id": "uuid-here",
  "user_id": "trainer-uuid",
  "player_pokemon_id": "pokemon-uuid",
  "wild_pokemon": {
    "pokemon_id": 12,
    "name": "Butterfree",
    "level": 8,
    "sr": 3,
    "types": ["bug", "flying"],
    "current_hp": 100,
    "sprite_url": "https://..."
  },
  "zone": "jungle",
  "difficulty": "medium",
  "player_wins": 0,
  "wild_wins": 0,
  "capture_attempts": 0,
  "status": "active",
  "seed": "battle_123...",
  "created_at": "2026-01-11T...",
  "ended_at": null,
  "player_pokemon": {
    "pokemon_id": 1,
    "name": "Bulbasaur",
    "types": ["grass", "poison"],
    "sprite_url": "https://...",
    "level": 5,
    "selected_moves": ["tackle", "growl"]
  }
}
```

**Response 400** (Validation error):
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid zone_id. Must be one of: jungle, ocean, volcano, power-plant, haunted-tower, frozen-cave, dojo, dragon-shrine"
}
```

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid difficulty for zone battle. Must be easy, medium, or hard."
}
```

**Response 400** (No matching Pokemon):
```json
{
  "error": "NO_MATCHING_POKEMON",
  "message": "No Pokemon available matching zone and difficulty criteria. A fallback encounter has been generated."
}
```

**Response 400** (Battle in progress):
```json
{
  "error": "BATTLE_IN_PROGRESS",
  "message": "You already have an active battle. Complete or forfeit it first."
}
```

**Response 400** (No active Pokemon):
```json
{
  "error": "NO_ACTIVE_POKEMON",
  "message": "You need an active Pokemon to battle."
}
```

**Response 401** (Unauthorized):
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

---

### GET /api/battle (Unchanged)

Returns current active battle or null. No changes to existing contract.

---

### POST /api/battle/round (Unchanged)

Execute a battle round. No changes to existing contract.

---

## Type Definitions

```typescript
// Zone types
type ZoneId =
  | 'jungle'
  | 'ocean'
  | 'volcano'
  | 'power-plant'
  | 'haunted-tower'
  | 'frozen-cave'
  | 'dojo'
  | 'dragon-shrine';

type ZoneDifficulty = 'easy' | 'medium' | 'hard';

// Backward compatible - existing difficulty type
type LegacyDifficulty = 'easy' | 'normal' | 'difficult';

interface Zone {
  id: ZoneId;
  name: string;
  description: string;
  types: string[];
  color: string;
}

interface ZoneDifficultyPreview {
  description: string;
  example_pokemon: string[];
  pokemon_count: number;
}

interface ZonePreviewResponse {
  zone: Pick<Zone, 'id' | 'name' | 'types'>;
  difficulties: {
    easy: ZoneDifficultyPreview;
    medium: ZoneDifficultyPreview;
    hard: ZoneDifficultyPreview;
  };
}

interface StartZoneBattleRequest {
  zone_id: ZoneId;
  difficulty: ZoneDifficulty;
}

interface StartLegacyBattleRequest {
  difficulty: LegacyDifficulty;
}

type StartBattleRequest = StartZoneBattleRequest | StartLegacyBattleRequest;
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Authentication required |
| VALIDATION_ERROR | 400 | Invalid request parameters |
| NOT_FOUND | 404 | Resource not found |
| BATTLE_IN_PROGRESS | 400 | User has active battle |
| NO_ACTIVE_POKEMON | 400 | User has no active Pokemon |
| NO_MATCHING_POKEMON | 400 | No Pokemon match criteria (fallback used) |
| DATABASE_ERROR | 500 | Database operation failed |
| INTERNAL_ERROR | 500 | Unexpected server error |
