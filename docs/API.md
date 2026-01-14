# Pokemon Starter Selector API

Complete API documentation for the Pokemon Starter Selector platform.

## Table of Contents

- [Changelog](#changelog)
- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Rate Limiting](#rate-limiting)
- [Quick Reference](#quick-reference)
- [Endpoints](#endpoints)
  - [Account](#account-endpoints)
  - [Starter](#starter-endpoints)
  - [Trainer](#trainer-endpoints)
  - [Pokemon Collection](#pokemon-collection-endpoints)
  - [Evolution](#evolution-endpoints)
  - [Moves](#moves-endpoints)
  - [Zones](#zones-endpoints)
  - [Battle System](#battle-system-endpoints)
  - [Capture](#capture-endpoints)
  - [API Key](#api-key-endpoints)
  - [PIN Security](#pin-security-endpoints)
  - [Admin](#admin-endpoints)
- [Error Reference](#error-reference)
- [Code Examples](#code-examples)
- [Troubleshooting](#troubleshooting)

---

## Changelog

### v2.0.0 (2025-01-14) - Breaking Changes

This release includes breaking changes that may affect existing integrations.

#### Breaking Changes

| Change | Endpoint | Description |
|--------|----------|-------------|
| PIN Required for Login | `POST /api/trainer` | Existing accounts with a PIN set now **require** the PIN in the login request. New accounts can still be created without a PIN. |
| Auth Method Changed | `GET /api/trainers` | Removed `requester_id` query parameter. Now uses session cookie or `X-API-Key` header (admin role required). |

#### Migration Guide

**For `POST /api/trainer`:**

Before:
```json
{ "name": "Ash" }
```

After (for accounts with PIN):
```json
{ "name": "Ash", "pin": "1234" }
```

**New Error Responses:**
- `401 PIN_REQUIRED` - Account has PIN but none provided
- `401 INVALID_PIN` - Incorrect PIN (shows attempts remaining)
- `423 ACCOUNT_LOCKED` - Too many failed attempts (15 min lockout)

**For `GET /api/trainers`:**

Before:
```
GET /api/trainers?requester_id=your-uuid
```

After:
```
GET /api/trainers
Headers: X-API-Key: your-admin-api-key
```

#### Improvements

- **Account Lockout Protection**: After 5 failed PIN attempts, accounts are locked for 15 minutes
- **Consistent Admin Auth**: All admin endpoints now support both session cookie and API key authentication
- **Bug Fix**: Fixed capture failure for level 10 Pokemon in medium/hard zones

---

## Overview

The Pokemon Starter Selector API allows authenticated users to:

- Retrieve trainer information and statistics
- Manage Pokemon collections
- Configure battle moves
- Explore combat zones
- Participate in battles against wild Pokemon
- Capture new Pokemon

All responses are in JSON format. The API follows RESTful conventions.

---

## Authentication

All endpoints (except `/api/zones`) require authentication via an API key.

### Obtaining an API Key

1. Log in to the Pokemon Starter Selector web application
2. Navigate to your **Dashboard**
3. Scroll to the **Secret Key** section
4. Click **Generate API Key**
5. **Copy and securely store your key** - it cannot be retrieved again!

### Using Your API Key

Include your key in the `X-API-Key` header with every request:

```bash
curl -H "X-API-Key: YOUR_API_KEY" https://pokemon-selector-rctq.vercel.app/api/dashboard
```

---

## Base URL

```
https://pokemon-selector-rctq.vercel.app
```

---

## Rate Limiting

There are currently no rate limits enforced. Please be respectful of server resources and avoid excessive requests.

---

## Quick Reference

### Account & Starter

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/trainer` | GET | Get your trainer profile | Yes |
| `/api/trainer` | POST | Create or login as trainer | No |
| `/api/trainer/{id}/nickname` | PUT | Set Pokemon nickname | Yes |
| `/api/trainer/{id}/nickname` | DELETE | Clear Pokemon nickname | Yes |
| `/api/starter` | GET | List available starters | No |
| `/api/starter` | POST | Select your starter | Yes |

### Trainer & Pokemon

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/external/trainer` | GET | Get trainer with full stats | Yes |
| `/api/dashboard` | GET | Get dashboard overview | Yes |
| `/api/pokecenter` | GET | List your Pokemon | Yes |
| `/api/pokecenter/swap` | POST | Change active Pokemon | Yes |
| `/api/pokecenter/evolve` | POST | Evolve a Pokemon | Yes |
| `/api/pokedex` | GET | Get Pokedex progress | Yes |
| `/api/moves` | GET | Get available moves | Yes |
| `/api/moves` | PUT | Update selected moves | Yes |

### Zones & Battle

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/zones` | GET | List combat zones | No |
| `/api/zones/{id}/preview` | GET | Preview zone encounters | Yes |
| `/api/battle` | GET | Get active battle | Yes |
| `/api/battle` | POST | Start a battle | Yes |
| `/api/battle/round` | POST | Execute battle round | Yes |
| `/api/capture` | GET | Check capture eligibility | Yes |
| `/api/capture` | POST | Attempt capture | Yes |

### API Key & Security

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/secret-key` | GET | Get API key metadata | Session |
| `/api/secret-key` | POST | Generate/regenerate API key | Session |
| `/api/pin/status` | GET | Check PIN status | Session |
| `/api/pin/create` | POST | Create or update PIN | Session |
| `/api/pin/verify` | POST | Verify PIN | Session |

### Admin Only

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/trainers` | GET | List all trainers | Admin |
| `/api/trainers/{id}/role` | PATCH | Change trainer role | Admin |
| `/api/pin/admin/reset` | POST | Reset user's PIN | Admin |
| `/api/pin/admin/unlock` | POST | Unlock locked account | Admin |

---

## Endpoints

### Account Endpoints

#### GET /api/trainer

Retrieve your basic trainer profile information.

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `X-API-Key` | Yes | Your API key |

**Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Ash",
  "role": "trainer",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### POST /api/trainer

Create a new trainer account or login to an existing one (case-insensitive name match).

**Request Body:**

```json
{
  "name": "Ash",
  "pin": "1234"
}
```

**Validation Rules:**
- Name must be 1-20 characters
- Name must contain at least 1 non-whitespace character
- **New accounts:** PIN is optional (can be set later via `/api/pin/create`)
- **Existing accounts with PIN:** PIN is **required** for authentication
- **Existing accounts without PIN:** Login allowed, response includes `pin_not_set: true`

**Response (201 Created) - New Account:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Ash",
  "role": "trainer",
  "created_at": "2024-01-01T00:00:00Z",
  "pin_not_set": true
}
```

**Response (200 OK) - Existing Account (PIN verified):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Ash",
  "role": "trainer",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Response (200 OK) - Existing Account (no PIN set):**

```json
{
  "id": "...",
  "name": "Ash",
  "pin_not_set": true
}
```

**Errors:**

- `401 PIN_REQUIRED` - Account has PIN set but none provided
- `401 INVALID_PIN` - Incorrect PIN (includes attempts remaining)
- `423 ACCOUNT_LOCKED` - Too many failed attempts (15 min lockout)

**Note:** This endpoint sets a `trainer_id` cookie (30-day expiration) for session management.

---

#### PUT /api/trainer/{id}/nickname

Set or update the nickname for your starter Pokemon.

**Path Parameters:**

| Parameter | Description |
|-----------|-------------|
| `id` | Your trainer UUID |

**Request Body:**

```json
{
  "nickname": "Sparky"
}
```

**Validation Rules:**
- Nickname must be 1-20 characters
- Send `null` or empty string to clear nickname

**Response (200 OK):**

```json
{
  "id": "uuid",
  "name": "Ash",
  "starter_pokemon_id": 25,
  "starter_pokemon_nickname": "Sparky",
  "starter": {
    "number": 25,
    "name": "Pikachu",
    "types": ["Electric"],
    "sr": 0.45
  }
}
```

---

#### DELETE /api/trainer/{id}/nickname

Clear the nickname from your starter Pokemon.

**Response (200 OK):**

```json
{
  "id": "uuid",
  "name": "Ash",
  "starter_pokemon_id": 25,
  "starter_pokemon_nickname": null,
  "starter": { ... }
}
```

---

### Starter Endpoints

#### GET /api/starter

Returns all Pokemon eligible as starters (SR <= 0.5). **No authentication required.**

**Response (200 OK):**

```json
{
  "starters": [
    {
      "id": 25,
      "name": "Pikachu",
      "types": ["Electric"],
      "sr": 0.45,
      "sprite_url": "/sprites/pikachu.png"
    },
    {
      "id": 1,
      "name": "Bulbasaur",
      "types": ["Grass", "Poison"],
      "sr": 0.3,
      "sprite_url": "/sprites/bulbasaur.png"
    }
  ]
}
```

---

#### POST /api/starter

Select your starter Pokemon. Can only be done once per trainer.

**Request Body:**

```json
{
  "pokemon_id": 25
}
```

**Response (201 Created):**

```json
{
  "pokemon": {
    "id": "uuid",
    "pokemon_id": 25,
    "name": "Pikachu",
    "types": ["Electric"],
    "level": 1,
    "sr": 0.45,
    "is_starter": true,
    "is_active": true,
    "sprite_url": "/sprites/pikachu.png"
  }
}
```

**Errors:**

- `400 INVALID_STARTER` - Pokemon is not available as starter (SR > 0.5)
- `400 ALREADY_HAS_STARTER` - You already have a starter Pokemon

---

### Trainer Endpoints

#### GET /api/external/trainer

Retrieve your trainer information including active Pokemon and statistics.

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `X-API-Key` | Yes | Your API key |

**Response (200 OK):**

```json
{
  "trainer_id": "550e8400-e29b-41d4-a716-446655440000",
  "trainer_name": "Ash",
  "pokemon": {
    "number": 25,
    "name": "Pikachu",
    "types": ["Electric"]
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `trainer_id` | string | Your unique trainer ID (UUID) |
| `trainer_name` | string | Your display name |
| `pokemon` | object/null | Your starter Pokemon, or null if none |

---

#### GET /api/dashboard

Returns aggregated dashboard data including active Pokemon, stats, and battle status.

**Response (200 OK):**

```json
{
  "trainer_name": "Ash",
  "active_pokemon": {
    "id": "uuid-here",
    "pokemon_id": 25,
    "name": "Pikachu",
    "types": ["Electric"],
    "level": 15,
    "sr": 0.42,
    "is_starter": true,
    "is_active": true,
    "selected_moves": ["thunderbolt", "quick-attack", "thunder-wave", "slam"],
    "sprite_url": "/sprites/pikachu.png"
  },
  "pokemon_count": 5,
  "stats": {
    "money": 1000,
    "items": {},
    "battles_won": 12,
    "battles_lost": 3,
    "pokemon_captured": 4
  },
  "has_active_battle": false
}
```

---

### Pokemon Collection Endpoints

#### GET /api/pokecenter

Returns all Pokemon owned by you, including evolution eligibility information.

**Response (200 OK):**

```json
{
  "pokemon": [
    {
      "id": "uuid-here",
      "pokemon_id": 25,
      "name": "Pikachu",
      "types": ["Electric"],
      "level": 5,
      "experience": 12,
      "sr": 0.42,
      "is_starter": true,
      "is_active": true,
      "can_evolve": true,
      "selected_moves": ["thunderbolt", "quick-attack", "thunder-wave", "slam"],
      "sprite_url": "/sprites/pikachu.png",
      "experience_to_next": 4,
      "evolution_info": {
        "canEvolve": true,
        "currentStage": 1,
        "totalStages": 2,
        "evolvesAtLevel": 5,
        "nextEvolutionId": 26,
        "nextEvolutionName": "Raichu"
      }
    }
  ],
  "active_pokemon_id": "uuid-here"
}
```

**Evolution Info Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `can_evolve` | boolean | True if Pokemon is eligible to evolve right now |
| `evolution_info.canEvolve` | boolean | True if Pokemon meets evolution requirements |
| `evolution_info.currentStage` | number | Current evolution stage (1, 2, or 3) |
| `evolution_info.totalStages` | number | Total stages in evolution chain |
| `evolution_info.evolvesAtLevel` | number/null | Level required to evolve, null if final form |
| `evolution_info.nextEvolutionId` | number/null | Pokemon ID after evolution, null if final form |
| `evolution_info.nextEvolutionName` | string/null | Pokemon name after evolution, null if final form |

---

#### POST /api/pokecenter/swap

Changes which Pokemon is currently active for battles.

**Request Body:**

```json
{
  "pokemon_id": "uuid-of-pokemon-to-activate"
}
```

**Response (200 OK):**

```json
{
  "active_pokemon": {
    "id": "uuid-here",
    "pokemon_id": 6,
    "name": "Charizard",
    "types": ["Fire", "Flying"],
    "level": 20,
    "is_active": true
  }
}
```

**Errors:**

- `400 BATTLE_IN_PROGRESS` - Cannot swap during an active battle
- `404 NOT_FOUND` - Pokemon not found or not owned by you

---

#### GET /api/pokedex

Returns all 151 Pokemon with your seen/caught status.

**Response (200 OK):**

```json
{
  "pokedex": [
    {
      "number": 1,
      "name": "Bulbasaur",
      "types": ["Grass", "Poison"],
      "sprite_url": "/sprites/bulbasaur.png",
      "status": "caught"
    },
    {
      "number": 2,
      "name": "Ivysaur",
      "types": ["Grass", "Poison"],
      "sprite_url": "/sprites/ivysaur.png",
      "status": "seen"
    },
    {
      "number": 3,
      "name": "Venusaur",
      "types": ["Grass", "Poison"],
      "sprite_url": "/sprites/venusaur.png",
      "status": "unknown"
    }
  ],
  "stats": {
    "total": 151,
    "caught": 5,
    "seen": 12
  }
}
```

**Status Values:**

| Status | Description |
|--------|-------------|
| `unknown` | Never encountered |
| `seen` | Encountered in battle but not caught |
| `caught` | In your collection |

---

### Evolution Endpoints

#### POST /api/pokecenter/evolve

Evolve a Pokemon to its next evolution form. The Pokemon must have `can_evolve: true` to be eligible.

**Request Body:**

```json
{
  "pokemon_id": "uuid-of-pokemon-to-evolve"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "pokemon": {
    "id": "uuid-here",
    "user_id": "user-uuid",
    "pokemon_id": 26,
    "level": 5,
    "experience": 12,
    "selected_moves": ["thunderbolt", "quick-attack", "thunder-wave", "slam"],
    "is_active": true,
    "is_starter": true,
    "captured_at": "2026-01-10T12:00:00Z",
    "can_evolve": false,
    "name": "Raichu",
    "types": ["Electric"],
    "sr": 5,
    "sprite_url": "/sprites/26.png",
    "experience_to_next": 4,
    "evolution_info": {
      "canEvolve": false,
      "currentStage": 2,
      "totalStages": 2,
      "evolvesAtLevel": null,
      "nextEvolutionId": null,
      "nextEvolutionName": null
    }
  },
  "evolved_from": {
    "pokemon_id": 25,
    "name": "Pikachu"
  },
  "evolved_to": {
    "pokemon_id": 26,
    "name": "Raichu"
  }
}
```

**Errors:**

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | `CANNOT_EVOLVE` | Pokemon is not eligible for evolution |
| 400 | `FINAL_STAGE` | Pokemon is already at its final evolution |
| 401 | `UNAUTHORIZED` | Invalid or missing authentication |
| 404 | `NOT_FOUND` | Pokemon not found or not owned by user |

**Evolution Thresholds:**

| Evolution Chain | Current Stage | Evolves At Level |
|-----------------|---------------|------------------|
| 2-stage (e.g., Pikachu) | Stage 1 | Level 5 |
| 3-stage (e.g., Bulbasaur) | Stage 1 | Level 3 |
| 3-stage (e.g., Ivysaur) | Stage 2 | Level 6 |
| Final stage | Any | Cannot evolve |

**Notes:**

- Evolution preserves: level, experience, selected moves, is_active, is_starter
- After evolution, the Pokemon gains access to its new form's moves via `/api/moves`
- The `can_evolve` flag is automatically set to `true` when a Pokemon levels up past its evolution threshold
- Evolution can be performed at any time from the Pokecenter once eligible
- Evolution can also be triggered immediately after a battle victory if the level-up meets the threshold

---

### Moves Endpoints

#### GET /api/moves

Returns available and selected moves for your active Pokemon.

**Response (200 OK):**

```json
{
  "available_moves": [
    { "id": "thunderbolt", "name": "Thunderbolt", "type": "Electric" },
    { "id": "quick-attack", "name": "Quick Attack", "type": "Normal" },
    { "id": "thunder-wave", "name": "Thunder Wave", "type": "Electric" },
    { "id": "slam", "name": "Slam", "type": "Normal" },
    { "id": "thunder", "name": "Thunder", "type": "Electric" }
  ],
  "selected_moves": ["thunderbolt", "quick-attack", "thunder-wave", "slam"],
  "pokemon_id": "uuid-here",
  "pokemon_level": 15
}
```

---

#### PUT /api/moves

Updates the 4 selected moves for your active Pokemon.

**Request Body:**

```json
{
  "moves": ["thunderbolt", "thunder", "quick-attack", "slam"]
}
```

**Response (200 OK):**

```json
{
  "selected_moves": ["thunderbolt", "thunder", "quick-attack", "slam"]
}
```

**Errors:**

- `400 VALIDATION_ERROR` - Exactly 4 moves must be selected
- `400 INVALID_MOVES` - Some moves are not available to your Pokemon

---

### Zones Endpoints

#### GET /api/zones

Returns all available combat zones. **No authentication required.**

**Response (200 OK):**

```json
{
  "zones": [
    {
      "id": "jungle",
      "name": "Viridian Jungle",
      "description": "A dense forest teeming with Bug and Grass types",
      "types": ["Bug", "Grass"],
      "color": "#22c55e"
    },
    {
      "id": "ocean",
      "name": "Cerulean Ocean",
      "description": "Deep waters home to Water and Ice types",
      "types": ["Water", "Ice"],
      "color": "#3b82f6"
    }
  ]
}
```

---

#### GET /api/zones/{zoneId}/preview

Returns preview information for a zone including Pokemon at each difficulty.

**Path Parameters:**

| Parameter | Description |
|-----------|-------------|
| `zoneId` | Zone identifier (e.g., `jungle`, `ocean`) |

**Response (200 OK):**

```json
{
  "zone": {
    "id": "jungle",
    "name": "Viridian Jungle",
    "types": ["Bug", "Grass"]
  },
  "difficulties": {
    "easy": {
      "description": "Pokemon weaker than yours",
      "example_pokemon": ["Caterpie", "Weedle", "Paras"],
      "pokemon_count": 8
    },
    "medium": {
      "description": "Pokemon at your level",
      "example_pokemon": ["Butterfree", "Beedrill", "Parasect"],
      "pokemon_count": 6
    },
    "hard": {
      "description": "Pokemon stronger than yours",
      "example_pokemon": ["Venusaur", "Victreebel", "Exeggutor"],
      "pokemon_count": 4
    }
  }
}
```

---

### Battle System Endpoints

#### GET /api/battle

Returns your current active battle, or null if none.

**Response (200 OK) - Active Battle:**

```json
{
  "id": "battle-uuid",
  "user_id": "your-uuid",
  "player_pokemon_id": "pokemon-uuid",
  "wild_pokemon": {
    "pokemon_id": 25,
    "name": "Pikachu",
    "level": 12,
    "sr": 0.42,
    "types": ["Electric"],
    "current_hp": 100,
    "sprite_url": "/sprites/pikachu.png"
  },
  "difficulty": "medium",
  "zone": "power-plant",
  "player_wins": 1,
  "wild_wins": 0,
  "capture_attempts": 0,
  "status": "active",
  "seed": "random-seed",
  "created_at": "2026-01-11T12:00:00Z",
  "ended_at": null
}
```

**Response (200 OK) - No Battle:**

```json
null
```

---

#### POST /api/battle

Starts a new battle encounter.

**Request Body (Zone-based):**

```json
{
  "zone_id": "jungle",
  "difficulty": "medium"
}
```

**Difficulty Values:**

| Zone Battles | Description |
|--------------|-------------|
| `easy` | Pokemon weaker than yours |
| `medium` | Pokemon around your level |
| `hard` | Pokemon stronger than yours |

**Response (201 Created):**

```json
{
  "id": "battle-uuid",
  "wild_pokemon": {
    "pokemon_id": 12,
    "name": "Butterfree",
    "level": 15,
    "types": ["Bug", "Flying"]
  },
  "status": "active"
}
```

**Errors:**

- `400 BATTLE_IN_PROGRESS` - You already have an active battle
- `400 NO_ACTIVE_POKEMON` - You need an active Pokemon to battle

---

#### POST /api/battle/round

Executes a single battle round with the specified move.

**Request Body:**

```json
{
  "move_id": "thunderbolt"
}
```

**Response (200 OK):**

```json
{
  "round": {
    "round_number": 1,
    "player_move": "Thunderbolt",
    "winner": "player",
    "roll": 15,
    "dc": 8,
    "base_chance": 0.65,
    "type_effectiveness": "super_effective",
    "had_stab": true
  },
  "battle": {
    "player_wins": 2,
    "wild_wins": 0,
    "status": "active"
  },
  "battle_ended": false
}
```

**When Battle Ends (Victory):**

```json
{
  "round": { ... },
  "battle": {
    "player_wins": 3,
    "wild_wins": 1,
    "status": "player_won"
  },
  "battle_ended": true,
  "experience_gained": {
    "xp_awarded": 150,
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
      "to_id": 2,
      "from_sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
      "to_sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png"
    }
  }
}
```

**Evolution Fields in Experience Gained:**

| Field | Type | Description |
|-------|------|-------------|
| `evolution_available` | boolean | True if Pokemon can now evolve |
| `evolution_details` | object | Present only if `evolution_available` is true |
| `evolution_details.from_name` | string | Current Pokemon name |
| `evolution_details.from_id` | number | Current Pokemon ID |
| `evolution_details.to_name` | string | Evolution target name |
| `evolution_details.to_id` | number | Evolution target Pokemon ID |
| `evolution_details.from_sprite` | string | Current Pokemon sprite URL |
| `evolution_details.to_sprite` | string | Evolution target sprite URL |

When `evolution_available` is true, the client can show an evolution prompt. Call `POST /api/pokecenter/evolve` to perform the evolution.

---

### Capture Endpoints

#### GET /api/capture

Check if you can capture the wild Pokemon and get the capture DC.

**Response (200 OK):**

```json
{
  "dc": 12,
  "can_capture": true,
  "player_wins": 2,
  "wild_pokemon": "Pikachu",
  "already_owned": false,
  "ownership_message": null
}
```

**When Already Owned:**

```json
{
  "dc": 12,
  "can_capture": false,
  "player_wins": 2,
  "wild_pokemon": "Pikachu",
  "already_owned": true,
  "ownership_message": "You already own a Pikachu"
}
```

---

#### POST /api/capture

Attempts to capture the wild Pokemon.

**Response (200 OK) - Success:**

```json
{
  "result": {
    "success": true,
    "roll": 15,
    "dc": 12,
    "fled": false
  },
  "battle": {
    "status": "captured"
  },
  "captured_pokemon": {
    "id": "new-pokemon-uuid",
    "pokemon_id": 25,
    "name": "Pikachu",
    "level": 12
  },
  "experience_gained": {
    "xp_awarded": 1,
    "previous_level": 4,
    "new_level": 5,
    "previous_experience": 15,
    "new_experience": 0,
    "levels_gained": 1,
    "evolution_available": true,
    "evolution_details": {
      "from_name": "Charmander",
      "from_id": 4,
      "to_name": "Charmeleon",
      "to_id": 5,
      "from_sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png",
      "to_sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png"
    }
  }
}
```

The `experience_gained` object may include `evolution_available` and `evolution_details` fields when a capture causes a level-up that reaches an evolution threshold. See the [Battle Round](#post-apibattleround) documentation for evolution field details.

**Response (200 OK) - Failed (Pokemon Fled):**

```json
{
  "result": {
    "success": false,
    "roll": 5,
    "dc": 12,
    "fled": true
  },
  "battle": {
    "status": "fled"
  }
}
```

---

### API Key Endpoints

#### GET /api/secret-key

Returns metadata about your API secret key. **Requires session authentication (cookie).**

**Response (200 OK):**

```json
{
  "has_key": true,
  "created_at": "2024-01-15T10:30:00Z",
  "last_used_at": "2024-01-16T14:22:00Z"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `has_key` | boolean | Whether an API key exists |
| `created_at` | string/null | When the key was created |
| `last_used_at` | string/null | Last time the key was used |

---

#### POST /api/secret-key

Generates a new API secret key. The plaintext key is returned **only once** - save it immediately! Regenerating invalidates any previous key.

**Response (201 Created):**

```json
{
  "key": "sk_live_abc123def456ghi789...",
  "created_at": "2024-01-16T15:00:00Z"
}
```

**Important:** Store this key securely. It cannot be retrieved again.

---

### PIN Security Endpoints

PIN authentication provides an additional security layer for account access.

#### GET /api/pin/status

Returns the PIN status for your account. **Requires session authentication.**

**Response (200 OK):**

```json
{
  "has_pin": true,
  "is_locked": false,
  "is_temporary": false
}
```

**When Account is Locked:**

```json
{
  "has_pin": true,
  "is_locked": true,
  "is_temporary": false,
  "lockout_remaining_seconds": 540
}
```

---

#### POST /api/pin/create

Create or update your 4-digit PIN. **Requires session authentication.**

**Request Body:**

```json
{
  "pin": "1234",
  "confirm_pin": "1234"
}
```

**Validation Rules:**
- PIN must be exactly 4 numeric digits
- `pin` and `confirm_pin` must match

**Response (200 OK):**

```json
{
  "success": true,
  "message": "PIN created successfully"
}
```

**Errors:**

- `400 INVALID_PIN_FORMAT` - PIN must be exactly 4 numeric digits
- `400 PIN_MISMATCH` - PINs do not match

---

#### POST /api/pin/verify

Verify a PIN. After 5 failed attempts, account is locked for 15 minutes.

**Request Body:**

```json
{
  "pin": "1234"
}
```

**Response (200 OK) - Success:**

```json
{
  "valid": true
}
```

**Response (200 OK) - Temporary PIN (must change):**

```json
{
  "valid": true,
  "must_change": true,
  "message": "Your PIN was reset by support. Please create a new PIN."
}
```

**Response (200 OK) - Failed:**

```json
{
  "valid": false,
  "message": "Incorrect PIN. 3 attempts remaining."
}
```

**Response (423 Locked):**

```json
{
  "valid": false,
  "locked": true,
  "lockout_remaining_seconds": 900,
  "message": "Account locked. Try again in 15 minutes."
}
```

---

### Admin Endpoints

These endpoints require admin role. Regular trainers will receive `403 FORBIDDEN`.

#### GET /api/trainers

List all trainers with their statistics and Pokemon counts. **Requires admin role.**

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `X-API-Key` | Yes | Your API key (must belong to an admin) |

**Response (200 OK):**

```json
[
  {
    "id": "uuid",
    "name": "Ash",
    "role": "trainer",
    "starter_pokemon_id": 25,
    "created_at": "2024-01-01T00:00:00Z",
    "starter": {
      "number": 25,
      "name": "Pikachu",
      "types": ["Electric"]
    },
    "stats": {
      "battles_won": 10,
      "battles_lost": 2,
      "pokemon_captured": 5,
      "pokemon_count": 6
    }
  }
]
```

---

#### PATCH /api/trainers/{id}/role

Change a trainer's role between "trainer" and "admin".

**Path Parameters:**

| Parameter | Description |
|-----------|-------------|
| `id` | Target trainer UUID |

**Request Body:**

```json
{
  "role": "admin"
}
```

**Response (200 OK):**

```json
{
  "trainer_id": "uuid",
  "previous_role": "trainer",
  "new_role": "admin",
  "updated_at": "2024-01-16T15:30:00Z"
}
```

**Errors:**

- `400 CANNOT_REMOVE_LAST_ADMIN` - Cannot demote the last admin
- `400 VALIDATION_ERROR` - Role must be 'trainer' or 'admin'

---

#### POST /api/pin/admin/reset

Reset a user's PIN, allowing them to set a new one. **Admin only.**

**Request Body:**

```json
{
  "trainer_id": "uuid-of-trainer"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "PIN has been reset"
}
```

---

#### POST /api/pin/admin/unlock

Unlock an account that was locked due to too many failed PIN attempts. **Admin only.**

**Request Body:**

```json
{
  "trainer_id": "uuid-of-trainer"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Account has been unlocked"
}
```

---

## Error Reference

All errors follow this format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing API key |
| `FORBIDDEN` | 403 | You don't have permission for this action |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `BATTLE_IN_PROGRESS` | 400 | Cannot perform action during battle |
| `NO_ACTIVE_BATTLE` | 400 | No active battle exists |
| `NO_ACTIVE_POKEMON` | 400 | No active Pokemon selected |
| `NO_POKEMON` | 400 | You must select a Pokemon first |
| `INVALID_MOVE` | 400 | Move not available to your Pokemon |
| `INVALID_MOVES` | 400 | One or more moves are invalid |
| `INVALID_STARTER` | 400 | Pokemon is not available as starter |
| `ALREADY_HAS_STARTER` | 400 | You already have a starter Pokemon |
| `CANNOT_EVOLVE` | 400 | Pokemon is not eligible for evolution |
| `FINAL_STAGE` | 400 | Pokemon is already at its final evolution |
| `INVALID_PIN_FORMAT` | 400 | PIN must be exactly 4 numeric digits |
| `PIN_MISMATCH` | 400 | PINs do not match |
| `NO_PIN` | 400 | No PIN set for this account |
| `CANNOT_REMOVE_LAST_ADMIN` | 400 | Cannot demote the last admin |
| `DATABASE_ERROR` | 500 | Server database error |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Code Examples

### curl

```bash
# Get your trainer data
curl -s "https://pokemon-selector-rctq.vercel.app/api/external/trainer" \
  -H "X-API-Key: YOUR_API_KEY"

# Get dashboard
curl -s "https://pokemon-selector-rctq.vercel.app/api/dashboard" \
  -H "X-API-Key: YOUR_API_KEY"

# Start a battle
curl -s -X POST "https://pokemon-selector-rctq.vercel.app/api/battle" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"zone_id": "jungle", "difficulty": "medium"}'

# Execute a battle round
curl -s -X POST "https://pokemon-selector-rctq.vercel.app/api/battle/round" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"move_id": "thunderbolt"}'

# Attempt capture
curl -s -X POST "https://pokemon-selector-rctq.vercel.app/api/capture" \
  -H "X-API-Key: YOUR_API_KEY"

# Get Pokemon with evolution info
curl -s "https://pokemon-selector-rctq.vercel.app/api/pokecenter" \
  -H "X-API-Key: YOUR_API_KEY"

# Evolve a Pokemon
curl -s -X POST "https://pokemon-selector-rctq.vercel.app/api/pokecenter/evolve" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"pokemon_id": "your-pokemon-uuid"}'
```

### Python

```python
import requests

BASE_URL = "https://pokemon-selector-rctq.vercel.app"
API_KEY = "YOUR_API_KEY"

headers = {"X-API-Key": API_KEY}

# Get trainer data
response = requests.get(f"{BASE_URL}/api/external/trainer", headers=headers)
trainer = response.json()
print(f"Trainer: {trainer['trainer_name']}")

# Get dashboard
response = requests.get(f"{BASE_URL}/api/dashboard", headers=headers)
dashboard = response.json()
print(f"Pokemon count: {dashboard['pokemon_count']}")
print(f"Battles won: {dashboard['stats']['battles_won']}")

# Start a battle
response = requests.post(
    f"{BASE_URL}/api/battle",
    headers={**headers, "Content-Type": "application/json"},
    json={"zone_id": "jungle", "difficulty": "medium"}
)
battle = response.json()
print(f"Fighting: {battle['wild_pokemon']['name']}")

# Execute rounds until battle ends
while True:
    # Get moves
    moves_response = requests.get(f"{BASE_URL}/api/moves", headers=headers)
    moves = moves_response.json()
    move_id = moves['selected_moves'][0]

    # Use first move
    round_response = requests.post(
        f"{BASE_URL}/api/battle/round",
        headers={**headers, "Content-Type": "application/json"},
        json={"move_id": move_id}
    )
    result = round_response.json()
    print(f"Round {result['round']['round_number']}: {result['round']['winner']} wins")

    if result['battle_ended']:
        print(f"Battle ended: {result['battle']['status']}")
        break

# Try to capture if we won
if result['battle']['status'] == 'player_won':
    capture_response = requests.post(f"{BASE_URL}/api/capture", headers=headers)
    capture = capture_response.json()
    if capture['result']['success']:
        print(f"Captured {capture['captured_pokemon']['name']}!")
    else:
        print("Capture failed!")
```

### JavaScript

```javascript
const BASE_URL = "https://pokemon-selector-rctq.vercel.app";
const API_KEY = "YOUR_API_KEY";

const headers = {
  "X-API-Key": API_KEY,
  "Content-Type": "application/json"
};

// Get trainer data
async function getTrainer() {
  const response = await fetch(`${BASE_URL}/api/external/trainer`, { headers });
  const trainer = await response.json();
  console.log(`Trainer: ${trainer.trainer_name}`);
  return trainer;
}

// Get dashboard
async function getDashboard() {
  const response = await fetch(`${BASE_URL}/api/dashboard`, { headers });
  const dashboard = await response.json();
  console.log(`Pokemon count: ${dashboard.pokemon_count}`);
  console.log(`Battles won: ${dashboard.stats.battles_won}`);
  return dashboard;
}

// Start a battle
async function startBattle(zoneId, difficulty) {
  const response = await fetch(`${BASE_URL}/api/battle`, {
    method: "POST",
    headers,
    body: JSON.stringify({ zone_id: zoneId, difficulty })
  });
  const battle = await response.json();
  console.log(`Fighting: ${battle.wild_pokemon.name}`);
  return battle;
}

// Execute a battle round
async function executeRound(moveId) {
  const response = await fetch(`${BASE_URL}/api/battle/round`, {
    method: "POST",
    headers,
    body: JSON.stringify({ move_id: moveId })
  });
  return response.json();
}

// Attempt capture
async function attemptCapture() {
  const response = await fetch(`${BASE_URL}/api/capture`, {
    method: "POST",
    headers
  });
  return response.json();
}

// Example: Full battle flow
async function playBattle() {
  await startBattle("jungle", "medium");

  let battleEnded = false;
  while (!battleEnded) {
    const movesResponse = await fetch(`${BASE_URL}/api/moves`, { headers });
    const moves = await movesResponse.json();

    const result = await executeRound(moves.selected_moves[0]);
    console.log(`Round ${result.round.round_number}: ${result.round.winner} wins`);

    battleEnded = result.battle_ended;

    if (battleEnded && result.battle.status === "player_won") {
      const capture = await attemptCapture();
      console.log(capture.result.success ? "Captured!" : "Escaped!");
    }
  }
}

playBattle();
```

---

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| 401 Unauthorized | Invalid API key | Verify your API key is correct and has no extra spaces |
| 401 Unauthorized | Missing API key | Add `X-API-Key` header to your request |
| 404 Not Found | Wrong endpoint | Check the URL matches the documentation |
| 400 No Active Pokemon | No Pokemon selected | Go to Pokecenter and set an active Pokemon |
| 400 Battle In Progress | Already in a battle | Complete or forfeit your current battle first |
| Connection refused | Server down or wrong URL | Verify the base URL with your instructor |

### Common Issues

**"Invalid or missing API key"**
- Make sure you copied the entire key
- Check for extra spaces at the beginning or end
- Generate a new key if the old one was lost

**"No active Pokemon"**
- Log into the web app
- Go to the Pokecenter
- Click on a Pokemon to make it active

**"Cannot swap during battle"**
- You have an active battle
- Win, lose, or capture to end it first

---

## Need Help?

1. Verify you've registered on the Pokemon Starter Selector app
2. Check that your API key is correct
3. Ensure your request format matches the examples
4. Review the error message for specific guidance
5. Contact your instructor if problems persist

---

## OpenAPI Specification

For programmatic access to the API schema, see [openapi.yaml](./openapi.yaml).
