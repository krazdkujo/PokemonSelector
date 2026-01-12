# Research: Pokemon Evolution System

**Date**: 2026-01-11
**Feature**: 012-pokemon-evolution

## Research Tasks

### 1. Evolution Chain Data Structure

**Finding**: Pokemon data in `docs/pokemon-cleaned.json` contains `evolution` field with format "Stage X of Y" (e.g., "Stage 1 of 3", "Stage 2 of 2").

**Decision**: Parse evolution stage from existing data. Use Pokemon number proximity for evolution chain mapping (Gen 1 evolutions are sequential: Bulbasaur=1 -> Ivysaur=2 -> Venusaur=3).

**Rationale**: The existing `getPreEvolution()` function in `src/lib/moves.ts` already uses this pattern for move inheritance. We can create a complementary `getNextEvolution()` function.

**Alternatives Considered**:
- Create a separate evolution map JSON - rejected (data already exists)
- Store evolution chains in database - rejected (static data, follows "Single Source of Truth" principle)

### 2. Evolution Threshold Calculation

**Finding**: User clarified thresholds:
- 2-stage Pokemon (Stage 1 of 2): Evolve at level 5
- 3-stage Pokemon (Stage 1 of 3): First evolution at level 3
- 3-stage Pokemon (Stage 2 of 3): Second evolution at level 6

**Decision**: Create `getEvolutionThreshold(stage: number, totalStages: number): number | null` function.

**Rationale**: Simple lookup based on evolution chain length and current stage.

```typescript
function getEvolutionThreshold(stage: number, totalStages: number): number | null {
  if (stage >= totalStages) return null; // Already final form
  if (totalStages === 1) return null; // No evolution
  if (totalStages === 2) return 5; // 2-stage: evolve at 5
  if (totalStages === 3) {
    if (stage === 1) return 3; // First evolution at 3
    if (stage === 2) return 6; // Second evolution at 6
  }
  return null;
}
```

### 3. Database Schema for Evolution Eligibility

**Finding**: The `pokemon_owned` table currently has: `id`, `user_id`, `pokemon_id`, `level`, `experience`, `selected_moves`, `is_active`, `is_starter`, `captured_at`.

**Decision**: Add `can_evolve: boolean` column to `pokemon_owned` table. Set to `true` when Pokemon reaches evolution threshold and hasn't evolved yet.

**Rationale**:
- Simple flag avoids recalculating eligibility on every read
- Flag is set on level-up, cleared on evolution
- No need to track "deferred" separately - eligibility persists until evolved

**Alternatives Considered**:
- Calculate eligibility on-the-fly - rejected (requires loading Pokemon JSON data for every query)
- Store evolution history - rejected (over-engineering, we just need current eligibility)

### 4. Evolution API Design

**Finding**: Existing patterns use POST for state changes (e.g., `/api/pokecenter/swap`, `/api/capture`).

**Decision**: Create `POST /api/pokecenter/evolve` endpoint:
- Request: `{ pokemon_id: string }` (the owned Pokemon record ID)
- Response: Updated Pokemon object with new species data
- Validation: Verify ownership, check `can_evolve` flag, verify not final stage

**Rationale**: Follows existing API patterns, simple single-action endpoint.

### 5. Post-Battle Evolution Trigger

**Finding**: Battle round endpoint (`/api/battle/round`) already returns `experience_gained` with `levels_gained` field. The capture endpoint returns similar data.

**Decision**: Extend response to include `evolution_available: boolean` and `evolution_details: { from: string, to: string }` when a level-up crosses an evolution threshold.

**Rationale**: Client can use this to show evolution prompt. Actual evolution is a separate action.

### 6. Move Inheritance After Evolution

**Finding**: The existing `getAvailableMoves()` function in `src/lib/moves.ts` already handles move inheritance from pre-evolutions. It collects moves from all tiers and pre-evolution forms.

**Decision**: After evolution, moves remain unchanged. The new evolved Pokemon will automatically have access to its new moves via `getAvailableMoves()` since that function looks up the Pokemon by `pokemon_id`.

**Rationale**: No special handling needed - the move system already supports this by design.

### 7. UI Components

**Finding**: Existing battle page uses modals/dialogs for prompts (victory, capture, etc.).

**Decision**: Create `EvolutionModal` component that:
- Shows current Pokemon sprite and name
- Shows evolved Pokemon sprite and name
- Provides "Evolve" and "Later" buttons
- Triggers evolution API on confirm

**Rationale**: Consistent with existing UI patterns.

## Summary

| Component | Decision | Complexity |
|-----------|----------|------------|
| Evolution data | Parse from existing JSON | Low |
| Threshold logic | Simple function | Low |
| Database | Add `can_evolve` column | Low |
| API | Single POST endpoint | Low |
| Battle integration | Extend response | Low |
| Move handling | Already works | None |
| UI | New modal component | Medium |

No NEEDS CLARIFICATION items - all decisions made based on user input and existing patterns.
