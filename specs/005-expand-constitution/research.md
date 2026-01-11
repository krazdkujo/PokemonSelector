# Research: Expand Constitution for Pokemon Battle and Capture System

**Branch**: `005-expand-constitution`
**Date**: 2026-01-11
**Status**: Complete

## Executive Summary

This document consolidates research findings for implementing the Pokemon battle/capture system and API authentication in a serverless Next.js + Supabase environment.

---

## 1. Battle State Management in Serverless Environment

### Decision
Store complete battle state in Supabase PostgreSQL, not in ephemeral serverless memory.

### Rationale
- Next.js serverless functions have no persistent memory between requests
- Battle state must survive across multiple client requests (one per round)
- Supabase provides relational data perfect for tracking battle history and round progression
- Server-side functions remain stateless but reference persisted state via battle ID

### Implementation Pattern
```
Battle State Table:
- battle_id (UUID, primary key)
- user_id (UUID, FK to trainers)
- wild_pokemon (JSONB: {pokemon_id, level, sr, type[], current_hp})
- player_wins (int, default 0)
- wild_wins (int, default 0)
- status (enum: ACTIVE, PLAYER_WON, WILD_WON, FLED)
- seed (varchar, for deterministic RNG)
- created_at, updated_at (timestamps)
```

### Alternatives Considered
| Alternative | Rejected Because |
|------------|------------------|
| JWT tokens encoding state | Risk of state tampering; loses data if corrupted |
| Redis/cache layer | Extra infrastructure; not persistent on app restart |
| Client-side state | Vulnerable to manipulation; cannot be trusted |

---

## 2. Deterministic Battle Calculations

### Decision
Use seeded pseudorandom generation (PRNG) with deterministic move/damage formula.

### Rationale
- Serverless functions are stateless; cannot store RNG seed in memory
- Seed from immutable data: `hash(battle_id + round_number)` = reproducible across function invocations
- All RNG calls during a round use same seed, enabling replay/audit
- Critical for SC-010: "Battle round calculations are deterministic and reproducible"

### Implementation Pattern
```typescript
import seedrandom from 'seedrandom';

function createBattleRng(battleId: string, roundNumber: number): () => number {
  const seed = `${battleId}:${roundNumber}`;
  return seedrandom(seed);
}

// Usage in round resolution
const rng = createBattleRng(battle.id, battle.round_number);
const roll = Math.floor(rng() * 20) + 1; // d20 roll
```

### Alternatives Considered
| Alternative | Rejected Because |
|------------|------------------|
| External RNG API | Adds latency; requires external dependency |
| Store RNG state in DB | Unnecessary complexity; seed-based is simpler |
| Client-side RNG | Easily manipulated; untrustworthy |

---

## 3. Type Effectiveness Calculations

### Decision
Immutable type chart lookup table embedded in TypeScript + multiplicative stacking for dual-types.

### Rationale
- Gen 1 Pokemon has fixed type matchups (no updates between versions)
- Store as TypeScript constant; no DB queries needed
- Dual-type Pokemon: multiply effectiveness separately for each type

### Implementation Pattern
```typescript
// src/lib/type-chart.ts
export const TYPE_CHART: Record<string, { strongAgainst: string[], weakAgainst: string[] }> = {
  fire: {
    strongAgainst: ['grass', 'ice', 'bug'],
    weakAgainst: ['water', 'ground', 'rock']
  },
  water: {
    strongAgainst: ['fire', 'ground', 'rock'],
    weakAgainst: ['grass', 'electric']
  },
  // ... all 15 Gen 1 types
};

export function getTypeEffectiveness(
  attackType: string,
  defenderTypes: string[]
): number {
  let effectiveness = 1.0;

  for (const defenderType of defenderTypes) {
    if (TYPE_CHART[attackType]?.strongAgainst.includes(defenderType)) {
      effectiveness *= 2.0; // Super Effective
    } else if (TYPE_CHART[attackType]?.weakAgainst.includes(defenderType)) {
      effectiveness *= 0.5; // Not Very Effective
    }
  }

  return effectiveness;
}
```

### Alternatives Considered
| Alternative | Rejected Because |
|------------|------------------|
| DB lookup per calculation | N+1 queries; serverless inefficient |
| Client-side chart | Potential tampering; server-only enforcement |

---

## 4. STAB (Same-Type Attack Bonus) Implementation

### Decision
Apply 1.5x multiplier when attacker's type matches move type, after base chance calculation.

### Rationale
- STAB is a fixed rule (1.5x multiplier)
- Applied as bonus to base win chance, not damage (per simplified PRD combat)
- Dual-type Pokemon get STAB if move matches either primary OR secondary type

### Implementation Pattern
```typescript
function hasStabBonus(attackerTypes: string[], moveType: string): boolean {
  return attackerTypes.includes(moveType);
}

function calculateRoundWinChance(
  playerLevel: number,
  playerSR: number,
  wildLevel: number,
  wildSR: number,
  playerMoveType: string,
  playerTypes: string[],
  wildTypes: string[]
): number {
  // Base chance from level and SR differential
  let baseChance = 0.5;
  baseChance += (playerLevel - wildLevel) * 0.05; // +5% per level advantage
  baseChance += (playerSR - wildSR) * 0.1; // +10% per SR advantage

  // Type effectiveness bonus
  const typeEffectiveness = getTypeEffectiveness(playerMoveType, wildTypes);
  if (typeEffectiveness > 1) baseChance += 0.15; // Super effective bonus
  if (typeEffectiveness < 1) baseChance -= 0.15; // Not very effective penalty

  // STAB bonus
  if (hasStabBonus(playerTypes, playerMoveType)) {
    baseChance += 0.1; // +10% for STAB
  }

  // Clamp to valid range
  return Math.max(0.1, Math.min(0.9, baseChance));
}
```

---

## 5. Capture DC Calculations

### Decision
Implement DC-based capture per PRD spec with adjustments for level, SR, and round wins.

### Rationale
- Base DC 15 is standard D&D-style difficulty
- Level and SR adjustments create meaningful progression
- Round win reductions incentivize battle engagement before capture

### Implementation Pattern
```typescript
interface CaptureContext {
  playerLevel: number;
  playerSR: number;
  wildLevel: number;
  wildSR: number;
  playerRoundWins: number;
}

function calculateCaptureDC(ctx: CaptureContext): number {
  let dc = 15; // Base DC

  // Level adjustment (rounded up)
  const levelDiff = ctx.wildLevel - ctx.playerLevel;
  dc += Math.ceil(levelDiff); // Positive if wild is higher level

  // SR adjustment
  const srDiff = ctx.wildSR - ctx.playerSR;
  dc += Math.ceil(srDiff);

  // Round win reduction (-3 per win)
  dc -= ctx.playerRoundWins * 3;

  // Minimum DC of 5
  return Math.max(5, dc);
}

function attemptCapture(dc: number, rng: () => number): { success: boolean; roll: number } {
  const roll = Math.floor(rng() * 20) + 1; // d20 roll
  return {
    success: roll >= dc,
    roll
  };
}
```

### Flee Chance
```typescript
function checkFlee(rng: () => number): boolean {
  // 25% base flee chance on failed capture
  return rng() < 0.25;
}
```

---

## 6. Secret Key Authentication

### Decision
Use Node.js crypto for generation, bcrypt for hashing, middleware for validation.

### Rationale
- `crypto.randomBytes(32)` uses OS-level entropy (CSPRNG)
- bcrypt is intentionally slow, preventing brute force attacks
- Middleware centralizes security logic and enables audit trails
- One-time display model (like GitHub tokens) prevents key retrieval

### Implementation Pattern

**Key Generation:**
```typescript
import crypto from 'crypto';

function generateSecretKey(): string {
  return crypto.randomBytes(32).toString('base64url');
}
```

**Key Storage (hashed):**
```sql
CREATE TABLE user_secrets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  UNIQUE(user_id) -- One active key per user
);
```

**Middleware Validation:**
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip auth for non-protected routes (e.g., health check)
  const publicRoutes = ['/api/health'];
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const apiKey = request.headers.get('X-API-Key');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'UNAUTHORIZED', message: 'Missing X-API-Key header' },
      { status: 401 }
    );
  }

  const userId = await validateKeyAndGetUser(apiKey);

  if (!userId) {
    return NextResponse.json(
      { error: 'UNAUTHORIZED', message: 'Invalid API key' },
      { status: 401 }
    );
  }

  // Pass user ID to route handler
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-User-ID', userId);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/api/:path*']
};
```

**Key Regeneration:**
```typescript
async function regenerateKey(userId: string): Promise<string> {
  const newKey = generateSecretKey();
  const hash = await bcrypt.hash(newKey, 10);

  // Upsert: replace existing key
  await supabase
    .from('user_secrets')
    .upsert({ user_id: userId, key_hash: hash, created_at: new Date() });

  return newKey; // Return plaintext once, user must save it
}
```

### Alternatives Considered
| Alternative | Rejected Because |
|------------|------------------|
| Math.random() | Cryptographically unsafe |
| Encryption instead of hashing | If DB+key leaked, keys compromised |
| Plain SHA256 hashing | Fast hashing = fast brute force |
| JWT-based keys | Unnecessary complexity for API keys |

---

## 7. Pokemon Data Structure Alignment

### Decision
Use existing `docs/pokemon-cleaned.json` structure with SR, moves, and evolution data.

### Findings
The existing data already contains:
- `sr` field (Strength Rating, e.g., 0.5 for Bulbasaur)
- `moves` object with level-based unlock (`start`, `level2`, `level6`, etc.)
- `evolution` field (e.g., "Stage 1 of 3")
- `type` array for dual-typing

### Mapping to Condensed Leveling (1-10)
```typescript
// Original levels: 1-100 style (minLevel field)
// Condensed levels: 1-10

function getCondensedLevel(originalMinLevel: number): number {
  // Map original levels to 1-10 scale
  if (originalMinLevel <= 5) return 1;
  if (originalMinLevel <= 10) return 2;
  if (originalMinLevel <= 16) return 3;
  if (originalMinLevel <= 22) return 4;
  if (originalMinLevel <= 28) return 5;
  if (originalMinLevel <= 34) return 6;
  if (originalMinLevel <= 40) return 7;
  if (originalMinLevel <= 46) return 8;
  if (originalMinLevel <= 52) return 9;
  return 10;
}

// Evolution thresholds (per PRD):
// - Single evolution: level 5
// - Two evolutions: levels 3 and 6
```

### Move Availability
```typescript
function getAvailableMoves(pokemon: Pokemon, level: number): string[] {
  const moves: string[] = [];

  // Always include start moves
  moves.push(...(pokemon.moves.start || []));

  // Add level-gated moves based on condensed level
  if (level >= 2) moves.push(...(pokemon.moves.level2 || []));
  if (level >= 6) moves.push(...(pokemon.moves.level6 || []));
  if (level >= 10) moves.push(...(pokemon.moves.level10 || []));
  // ... etc

  return [...new Set(moves)]; // Dedupe
}
```

---

## 8. Optional LLM Narration

### Decision
LLM narration is a deferred enhancement; core battle logic works without it.

### Rationale
- PRD specifies narration is "descriptive and does not affect mechanical outcomes"
- MVP can display simple text: "Pikachu won the round!"
- LLM integration adds complexity (API keys, latency, cost)
- Can be added in Phase 2 without changing core battle logic

### Future Integration Point
```typescript
interface BattleNarration {
  enabled: boolean;
  provider?: 'openai' | 'anthropic';
}

async function narrateRound(
  round: RoundResult,
  config: BattleNarration
): Promise<string> {
  if (!config.enabled) {
    // Simple fallback narration
    return `${round.winner.name} wins round ${round.number}!`;
  }

  // LLM narration (future implementation)
  return await generateLLMNarration(round, config.provider);
}
```

---

## Dependencies to Add

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "seedrandom": "^3.0.5"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/seedrandom": "^3.0.8"
  }
}
```

---

## Summary

| Research Area | Decision | Confidence |
|--------------|----------|------------|
| Battle state storage | Supabase PostgreSQL | High |
| RNG determinism | Seeded PRNG (seedrandom) | High |
| Type effectiveness | Embedded TypeScript constant | High |
| STAB implementation | 1.5x multiplier on matching types | High |
| Capture DC | Base 15, adjustments per PRD | High |
| Secret key generation | crypto.randomBytes(32) | High |
| Secret key storage | bcrypt hash only | High |
| Key validation | Next.js middleware | High |
| Pokemon data | Use existing JSON structure | High |
| LLM narration | Deferred enhancement | High |

All NEEDS CLARIFICATION items have been resolved. Ready for Phase 1: Design & Contracts.
