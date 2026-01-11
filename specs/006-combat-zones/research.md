# Research: Combat Zone Selection with Difficulty Levels

**Feature Branch**: `006-combat-zones`
**Date**: 2026-01-11

## Research Tasks

### 1. Pokemon Type Distribution Analysis

**Decision**: Eight zones designed to cover all 17 types with adequate Pokemon variety.

**Rationale**: Analysis of `pokemon-cleaned.json` shows uneven type distribution:
- High availability (10+): Poison (33), Water (32), Normal (22), Flying (19), Grass (14), Ground (14), Psychic (14), Fire (12), Bug (12), Rock (11)
- Medium availability (5-9): Electric (9), Fighting (8), Fairy (5), Ice (5)
- Low availability (2-4): Ghost (3), Dragon (3), Steel (2)

Zone type assignments balance coverage with availability:

| Zone | Types | Pokemon Count (approx) |
|------|-------|----------------------|
| Jungle | Bug, Grass, Poison | 12 + 14 + 33 = ~40 (some overlap) |
| Ocean | Water, Flying, Normal | 32 + 19 + 22 = ~50 (some overlap) |
| Volcano | Fire, Rock, Ground | 12 + 11 + 14 = ~30 |
| Power Plant | Electric, Steel, Normal | 9 + 2 + 22 = ~30 |
| Haunted Tower | Ghost, Psychic, Poison | 3 + 14 + 33 = ~35 |
| Frozen Cave | Ice, Rock, Ground | 5 + 11 + 14 = ~25 |
| Dojo | Fighting, Normal, Flying | 8 + 22 + 19 = ~35 |
| Dragon Shrine | Dragon, Fairy, Psychic | 3 + 5 + 14 = ~18 |

**Alternatives considered**:
- 5 zones (original request): Would not cover all types adequately, especially Ghost, Dragon, Ice
- 6 zones: Still leaves gaps in Fighting and Fairy coverage
- Type-exclusive zones: Would leave some zones with only 2-5 Pokemon options

### 2. Difficulty System Design

**Decision**: Use new difficulty definitions from spec, replacing existing `easy`, `normal`, `difficult` with `easy`, `medium`, `hard`.

**Rationale**: The spec defines clear, measurable parameters:
- **Easy**: Max +2 SR, same level or lower
- **Medium**: Max +5 SR, +0 to +3 levels
- **Hard**: Any SR, +4 to +6 levels

Current system uses:
- `easy`: -2 to 0 level, SR 0-2
- `normal`: -1 to +1 level, SR 0-5
- `difficult`: 0 to +2 level, SR 2-10

The new system is more challenging at higher difficulties and clearer for users.

**Migration approach**: Add new difficulty type `ZoneDifficulty` (`easy`, `medium`, `hard`) and new generation function `generateZoneWildPokemon()` that:
1. Filters by zone types
2. Filters by SR constraints
3. Calculates level based on difficulty

**Alternatives considered**:
- Modify existing `BattleDifficulty` type: Would break backward compatibility
- Keep both systems running: More complex, but allows gradual migration

### 3. Zone-Based Pokemon Filtering

**Decision**: Filter Pokemon by type match (primary or secondary type) then by difficulty constraints.

**Rationale**: Pokemon can have one or two types. A Pokemon matches a zone if ANY of its types are in the zone's type list.

Example: Bulbasaur (Grass/Poison) matches both Jungle (Bug/Grass/Poison) and Haunted Tower (Ghost/Psychic/Poison).

**Algorithm**:
```
1. Get zone type list (e.g., ["bug", "grass", "poison"])
2. Filter all Pokemon where p.type includes any zone type
3. Filter by difficulty SR constraints
4. Select random Pokemon from remaining pool
5. Calculate level based on difficulty and player level
```

**Alternatives considered**:
- Primary type only: Would exclude many Pokemon from zones
- Weighted by type match count: Adds complexity without clear benefit

### 4. UI/UX Pattern

**Decision**: Two-step selection flow (Zone -> Difficulty) before battle starts.

**Rationale**: Matches the spec's user stories. Clear separation of concerns:
1. Zone selection: Visual cards with theme, types, and example Pokemon
2. Difficulty selection: Clear descriptions of SR/level constraints

**Implementation approach**:
1. Create `ZoneSelector` component for step 1
2. Reuse existing difficulty buttons for step 2 with updated labels
3. Single API call to start battle with both `zone` and `difficulty` parameters

**Alternatives considered**:
- Combined zone/difficulty selection: Would be cluttered (8 zones x 3 difficulties = 24 options)
- Dropdown instead of cards: Less visually engaging for zone selection

### 5. Fallback Handling

**Decision**: Expand search criteria progressively if no Pokemon match zone/difficulty criteria.

**Rationale**: The spec requires FR-009 - system must provide fallback.

**Fallback order**:
1. Match zone types + difficulty SR/level
2. Match zone types only (relax SR/level)
3. Match any Pokemon (if zone has no matches at all)

**Alternatives considered**:
- Show error to user: Poor UX
- Disable difficulty options that have no matches: Adds complexity, may confuse users

## Summary

All research complete. Key findings:
- 8 zones provide adequate type coverage despite uneven distribution
- New difficulty system with clear SR/level constraints
- Two-step selection flow (Zone -> Difficulty)
- Progressive fallback for edge cases
- Backward-compatible implementation (add new functions, don't modify old ones)
