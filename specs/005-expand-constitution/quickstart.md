# Quickstart: Pokemon Battle and Capture System

**Branch**: `005-expand-constitution`
**Date**: 2026-01-11

## Overview

This guide provides a quick reference for implementing the expanded Pokemon gameplay system.

---

## Prerequisites

### Dependencies to Add

```bash
npm install bcryptjs seedrandom
npm install -D @types/bcryptjs @types/seedrandom
```

### Environment Variables

No new environment variables required. Uses existing Supabase configuration:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Database Setup

### Run Migrations

Execute migrations in order:

```bash
# Using Supabase CLI
supabase db push

# Or run migrations manually via SQL
npm run db:migrate
```

### Migration Files

Create migration files in `supabase/migrations/`:

1. `001_create_user_secrets.sql`
2. `002_create_pokemon_owned.sql`
3. `003_create_battles.sql`
4. `004_create_battle_rounds.sql`
5. `005_create_user_stats.sql`
6. `006_migrate_starters.sql`

See `data-model.md` for full SQL.

---

## Implementation Order

### Phase 1: Authentication Layer

1. **Create middleware.ts** at project root
   - Validate X-API-Key header
   - Skip auth for public routes
   - Inject X-User-ID header on success

2. **Create /api/secret-key/route.ts**
   - GET: Return key metadata
   - POST: Generate new key with bcrypt

3. **Create SecretKeyManager component**
   - Display key status
   - Generate/regenerate button
   - Show key once on generation

### Phase 2: Starter Selection (Update)

1. **Update /api/starter/route.ts**
   - Filter Pokemon by SR <= 0.5
   - Create entry in `pokemon_owned` instead of updating `trainers`
   - Set `is_active = true`, `is_starter = true`

2. **Create user_stats entry on starter selection**

### Phase 3: Dashboard (Update)

1. **Create /api/dashboard/route.ts**
   - Aggregate: active Pokemon, stats, battle status

2. **Update dashboard page**
   - Display active Pokemon
   - Show money and items
   - Add navigation to battle, pokecenter
   - Show secret key management

### Phase 4: Battle System

1. **Create /api/battle/route.ts**
   - POST: Start new battle (generate wild Pokemon, seed)
   - GET: Get current battle status

2. **Create /api/battle/round/route.ts**
   - POST: Execute round with move
   - Calculate win chance (level, SR, type, STAB)
   - Use seeded RNG for deterministic roll

3. **Create battle.ts lib**
   - `createBattleRng(battleId, roundNumber)`
   - `calculateRoundWinChance()`
   - `generateWildPokemon(difficulty, playerLevel)`

4. **Create type-chart.ts lib**
   - Type effectiveness lookup table
   - `getTypeEffectiveness(attackType, defenderTypes)`

### Phase 5: Capture System

1. **Create /api/capture/route.ts**
   - POST: Attempt capture
   - Calculate DC (base 15, adjustments)
   - Handle success: create `pokemon_owned` entry
   - Handle failure: increment wild_wins, check flee

2. **Create capture.ts lib**
   - `calculateCaptureDC(context)`
   - `attemptCapture(dc, rng)`
   - `checkFlee(rng)`

### Phase 6: Pokecenter

1. **Create /api/pokecenter/route.ts**
   - GET: List all owned Pokemon

2. **Create /api/pokecenter/swap/route.ts**
   - POST: Swap active Pokemon
   - Check: no active battle
   - Update `is_active` flags

3. **Create pokecenter page**
   - Display Pokemon collection
   - Swap button for each Pokemon
   - Show current active Pokemon

### Phase 7: Moves System

1. **Create /api/moves/route.ts**
   - GET: Available moves for active Pokemon
   - PUT: Update selected moves (array of 4)

2. **Create moves.ts lib**
   - `getAvailableMoves(pokemon, level)`
   - Include evolution inheritance

3. **Create MoveSelector component**
   - Display available moves
   - Select 4 moves
   - Save button

---

## Key Code Patterns

### Secret Key Generation

```typescript
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export function generateSecretKey(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export async function hashKey(key: string): Promise<string> {
  return bcrypt.hash(key, 10);
}

export async function verifyKey(key: string, hash: string): Promise<boolean> {
  return bcrypt.compare(key, hash);
}
```

### Battle RNG

```typescript
import seedrandom from 'seedrandom';

export function createBattleRng(battleId: string, roundNumber: number) {
  return seedrandom(`${battleId}:${roundNumber}`);
}

export function rollD20(rng: seedrandom.PRNG): number {
  return Math.floor(rng() * 20) + 1;
}
```

### Type Effectiveness

```typescript
export function getTypeEffectiveness(
  attackType: string,
  defenderTypes: string[]
): number {
  let effectiveness = 1.0;
  for (const defType of defenderTypes) {
    if (TYPE_CHART[attackType]?.strongAgainst.includes(defType)) {
      effectiveness *= 2.0;
    } else if (TYPE_CHART[attackType]?.weakAgainst.includes(defType)) {
      effectiveness *= 0.5;
    }
  }
  return effectiveness;
}
```

### Capture DC

```typescript
export function calculateCaptureDC(ctx: CaptureContext): number {
  let dc = 15;
  dc += Math.ceil(ctx.wildLevel - ctx.playerLevel);
  dc += Math.ceil(ctx.wildSR - ctx.playerSR);
  dc -= ctx.playerRoundWins * 3;
  return Math.max(5, dc);
}
```

---

## API Authentication Pattern

### Middleware Setup

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = await validateKeyAndGetUser(apiKey);
  if (!userId) {
    return NextResponse.json({ error: 'INVALID_KEY' }, { status: 401 });
  }

  const headers = new Headers(request.headers);
  headers.set('X-User-ID', userId);
  return NextResponse.next({ request: { headers } });
}
```

### Route Handler Usage

```typescript
// Any API route
export async function GET(request: NextRequest) {
  const userId = request.headers.get('X-User-ID');
  // userId is guaranteed to be valid if middleware passed
}
```

---

## Testing Checklist

### Unit Tests
- [ ] Type effectiveness calculations
- [ ] STAB bonus logic
- [ ] Capture DC calculations
- [ ] Secret key generation format

### Integration Tests
- [ ] Full battle flow (start -> rounds -> win/lose)
- [ ] Capture flow (battle -> capture attempt -> success/fail)
- [ ] Pokemon swap (pokecenter -> swap -> verify active)
- [ ] Secret key lifecycle (generate -> use -> regenerate)

### Contract Tests
- [ ] All API endpoints return expected schemas
- [ ] Error responses match documented format
- [ ] Authentication failures return 401

---

## File Checklist

### New Files

```
src/
├── app/
│   ├── api/
│   │   ├── battle/
│   │   │   └── route.ts
│   │   ├── battle/round/
│   │   │   └── route.ts
│   │   ├── capture/
│   │   │   └── route.ts
│   │   ├── pokecenter/
│   │   │   └── route.ts
│   │   ├── pokecenter/swap/
│   │   │   └── route.ts
│   │   ├── moves/
│   │   │   └── route.ts
│   │   ├── secret-key/
│   │   │   └── route.ts
│   │   └── dashboard/
│   │       └── route.ts
│   ├── battle/
│   │   └── page.tsx
│   └── pokecenter/
│       └── page.tsx
├── components/
│   ├── BattleArena.tsx
│   ├── CaptureAttempt.tsx
│   ├── PokemonCollection.tsx
│   ├── MoveSelector.tsx
│   └── SecretKeyManager.tsx
├── lib/
│   ├── battle.ts
│   ├── capture.ts
│   ├── secret-key.ts
│   └── type-chart.ts
└── middleware.ts
```

### Modified Files

```
src/
├── app/
│   ├── api/
│   │   └── starter/route.ts  (update for pokemon_owned)
│   ├── dashboard/
│   │   └── page.tsx          (expand with new features)
│   └── select/
│       └── page.tsx          (update for new flow)
├── lib/
│   └── types.ts              (add new types)
```

---

## Common Pitfalls

1. **Middleware path matching**: Ensure `/api/:path*` catches all API routes
2. **bcrypt async**: Always use `await bcrypt.hash()` and `await bcrypt.compare()`
3. **RNG seeding**: Use same seed format consistently for determinism
4. **Active battle check**: Always verify no active battle before starting new one
5. **Move validation**: Verify moves are available to the Pokemon's current form
6. **Transaction safety**: Use Supabase RPC for atomic operations (e.g., capture + stats update)
