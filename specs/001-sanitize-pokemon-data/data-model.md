# Data Model: Sanitize Pokemon Data

**Feature**: 001-sanitize-pokemon-data
**Date**: 2026-01-07

## Entities

### Pokemon (Sanitized)

A minimal representation of a Pokemon for the starter selector UI.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name (e.g., "Bulbasaur") |
| `number` | integer | Yes | Pokedex number (1-151) |
| `sprites` | Sprites | Yes | Image URLs object |

### Sprites

Image URLs for displaying the Pokemon.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `main` | string (URL) | Yes | Official artwork (high-res) from PokeAPI |
| `sprite` | string (URL) | Yes | Small sprite image from PokeAPI |

## TypeScript Interfaces

```typescript
interface Sprites {
  main: string;    // Official artwork URL
  sprite: string;  // Small sprite URL
}

interface Pokemon {
  name: string;    // Display name
  number: number;  // Pokedex number (1-151)
  sprites: Sprites;
}

// The sanitized file is an array of Pokemon
type PokemonData = Pokemon[];
```

## Validation Rules

1. **Array Length**: Output MUST contain exactly 151 entries
2. **Number Range**: Each `number` MUST be between 1 and 151 inclusive
3. **Uniqueness**: Each `number` MUST appear exactly once
4. **Ordering**: Array MUST be sorted by `number` ascending (1, 2, 3, ... 151)
5. **URL Format**: All URLs MUST be valid HTTPS URLs pointing to PokeAPI sprites
6. **Required Fields**: All fields are required; no null/undefined allowed

## Sample Output

```json
[
  {
    "name": "Bulbasaur",
    "number": 1,
    "sprites": {
      "main": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
      "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
    }
  },
  {
    "name": "Ivysaur",
    "number": 2,
    "sprites": {
      "main": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png",
      "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png"
    }
  },
  ...
  {
    "name": "Mew",
    "number": 151,
    "sprites": {
      "main": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png",
      "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png"
    }
  }
]
```

## Relationships

This is a standalone data file with no database relationships.
The `number` field serves as the unique identifier for joining with
the `starters` table's `pokemon_id` column (defined in Constitution).
