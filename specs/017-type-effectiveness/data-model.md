# Data Model: Type Effectiveness Reference

**Feature**: 017-type-effectiveness
**Date**: 2026-01-14

## Overview

Data model for the type effectiveness feature. All data is sourced from existing `src/lib/type-chart.ts`.

---

## Entities

### PokemonType (Existing)

One of 18 Pokemon types used in battle effectiveness calculations.

| Value | Description |
|-------|-------------|
| normal | Normal type |
| fire | Fire type |
| water | Water type |
| electric | Electric type |
| grass | Grass type |
| ice | Ice type |
| fighting | Fighting type |
| poison | Poison type |
| ground | Ground type |
| flying | Flying type |
| psychic | Psychic type |
| bug | Bug type |
| rock | Rock type |
| ghost | Ghost type |
| dragon | Dragon type |
| dark | Dark type |
| steel | Steel type |
| fairy | Fairy type |

---

### TypeData (Existing)

The effectiveness relationships for a single attacking type.

| Field | Type | Description |
|-------|------|-------------|
| strongAgainst | string[] | Types this attack is super effective against (2x damage) |
| weakAgainst | string[] | Types this attack is not very effective against (0.5x damage) |
| immuneTo | string[] | Types that are immune to this attack (0x damage) |

**Source**: `src/lib/type-chart.ts` - `TYPE_CHART` constant

---

### EffectivenessMultiplier

The damage multiplier for a type matchup.

| Value | Meaning | Display |
|-------|---------|---------|
| 0 | Immune | "0x" or "No Effect" |
| 0.5 | Not Very Effective | "0.5x" or "1/2" |
| 1 | Neutral | "1x" or "-" |
| 2 | Super Effective | "2x" |

---

## API Response Types

### TypeListResponse

Response when no type parameter is provided.

```typescript
interface TypeListResponse {
  types: string[];  // All 18 type names
}
```

### TypeEffectivenessResponse

Response for a specific type query.

```typescript
interface TypeEffectivenessResponse {
  type: string;
  strongAgainst: string[];
  weakAgainst: string[];
  immuneTo: string[];
}
```

### TypeErrorResponse

Response for invalid type name.

```typescript
interface TypeErrorResponse {
  error: string;
  message: string;
  availableTypes?: string[];
}
```

---

## Relationships

```
PokemonType (1) ──has──> (1) TypeData
TypeData (1) ──contains──> (N) strongAgainst relationships
TypeData (1) ──contains──> (N) weakAgainst relationships
TypeData (1) ──contains──> (N) immuneTo relationships
```

---

## Data Flow

1. **Grid View**: Import `TYPE_CHART` directly, iterate all types to build 18x18 matrix
2. **Single Type Lookup**: Query `TYPE_CHART[typeName]` for specific type data
3. **API Endpoint**: Same lookup logic, return JSON response

---

## Existing Data Reference

The `TYPE_CHART` in `src/lib/type-chart.ts` contains complete effectiveness data:

```typescript
export const TYPE_CHART: Record<string, TypeData> = {
  fire: {
    strongAgainst: ['grass', 'ice', 'bug', 'steel'],
    weakAgainst: ['fire', 'water', 'rock', 'dragon'],
    immuneTo: [],
  },
  // ... all 18 types defined
};
```

No new data structures needed - feature uses existing data source.
