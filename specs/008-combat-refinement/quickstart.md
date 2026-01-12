# Quickstart: Combat System Refinement

**Feature**: 008-combat-refinement
**Date**: 2026-01-11

## Prerequisites

- Node.js 18+
- Existing Pokemon Selector development environment
- Supabase project configured
- Feature 007-experience-leveling implemented (XP system)

## Setup

No additional setup required. This feature uses existing infrastructure.

```bash
# Start development server
npm run dev
```

## Implementation Order

### Phase 1: Show DC Before Roll (US1 - P1)

1. **Update BattleArena.tsx**
   - Add DC display section before roll reveal
   - Show "DC: X - Roll X+ to win" before executing move
   - After roll, show "Rolled Y: Success/Failure"

2. **Modify battle page flow**
   - On move click: Show DC prominently
   - Animate or delay roll reveal for tension
   - Then show roll result

### Phase 2: Post-Battle XP Display (US2 - P1)

1. **Create PostBattleScreen.tsx**
   ```typescript
   // New component in src/components/
   interface PostBattleScreenProps {
     summary: PostBattleSummary;
     onContinue: () => void;
   }
   ```

2. **Update battle/page.tsx**
   - Import PostBattleScreen component
   - Show PostBattleScreen when battle.status !== 'active'
   - Pass experience_gained data from round response

### Phase 3: Level-Up Notification (US3 - P2)

1. **Enhance PostBattleScreen.tsx**
   - Add conditional level-up banner
   - Check `levels_gained > 0`
   - Display "Level X -> Level Y!" with celebration styling

2. **Handle edge cases**
   - Max level reached: "MAX LEVEL!"
   - Multi-level gains: "Level 3 -> Level 5!"

### Phase 4: Capture Restriction (US4 - P2)

1. **Update /api/capture route**
   - Query pokemon_owned for species check
   - Return ALREADY_OWNED error if owned
   - Add already_owned flag to GET response

2. **Update /api/battle route**
   - Add wild_pokemon_owned field to battle response

3. **Update CaptureAttempt.tsx**
   - Accept alreadyOwned prop
   - Disable button when owned
   - Show tooltip "Already caught - can only knock out"

4. **Update battle/page.tsx**
   - Pass ownership info to CaptureAttempt

## Testing Checklist

### US1 - DC Display
- [ ] Select a move in battle
- [ ] Verify DC is shown before roll result
- [ ] Verify DC reflects type advantages
- [ ] Verify success/failure matches DC vs roll

### US2 - XP Display
- [ ] Win a battle
- [ ] Verify post-battle screen shows XP gained
- [ ] Verify previous XP, gained, and new total are shown
- [ ] Lose a battle
- [ ] Verify 1 XP consolation is displayed

### US3 - Level-Up
- [ ] Win battles until level-up
- [ ] Verify level-up notification appears
- [ ] Verify previous and new level are shown
- [ ] Test max level handling

### US4 - Capture Restriction
- [ ] Encounter Pokemon species you own
- [ ] Verify capture button is disabled
- [ ] Verify tooltip message appears
- [ ] Encounter Pokemon species you don't own
- [ ] Verify capture button is enabled
- [ ] Verify capture works normally

## Key Files to Modify

| File | Changes |
|------|---------|
| `src/components/BattleArena.tsx` | Add DC display before roll |
| `src/components/PostBattleScreen.tsx` | **NEW** - XP and level-up display |
| `src/components/CaptureAttempt.tsx` | Add ownership disable state |
| `src/app/battle/page.tsx` | Integrate new components |
| `src/app/api/capture/route.ts` | Add ownership check |
| `src/app/api/battle/route.ts` | Add wild_pokemon_owned flag |
| `src/lib/types.ts` | Add new type definitions |

## Common Issues

### DC Not Showing
- Ensure `lastRound.dc` is being used in BattleArena
- DC is already in the round response

### XP Not Updating
- Verify experience_gained is returned from round API
- Check that experience column exists in pokemon_owned table

### Capture Button Not Disabled
- Verify ownership query is working in API
- Check that alreadyOwned prop is passed to component
