# Research: Sanitize Pokemon Data

**Feature**: 001-sanitize-pokemon-data
**Date**: 2026-01-07

## Research Summary

This feature is a straightforward JSON transformation with no significant unknowns.
All clarifications were resolved during the `/speckit.clarify` phase.

## Decisions Made

### 1. Image Source

**Decision**: Use PokeAPI sprites (existing source in data)
**Rationale**: The poke5e project (referenced by user) uses the same PokeAPI sprite URLs.
No custom image hosting needed.
**Alternatives Considered**:
- Host images locally: Rejected (unnecessary complexity, larger bundle)
- Use different CDN: Rejected (PokeAPI is reliable and free)

### 2. Shiny Variants

**Decision**: Exclude shiny image variants (`mainShiny`, `spriteShiny`)
**Rationale**: User explicitly requested non-shiny only. Reduces data size further.
**Alternatives Considered**:
- Include all variants: Rejected (user requirement)
- Make configurable: Rejected (YAGNI - not needed for starter selector)

### 3. Output File Location

**Decision**: Create `pokemon/pokemon-sanitized.json` alongside original
**Rationale**: Preserves original data for reference; clear naming distinguishes files.
**Alternatives Considered**:
- Replace original: Rejected (destructive, loses source data)
- Different directory: Rejected (keeps Pokemon data together)

### 4. Script Implementation

**Decision**: TypeScript/Node.js one-time script in `/scripts/`
**Rationale**: Matches project's TypeScript stack; simple fs/JSON operations.
**Alternatives Considered**:
- Python script: Rejected (adds Python dependency to JS/TS project)
- Manual edit: Rejected (error-prone for 151 entries)
- Build-time transform: Rejected (one-time operation, not needed on every build)

## Source Data Analysis

**Original File**: `pokemon/pokemon.json`
**Size**: ~3MB
**Total Entries**: 800+ Pokemon (all generations)
**Fields per Entry**: 20+ (id, name, number, type, size, stats, abilities, moves, sprites, etc.)

**Sprites Object Structure** (from source):
```json
{
  "main": "https://raw.githubusercontent.com/PokeAPI/sprites/.../official-artwork/{number}.png",
  "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/.../pokemon/{number}.png",
  "mainShiny": "...",    // EXCLUDE
  "spriteShiny": "..."   // EXCLUDE
}
```

## Output Data Structure

**Target File**: `pokemon/pokemon-sanitized.json`
**Expected Size**: ~50KB (estimated 80%+ reduction)
**Entry Count**: 151 (Gen 1 only)
**Fields per Entry**: 3

```json
{
  "name": "Bulbasaur",
  "number": 1,
  "sprites": {
    "main": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
  }
}
```

## No Further Research Needed

All technical decisions are straightforward. Proceeding to Phase 1 design.
