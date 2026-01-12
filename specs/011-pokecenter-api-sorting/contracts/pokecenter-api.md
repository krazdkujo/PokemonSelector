# Pokecenter API Contract

**Endpoint**: `GET /api/pokecenter`
**Authentication**: Required (X-API-Key header or session cookie)

## Request

No request body required.

## Response

```json
{
  "pokemon": [
    {
      "id": "uuid",
      "pokemon_id": 25,
      "name": "Pikachu",
      "types": ["Electric"],
      "level": 15,
      "sr": 0.42,
      "is_starter": true,
      "is_active": true,
      "selected_moves": ["thunderbolt", "quick-attack", "thunder-wave", "slam"],
      "sprite_url": "/sprites/pikachu.png",
      "experience_to_next": 150
    }
  ],
  "active_pokemon_id": "uuid-here"
}
```

## Sorting Behavior (Updated)

The `pokemon` array is ordered by **capture date descending** (most recently caught first).

| Field | Order |
|-------|-------|
| captured_at | DESC (newest first) |

## Change Summary

| Before | After |
|--------|-------|
| `ORDER BY captured_at ASC` | `ORDER BY captured_at DESC` |
| Oldest Pokemon first | Newest Pokemon first |
