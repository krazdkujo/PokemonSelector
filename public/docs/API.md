# Pokemon Starter Selector API

Complete API documentation for the Pokemon Starter Selector platform.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Rate Limiting](#rate-limiting)
- [Quick Reference](#quick-reference)
- [Endpoints](#endpoints)
  - [Trainer](#trainer-endpoints)
  - [Pokemon Collection](#pokemon-collection-endpoints)
  - [Moves](#moves-endpoints)
  - [Zones](#zones-endpoints)
  - [Battle System](#battle-system-endpoints)
  - [Capture](#capture-endpoints)
- [Error Reference](#error-reference)
- [Code Examples](#code-examples)
- [Troubleshooting](#troubleshooting)

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
curl -H "X-API-Key: YOUR_API_KEY" https://your-app.vercel.app/api/dashboard
```

---

## Base URL

```
https://your-app.vercel.app
```

*Replace with the actual deployment URL provided by your instructor.*

---

## Rate Limiting

There are currently no rate limits enforced. Please be respectful of server resources and avoid excessive requests.

---

## Quick Reference

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/external/trainer` | GET | Get your trainer data | Yes |
| `/api/dashboard` | GET | Get dashboard overview | Yes |
| `/api/pokecenter` | GET | List your Pokemon | Yes |
| `/api/pokecenter/swap` | POST | Change active Pokemon | Yes |
| `/api/pokedex` | GET | Get Pokedex progress | Yes |
| `/api/moves` | GET | Get available moves | Yes |
| `/api/moves` | PUT | Update selected moves | Yes |
| `/api/zones` | GET | List combat zones | No |
| `/api/zones/{id}/preview` | GET | Preview zone encounters | Yes |
| `/api/battle` | GET | Get active battle | Yes |
| `/api/battle` | POST | Start a battle | Yes |
| `/api/battle/round` | POST | Execute battle round | Yes |
| `/api/capture` | GET | Check capture eligibility | Yes |
| `/api/capture` | POST | Attempt capture | Yes |

---

## Endpoints

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

Returns all Pokemon owned by you.

**Response (200 OK):**

```json
{
  "pokemon": [
    {
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
    }
  ],
  "active_pokemon_id": "uuid-here"
}
```

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
    "previous_level": 15,
    "new_level": 16,
    "previous_experience": 2800,
    "new_experience": 2950,
    "levels_gained": 1
  }
}
```

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
    "xp_awarded": 200,
    "previous_level": 15,
    "new_level": 15,
    "levels_gained": 0
  }
}
```

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
| `INVALID_MOVE` | 400 | Move not available to your Pokemon |
| `INVALID_MOVES` | 400 | One or more moves are invalid |
| `DATABASE_ERROR` | 500 | Server database error |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Code Examples

### curl

```bash
# Get your trainer data
curl -s "https://your-app.vercel.app/api/external/trainer" \
  -H "X-API-Key: YOUR_API_KEY"

# Get dashboard
curl -s "https://your-app.vercel.app/api/dashboard" \
  -H "X-API-Key: YOUR_API_KEY"

# Start a battle
curl -s -X POST "https://your-app.vercel.app/api/battle" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"zone_id": "jungle", "difficulty": "medium"}'

# Execute a battle round
curl -s -X POST "https://your-app.vercel.app/api/battle/round" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"move_id": "thunderbolt"}'

# Attempt capture
curl -s -X POST "https://your-app.vercel.app/api/capture" \
  -H "X-API-Key: YOUR_API_KEY"
```

### Python

```python
import requests

BASE_URL = "https://your-app.vercel.app"
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
const BASE_URL = "https://your-app.vercel.app";
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
