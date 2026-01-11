# Quickstart: Combat Zone Selection

**Feature Branch**: `006-combat-zones`
**Date**: 2026-01-11

## Overview

This feature adds zone-based combat encounters where trainers select from eight themed zones covering all 17 Pokemon types, then choose a difficulty level (Easy, Medium, Hard) before battling.

## Prerequisites

- Existing Pokemon Starter Selector app running
- Trainer account with at least one Pokemon (active)
- Access to `/battle` page

## Quick Implementation Guide

### 1. Add Zone Configuration

Create `src/lib/zones.ts`:

```typescript
export interface Zone {
  id: string;
  name: string;
  description: string;
  types: string[];
  color: string;
}

export const ZONES: Zone[] = [
  {
    id: 'jungle',
    name: 'Jungle',
    description: 'Dense vegetation filled with bugs, plants, and venomous creatures',
    types: ['bug', 'grass', 'poison'],
    color: 'green'
  },
  // ... 7 more zones
];

export type ZoneDifficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_CONFIG = {
  easy: { maxSrOffset: 2, minLevel: -Infinity, maxLevel: 0 },
  medium: { maxSrOffset: 5, minLevel: 0, maxLevel: 3 },
  hard: { maxSrOffset: Infinity, minLevel: 4, maxLevel: 6 }
};
```

### 2. Add Zone Pokemon Generator

Add to `src/lib/battle.ts`:

```typescript
export function generateZoneWildPokemon(
  zoneId: string,
  difficulty: ZoneDifficulty,
  playerLevel: number,
  playerSR: number,
  seed: string
): WildPokemon {
  const zone = ZONES.find(z => z.id === zoneId);
  const config = DIFFICULTY_CONFIG[difficulty];

  // Filter by zone types
  const zonePokemons = allPokemon.filter(p =>
    p.type.some(t => zone.types.includes(t))
  );

  // Filter by SR constraints
  const eligible = zonePokemons.filter(p =>
    p.sr <= playerSR + config.maxSrOffset
  );

  // Generate with level constraints
  // ...
}
```

### 3. Modify Battle API

Update `src/app/api/battle/route.ts` POST handler:

```typescript
// Parse new request format
const { zone_id, difficulty } = body;

if (zone_id) {
  // Zone-based battle
  wildPokemon = generateZoneWildPokemon(zone_id, difficulty, ...);
} else {
  // Legacy random battle
  wildPokemon = generateWildPokemon(difficulty, ...);
}
```

### 4. Add Zone Selector UI

Create `src/components/ZoneSelector.tsx`:

```tsx
export function ZoneSelector({ onSelect }: { onSelect: (zoneId: string) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {ZONES.map(zone => (
        <button
          key={zone.id}
          onClick={() => onSelect(zone.id)}
          className={`p-4 rounded-lg border-2 bg-${zone.color}-50 border-${zone.color}-300`}
        >
          <div className="font-bold">{zone.name}</div>
          <div className="text-sm">{zone.types.join(', ')}</div>
        </button>
      ))}
    </div>
  );
}
```

### 5. Update Battle Page Flow

Modify `src/app/battle/page.tsx`:

```tsx
const [selectedZone, setSelectedZone] = useState<string | null>(null);

// Step 1: Zone selection
if (!battle && !selectedZone) {
  return <ZoneSelector onSelect={setSelectedZone} />;
}

// Step 2: Difficulty selection (existing, but with zone parameter)
if (!battle && selectedZone) {
  return <DifficultySelector zone={selectedZone} onStart={startBattle} />;
}
```

## Database Migration

Add `zone` column to `battles` table:

```sql
ALTER TABLE battles ADD COLUMN zone TEXT;
```

## Testing Checklist

- [ ] All 8 zones display correctly on battle page
- [ ] Selecting a zone shows difficulty options
- [ ] Easy difficulty generates Pokemon at/below player level
- [ ] Medium difficulty generates Pokemon 0-3 levels higher
- [ ] Hard difficulty generates Pokemon 4-6 levels higher
- [ ] Generated Pokemon types match selected zone
- [ ] Fallback works when no Pokemon match criteria
- [ ] Legacy battles (no zone) still work

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/zones.ts` | CREATE | Zone definitions and difficulty config |
| `src/lib/types.ts` | MODIFY | Add Zone and ZoneDifficulty types |
| `src/lib/battle.ts` | MODIFY | Add zone-aware Pokemon generation |
| `src/app/api/battle/route.ts` | MODIFY | Handle zone_id parameter |
| `src/app/api/zones/route.ts` | CREATE | Get all zones endpoint |
| `src/components/ZoneSelector.tsx` | CREATE | Zone selection UI |
| `src/app/battle/page.tsx` | MODIFY | Add zone selection step |
| `sql/009_add_battle_zone.sql` | CREATE | Database migration |
