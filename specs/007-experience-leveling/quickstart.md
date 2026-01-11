# Quickstart: Experience and Leveling System

**Feature**: 007-experience-leveling
**Date**: 2026-01-11

## Prerequisites

- Node.js 18+
- Supabase project with existing schema
- Environment variables configured (`.env.local`)

## Setup Steps

### 1. Run Database Migration

```bash
npm run db:migrate
```

This applies `sql/010_add_experience.sql` which adds the `experience` column to `pokemon_owned`.

### 2. Verify Migration

```bash
npm run db:status
```

Confirm migration `010_add_experience` shows as applied.

### 3. Start Development Server

```bash
npm run dev
```

## Testing the Feature

### Experience Gain

1. Navigate to the Battle page
2. Start a battle in any zone
3. Win the battle (3 round victories)
4. Observe the XP gained notification
5. Check dashboard/pokecenter for updated XP display

### Level Up

1. Continue winning battles until XP threshold is met
2. Level thresholds:
   - Level 1->2: 12 XP
   - Level 2->3: 14 XP
   - Level 3->4: 16 XP
   - etc.
3. Verify level increases and XP resets

### Move Selector Fix

1. Navigate to Pokecenter
2. Open move selector for any Pokemon
3. Verify ALL moves are shown regardless of level
4. Select any 4 moves and save

## Key Files Modified

| File | Change |
|------|--------|
| `sql/010_add_experience.sql` | NEW - migration |
| `src/lib/experience.ts` | NEW - XP utilities |
| `src/lib/types.ts` | Add experience field |
| `src/lib/moves.ts` | Remove level filtering |
| `src/app/api/battle/round/route.ts` | Add XP grant on victory |
| `src/app/api/moves/route.ts` | Use updated moves lib |
| `src/components/PokemonCard.tsx` | Display XP progress |

## Formulas Reference

**Experience Gained**:
```
XP = max(1, wildPokemonLevel - playerPokemonLevel)
```

**Level Threshold**:
```
Required XP = (currentLevel * 2) + 10
```

## Troubleshooting

### "experience column doesn't exist"
Run `npm run db:migrate` to apply the schema change.

### Moves not showing
Clear browser cache and refresh. The API now returns all moves.

### XP not updating
Check browser console for API errors. Ensure the battle ends with `status: 'player_won'`.
