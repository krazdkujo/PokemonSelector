# Pokemon Starter Selector API

## Overview

This API allows you to retrieve your trainer information, including your unique trainer ID and your selected starter Pokemon.

## Base URL

```
https://your-app.vercel.app
```

*Your instructor will provide the actual URL.*

## Authentication

All requests require an API key provided by your instructor. Include it in the `X-API-Key` header.

---

## Get Your Trainer Data

Retrieve your trainer ID and Pokemon information.

### Endpoint

```
GET /api/external/trainer
```

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `X-API-Key` | Yes | Secret key provided by your instructor |
| `X-Trainer-Name` | Yes | Your trainer name (case-insensitive) |

### Example Request

**Using curl:**

```bash
curl -X GET "https://your-app.vercel.app/api/external/trainer" \
  -H "X-API-Key: YOUR_SECRET_KEY" \
  -H "X-Trainer-Name: YourName"
```

**Using Python:**

```python
import requests

response = requests.get(
    "https://your-app.vercel.app/api/external/trainer",
    headers={
        "X-API-Key": "YOUR_SECRET_KEY",
        "X-Trainer-Name": "YourName"
    }
)

data = response.json()
print(f"Trainer ID: {data['trainer_id']}")
print(f"Trainer Name: {data['trainer_name']}")

if data['pokemon']:
    print(f"Pokemon: {data['pokemon']['name']}")
    print(f"Number: {data['pokemon']['number']}")
    print(f"Types: {', '.join(data['pokemon']['types'])}")
else:
    print("No Pokemon selected yet")
```

**Using JavaScript:**

```javascript
const response = await fetch("https://your-app.vercel.app/api/external/trainer", {
  headers: {
    "X-API-Key": "YOUR_SECRET_KEY",
    "X-Trainer-Name": "YourName"
  }
});

const data = await response.json();
console.log("Trainer ID:", data.trainer_id);
console.log("Pokemon:", data.pokemon?.name ?? "None selected");
```

---

## Response Format

### Success Response (200 OK)

**With Pokemon selected:**

```json
{
  "trainer_id": "550e8400-e29b-41d4-a716-446655440000",
  "trainer_name": "Ash",
  "pokemon": {
    "uuid": "7f3b8c2a-1234-5678-9abc-def012345678",
    "number": 25,
    "name": "Pikachu",
    "types": ["Electric"]
  }
}
```

**Without Pokemon selected:**

```json
{
  "trainer_id": "550e8400-e29b-41d4-a716-446655440001",
  "trainer_name": "Gary",
  "pokemon": null
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `trainer_id` | string | Your unique trainer ID (UUID format) |
| `trainer_name` | string | Your display name |
| `pokemon` | object or null | Your selected Pokemon, or null if none selected |
| `pokemon.uuid` | string | Your Pokemon's unique instance ID (UUID format) |
| `pokemon.number` | integer | Pokemon national dex number (1-151) |
| `pokemon.name` | string | Pokemon name |
| `pokemon.types` | array | List of Pokemon types (e.g., ["Fire"], ["Water", "Ice"]) |

---

## Error Responses

### 400 Bad Request

Missing trainer name header.

```json
{
  "error": "BAD_REQUEST",
  "message": "X-Trainer-Name header is required"
}
```

### 401 Unauthorized

Invalid or missing API key.

```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid or missing API key"
}
```

### 404 Not Found

No trainer found with that name.

```json
{
  "error": "TRAINER_NOT_FOUND",
  "message": "No trainer found with that name"
}
```

### 500 Internal Server Error

Something went wrong on the server.

```json
{
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred"
}
```

---

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| 401 Unauthorized | Wrong or missing API key | Double-check the `X-API-Key` header matches exactly what your instructor provided |
| 404 Not Found | Trainer name doesn't exist | Verify you registered on the app and check spelling (case doesn't matter) |
| 400 Bad Request | Missing trainer name | Add the `X-Trainer-Name` header to your request |
| Connection refused | Wrong URL | Confirm the base URL with your instructor |

---

## Quick Reference

```bash
# One-liner to get your trainer data
curl -s "https://your-app.vercel.app/api/external/trainer" \
  -H "X-API-Key: YOUR_KEY" \
  -H "X-Trainer-Name: YOUR_NAME" | python -m json.tool
```

---

## Need Help?

1. Make sure you've registered on the Pokemon Starter Selector app first
2. Verify your trainer name matches exactly (spelling matters, case doesn't)
3. Check that your API key is correct (no extra spaces)
4. Contact your instructor if problems persist
