# Research: Combat System Refinement

**Feature**: 008-combat-refinement
**Date**: 2026-01-11

## Overview

This feature refines the existing battle system with UI/UX improvements and a capture restriction. No new technologies or external dependencies are required.

## Research Tasks

### 1. DC Display Before Roll

**Decision**: Compute DC on move selection, display before revealing roll result

**Rationale**:
- DC is already calculated in `src/lib/battle.ts:resolveRound()` using formula: `DC = 21 - (winChance * 20)`
- The `calculateRoundWinChance()` function returns all factors needed to compute DC client-side
- Current implementation already returns DC in the round result response

**Implementation Approach**:
- Add a "preview DC" API endpoint or compute DC client-side before selecting move
- Show DC prominently in BattleArena before roll animation/reveal
- Sequence: Select move -> Show DC -> Animate roll -> Show result

**Alternatives Considered**:
- Client-side DC calculation: Rejected because it requires exposing SR/level calculations to client
- Separate DC preview endpoint: More API calls but cleaner separation
- **Selected**: Include DC preview in move selection hover or compute on move click before roll reveal

### 2. Post-Battle XP Display

**Decision**: Create PostBattleScreen component showing XP progression

**Rationale**:
- `ExperienceGained` type already exists in `src/lib/types.ts` with all needed fields
- Battle round API already returns `experience_gained` object on battle end
- Fields available: `xp_awarded`, `previous_level`, `new_level`, `previous_experience`, `new_experience`, `levels_gained`

**Implementation Approach**:
- Create `PostBattleScreen.tsx` component
- Display: Previous XP -> XP Gained -> New XP total
- Include XP progress bar animation
- Transition from battle end to post-battle screen

**Alternatives Considered**:
- Inline XP display in battle end screen: Less impactful, harder to add level-up celebration
- **Selected**: Dedicated component with rich display for better UX

### 3. Level-Up Notification

**Decision**: Conditional level-up celebration in PostBattleScreen

**Rationale**:
- `levels_gained` field in `ExperienceGained` tracks if level-up occurred
- Max level handling exists in `src/lib/experience.ts` (MAX_LEVEL = 10)
- Multi-level gains possible and should be displayed as range

**Implementation Approach**:
- Check `levels_gained > 0` in PostBattleScreen
- Display prominent level-up banner: "Level X -> Level Y!"
- Handle max level case: "MAX LEVEL REACHED!"
- Handle multi-level: "Level 3 -> Level 5!"

**Alternatives Considered**:
- Separate level-up modal: Adds complexity, interrupts flow
- **Selected**: Integrated into PostBattleScreen for smooth progression display

### 4. Capture Restriction for Owned Species

**Decision**: Check `pokemon_owned` table for species before allowing capture

**Rationale**:
- `pokemon_owned` table has `pokemon_id` field (species ID, not instance ID)
- Ownership check should be by species (pokemon_id), not by instance
- Check should happen both at capture attempt and when displaying capture button

**Implementation Approach**:
- API: In `/api/capture`, query `pokemon_owned` for matching `pokemon_id` and `user_id`
- API: Return clear error if species already owned
- UI: In battle page, check ownership before showing capture button
- UI: Show tooltip "Already caught - can only knock out" if disabled

**Query Pattern**:
```sql
SELECT 1 FROM pokemon_owned
WHERE user_id = $1 AND pokemon_id = $2
LIMIT 1
```

**Alternatives Considered**:
- Client-side only check: Rejected - must enforce server-side
- Pokedex table check: Rejected - ownership is source of truth
- **Selected**: Server-side check with UI indicator for immediate feedback

## Dependencies

### Existing Code Reuse

| Component | Location | Reuse Type |
|-----------|----------|------------|
| DC Calculation | `src/lib/battle.ts:calculateRoundWinChance()` | Direct use |
| XP Types | `src/lib/types.ts:ExperienceGained` | Direct use |
| XP Calculation | `src/lib/experience.ts` | Direct use |
| Battle API | `src/app/api/battle/round/route.ts` | Extend response |
| Capture API | `src/app/api/capture/route.ts` | Add ownership check |
| Battle UI | `src/app/battle/page.tsx` | Extend with new screens |

### Feature Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| 007-experience-leveling | Implemented | XP system is fully functional |
| 006-combat-zones | Implemented | Battle system is operational |

## Conclusion

No new research needed - all functionality can be built using existing patterns and APIs. The feature is primarily UI/UX focused with one server-side validation addition (capture restriction).
