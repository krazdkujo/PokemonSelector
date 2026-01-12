# Quickstart: Pokemon Evolution System

**Feature**: 012-pokemon-evolution
**Date**: 2026-01-11

## Implementation Steps

### Step 1: Database Migration

Add `can_evolve` column to `pokemon_owned` table:

```sql
ALTER TABLE pokemon_owned
ADD COLUMN can_evolve BOOLEAN DEFAULT false;
```

### Step 2: Create Evolution Library

**File**: `src/lib/evolution.ts`

Create functions:
- `parseEvolutionStage(evolutionString: string): { stage: number, total: number }`
- `getEvolutionThreshold(stage: number, totalStages: number): number | null`
- `getNextEvolution(pokemonId: number): { id: number, name: string } | null`
- `checkEvolutionEligibility(pokemonId: number, level: number): EvolutionInfo`
- `evolve(ownedPokemonId: string, userId: string): Promise<EvolutionResult>`

### Step 3: Create Evolution API Endpoint

**File**: `src/app/api/pokecenter/evolve/route.ts`

- POST handler accepting `{ pokemon_id: string }`
- Validates ownership and eligibility
- Calls evolution library to transform Pokemon
- Returns updated Pokemon data

### Step 4: Modify Battle Round Endpoint

**File**: `src/app/api/battle/round/route.ts`

After applying XP and updating level:
1. Check if new level >= evolution threshold
2. If eligible, set `can_evolve = true` in database
3. Add `evolution_available` and `evolution_details` to response

### Step 5: Modify Capture Endpoint

**File**: `src/app/api/capture/route.ts`

Same as battle round - check evolution eligibility after XP is applied.

### Step 6: Modify Pokecenter API

**File**: `src/app/api/pokecenter/route.ts`

Include `can_evolve` and `evolution_info` in Pokemon response.

### Step 7: Create Evolution Modal Component

**File**: `src/components/EvolutionModal.tsx`

- Display before/after Pokemon sprites and names
- "Evolve" button calls POST /api/pokecenter/evolve
- "Later" button dismisses modal

### Step 8: Add Evolution Prompt to Battle Page

**File**: `src/app/battle/page.tsx`

After battle victory, if `evolution_available` is true in response:
- Show EvolutionModal
- On evolve: call API, update local state
- On later: dismiss modal, continue to Pokecenter

### Step 9: Add Evolve Button to Pokecenter

**File**: `src/app/pokecenter/page.tsx`

For each Pokemon where `can_evolve` is true:
- Display "Evolve" button
- On click: show EvolutionModal
- On evolve: refresh Pokemon list

### Step 10: Add Evolution Types

**File**: `src/lib/types.ts`

Add:
- `EvolutionInfo` interface
- `EvolutionResult` interface
- Extend `ExperienceGained` with evolution fields

## Files Changed Summary

| File | Change Type | Description |
|------|-------------|-------------|
| Database | Migration | Add `can_evolve` column |
| `src/lib/evolution.ts` | New | Evolution logic library |
| `src/lib/types.ts` | Modify | Add evolution types |
| `src/app/api/pokecenter/evolve/route.ts` | New | Evolution endpoint |
| `src/app/api/pokecenter/route.ts` | Modify | Include evolution info |
| `src/app/api/battle/round/route.ts` | Modify | Check evolution eligibility |
| `src/app/api/capture/route.ts` | Modify | Check evolution eligibility |
| `src/components/EvolutionModal.tsx` | New | Evolution UI component |
| `src/app/battle/page.tsx` | Modify | Show evolution prompt |
| `src/app/pokecenter/page.tsx` | Modify | Add evolve buttons |

## Testing Checklist

1. [ ] Create Pokemon at level 2 (for 3-stage) or level 4 (for 2-stage)
2. [ ] Win battle to gain enough XP to level up
3. [ ] Verify evolution prompt appears
4. [ ] Accept evolution and verify Pokemon transforms
5. [ ] Verify moves are preserved
6. [ ] Decline evolution and verify can_evolve flag persists
7. [ ] Visit Pokecenter and verify "Evolve" button appears
8. [ ] Evolve from Pokecenter
9. [ ] Verify final-stage Pokemon shows no evolution option
10. [ ] Verify non-eligible Pokemon shows no evolution option
