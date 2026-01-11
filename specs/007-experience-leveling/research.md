# Research: Experience and Leveling System

**Feature**: 007-experience-leveling
**Date**: 2026-01-11

## Overview

This document captures research findings and design decisions for implementing the experience and leveling system.

## Research Tasks

### 1. Experience Formula Design

**Decision**: Use `max(1, wildPokemonLevel - playerPokemonLevel)` for experience gained.

**Rationale**:
- Rewards players for defeating higher-level opponents
- Guarantees minimum 1 XP per victory (no zero-gain scenarios)
- Simple and predictable for players
- Encourages challenging battles over grinding low-level opponents

**Alternatives Considered**:
- Flat XP per battle: Rejected - no incentive to fight challenging opponents
- Percentage-based on wild Pokemon stats: Rejected - overly complex for scope
- Wild Pokemon SR-based XP: Rejected - SR already affects battle difficulty; double-dipping

### 2. Leveling Curve Design

**Decision**: Use `(currentLevel * 2) + 10` for experience required to level up.

**Rationale**:
- Creates a gentle curve that increases with level
- Level 1->2: 12 XP (manageable for beginners)
- Level 5->6: 20 XP (mid-game)
- Level 9->10: 28 XP (requires commitment)
- Formula is easy to understand and communicate to players

**Level Threshold Table**:

| Level | XP Required | Cumulative XP |
|-------|-------------|---------------|
| 1->2  | 12          | 12            |
| 2->3  | 14          | 26            |
| 3->4  | 16          | 42            |
| 4->5  | 18          | 60            |
| 5->6  | 20          | 80            |
| 6->7  | 22          | 102           |
| 7->8  | 24          | 126           |
| 8->9  | 26          | 152           |
| 9->10 | 28          | 180           |

### 3. Database Schema Extension

**Decision**: Add `experience INTEGER DEFAULT 0` column to `pokemon_owned` table.

**Rationale**:
- Minimal schema change - single column addition
- INTEGER type matches level field
- DEFAULT 0 handles existing records automatically
- No new tables required

**Alternatives Considered**:
- Separate `pokemon_experience` table: Rejected - unnecessary normalization for 1:1 relationship
- Store in JSONB `stats` field: Rejected - experience needs direct querying for level-up logic

### 4. Experience Carryover Behavior

**Decision**: Excess experience carries over after level-up.

**Rationale**:
- Players should not lose progress from large XP gains
- Supports multiple level-ups in single battle outcome
- Standard RPG behavior that players expect

**Example**: Level 1 Pokemon (needs 12 XP) gains 15 XP -> Levels to 2 with 3 XP remaining.

### 5. Level-Up Timing

**Decision**: Apply experience and level-ups at battle end (status = 'player_won').

**Rationale**:
- Battle calculations should use entry-level stats
- Simplifies round-by-round logic
- Matches existing pattern of updating stats at battle conclusion

**Implementation Point**: Modify `src/app/api/battle/round/route.ts` in the section where `newStatus === 'player_won'`.

### 6. Move Selector Fix Approach

**Decision**: Modify `getAvailableMoves()` to return ALL moves regardless of level.

**Rationale**:
- Single function change in `src/lib/moves.ts`
- Remove `LEVEL_TO_MOVE_TIER` level-based filtering
- Preserve pre-evolution move inheritance logic
- API validation in `validateSelectedMoves()` should also ignore level

**Files to Modify**:
- `src/lib/moves.ts`: Remove level filtering in `collectMoveIds()` and `getAvailableMoves()`
- `src/app/api/moves/route.ts`: No changes needed (uses lib functions)

### 7. UI Display Patterns

**Decision**: Display XP as progress bar with "X / Y XP" format.

**Rationale**:
- Visual progress indicator motivates players
- Numeric values provide exact information
- For level 10 (max), show "MAX LEVEL" indicator

**Display Locations**:
- Dashboard: Active Pokemon card
- Pokecenter: Pokemon list/details

## Findings Summary

All research tasks resolved with clear decisions. No NEEDS CLARIFICATION items remain.

| Topic | Decision | Impact |
|-------|----------|--------|
| XP Formula | max(1, wildLevel - playerLevel) | Simple, rewards challenge |
| Level Curve | (level * 2) + 10 | Gentle progression |
| Storage | `experience` column in pokemon_owned | Minimal schema change |
| Carryover | Excess XP carries over | Standard RPG behavior |
| Timing | Apply at battle end | Consistent with existing patterns |
| Move Fix | Remove level filter | Single lib function change |
| UI | Progress bar + numeric | Clear player feedback |
