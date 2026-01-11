# Data Model: Expand Constitution for Pokemon Battle and Capture System

**Branch**: `005-expand-constitution`
**Date**: 2026-01-11
**Status**: Complete

## Overview

This document defines the data model for the expanded Pokemon gameplay system, including new entities for battles, captures, user secrets, and multi-Pokemon ownership.

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│   auth.users    │       │    trainers     │
│ (Supabase Auth) │       │   (existing)    │
└────────┬────────┘       └────────┬────────┘
         │                         │
         │ 1:1                     │ 1:1
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│    profiles     │◄──────│  user_secrets   │
│   (existing)    │       │     (new)       │
└────────┬────────┘       └─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│  pokemon_owned  │
│     (new)       │
└────────┬────────┘
         │
         │ N:1
         ▼
┌─────────────────┐       ┌─────────────────┐
│    battles      │       │   user_stats    │
│     (new)       │       │     (new)       │
└─────────────────┘       └─────────────────┘
```

---

## Entities

### 1. trainers (existing - extended)

The existing `trainers` table will be retained but the `starter_pokemon_id` relationship changes to reference `pokemon_owned`.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Unique trainer identifier |
| name | VARCHAR(100) | NOT NULL, UNIQUE | Trainer display name |
| role | VARCHAR(20) | DEFAULT 'trainer' | Role: 'trainer' or 'admin' |
| starter_pokemon_id | INTEGER | NULLABLE (deprecated) | Legacy field, migrate to pokemon_owned |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Migration Note**: `starter_pokemon_id` will be deprecated. Existing starters will be migrated to `pokemon_owned` with `is_active = true` and `is_starter = true`.

---

### 2. user_secrets (new)

Stores hashed API secret keys for authenticated API access.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Secret record ID |
| user_id | UUID | FK trainers(id), UNIQUE, ON DELETE CASCADE | One key per user |
| key_hash | VARCHAR(255) | NOT NULL | bcrypt hash of the secret key |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Key generation timestamp |
| last_used_at | TIMESTAMPTZ | NULLABLE | Last API usage timestamp |

**Indexes**:
- `idx_user_secrets_user_id` on `user_id`

**Validation Rules**:
- Key is generated using `crypto.randomBytes(32).toString('base64url')`
- Key is hashed with bcrypt (10 rounds) before storage
- Plaintext key is returned once on generation, never retrievable

---

### 3. pokemon_owned (new)

Tracks Pokemon owned by users, including their level, moves, and active status.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Owned Pokemon record ID |
| user_id | UUID | FK trainers(id), ON DELETE CASCADE | Owner trainer |
| pokemon_id | INTEGER | NOT NULL | Pokemon species ID (from JSON data) |
| level | INTEGER | NOT NULL, CHECK (1-10) | Condensed level (1-10) |
| selected_moves | JSONB | DEFAULT '[]' | Array of 4 move IDs |
| is_active | BOOLEAN | DEFAULT false | Currently active Pokemon |
| is_starter | BOOLEAN | DEFAULT false | Was this the starter selection |
| captured_at | TIMESTAMPTZ | DEFAULT NOW() | When Pokemon was captured |

**Indexes**:
- `idx_pokemon_owned_user_id` on `user_id`
- `idx_pokemon_owned_active` on `(user_id, is_active)` WHERE `is_active = true` (partial unique)

**Validation Rules**:
- `selected_moves` must contain exactly 4 valid move IDs for the Pokemon's available moves
- Only one `is_active = true` per user (enforced via partial unique index)
- `level` must be between 1 and 10 inclusive
- `pokemon_id` must reference a valid Pokemon in the JSON data

**State Transitions**:
```
CAPTURED → ACTIVE (via Pokecenter swap)
ACTIVE → STORED (when another Pokemon becomes active)
```

---

### 4. battles (new)

Tracks active and completed battle encounters.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Battle record ID |
| user_id | UUID | FK trainers(id), ON DELETE CASCADE | Battling trainer |
| player_pokemon_id | UUID | FK pokemon_owned(id) | Player's active Pokemon at battle start |
| wild_pokemon | JSONB | NOT NULL | Wild Pokemon data snapshot |
| difficulty | VARCHAR(20) | NOT NULL | 'easy', 'normal', 'difficult' |
| player_wins | INTEGER | DEFAULT 0, CHECK (0-3) | Player round wins |
| wild_wins | INTEGER | DEFAULT 0, CHECK (0-3) | Wild Pokemon round wins |
| capture_attempts | INTEGER | DEFAULT 0 | Number of capture attempts |
| status | VARCHAR(20) | DEFAULT 'active' | Battle status |
| seed | VARCHAR(100) | NOT NULL | RNG seed for deterministic replay |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Battle start timestamp |
| ended_at | TIMESTAMPTZ | NULLABLE | Battle end timestamp |

**Status Values**:
- `active` - Battle in progress
- `player_won` - Player reached 3 wins
- `wild_won` - Wild Pokemon reached 3 wins (including failed captures)
- `captured` - Player successfully captured the wild Pokemon
- `fled` - Wild Pokemon fled during capture attempt

**wild_pokemon JSONB Structure**:
```json
{
  "pokemon_id": 25,
  "name": "Pikachu",
  "level": 5,
  "sr": 2,
  "types": ["electric"],
  "current_hp": 100
}
```

**Indexes**:
- `idx_battles_user_id` on `user_id`
- `idx_battles_status` on `(user_id, status)` WHERE `status = 'active'`

**Validation Rules**:
- Only one `status = 'active'` battle per user
- `player_wins` + `wild_wins` <= 5 (max rounds)
- Battle ends when either side reaches 3 wins or status changes to non-active

---

### 5. battle_rounds (new)

Tracks individual round results for replay and auditing.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Round record ID |
| battle_id | UUID | FK battles(id), ON DELETE CASCADE | Parent battle |
| round_number | INTEGER | NOT NULL, CHECK (1-5) | Round number (1-5) |
| player_move | VARCHAR(50) | NOT NULL | Move used by player |
| winner | VARCHAR(20) | NOT NULL | 'player' or 'wild' |
| roll | INTEGER | NOT NULL | Dice roll result |
| base_chance | DECIMAL(3,2) | NOT NULL | Calculated win chance |
| type_bonus | DECIMAL(3,2) | DEFAULT 0 | Type effectiveness modifier |
| stab_bonus | DECIMAL(3,2) | DEFAULT 0 | STAB modifier |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Round timestamp |

**Indexes**:
- `idx_battle_rounds_battle_id` on `battle_id`

---

### 6. user_stats (new)

Aggregated user statistics and economy data.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Stats record ID |
| user_id | UUID | FK trainers(id), UNIQUE, ON DELETE CASCADE | Owner trainer |
| money | INTEGER | DEFAULT 100, CHECK (>= 0) | Currency balance |
| items | JSONB | DEFAULT '{}' | Item inventory |
| battles_won | INTEGER | DEFAULT 0 | Total battles won |
| battles_lost | INTEGER | DEFAULT 0 | Total battles lost |
| pokemon_captured | INTEGER | DEFAULT 0 | Total Pokemon captured |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Stats creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**items JSONB Structure**:
```json
{
  "pokeball": 5,
  "potion": 3
}
```

**Indexes**:
- `idx_user_stats_user_id` on `user_id`

---

## Static Data (JSON Files)

### pokemon-cleaned.json (existing)

Referenced for Pokemon species data. Key fields used:

| Field | Type | Usage |
|-------|------|-------|
| id | string | Pokemon identifier (slug) |
| name | string | Display name |
| number | integer | National Pokedex number |
| type | string[] | Pokemon types (for effectiveness, STAB) |
| sr | number | Strength Rating |
| minLevel | integer | Minimum spawn level (map to condensed) |
| moves | object | Available moves by level |
| evolution | string | Evolution stage info |
| media.main | string | Official artwork URL |
| media.sprite | string | Sprite URL |

### moves-cleaned.json (existing)

Referenced for move data. Key fields used:

| Field | Type | Usage |
|-------|------|-------|
| id | string | Move identifier (slug) |
| name | string | Display name |
| type | string | Move type (for effectiveness, STAB) |
| flavor | string | Short description |
| description | string | Full description |

---

## Database Migrations

### Migration 001: Create user_secrets table
```sql
CREATE TABLE user_secrets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

CREATE INDEX idx_user_secrets_user_id ON user_secrets(user_id);
```

### Migration 002: Create pokemon_owned table
```sql
CREATE TABLE pokemon_owned (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  pokemon_id INTEGER NOT NULL,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 10),
  selected_moves JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT false,
  is_starter BOOLEAN DEFAULT false,
  captured_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pokemon_owned_user_id ON pokemon_owned(user_id);
CREATE UNIQUE INDEX idx_pokemon_owned_active ON pokemon_owned(user_id)
  WHERE is_active = true;
```

### Migration 003: Create battles table
```sql
CREATE TABLE battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  player_pokemon_id UUID REFERENCES pokemon_owned(id),
  wild_pokemon JSONB NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  player_wins INTEGER DEFAULT 0 CHECK (player_wins >= 0 AND player_wins <= 3),
  wild_wins INTEGER DEFAULT 0 CHECK (wild_wins >= 0 AND wild_wins <= 3),
  capture_attempts INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  seed VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX idx_battles_user_id ON battles(user_id);
CREATE UNIQUE INDEX idx_battles_active ON battles(user_id)
  WHERE status = 'active';
```

### Migration 004: Create battle_rounds table
```sql
CREATE TABLE battle_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL CHECK (round_number >= 1 AND round_number <= 5),
  player_move VARCHAR(50) NOT NULL,
  winner VARCHAR(20) NOT NULL,
  roll INTEGER NOT NULL,
  base_chance DECIMAL(3,2) NOT NULL,
  type_bonus DECIMAL(3,2) DEFAULT 0,
  stab_bonus DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_battle_rounds_battle_id ON battle_rounds(battle_id);
```

### Migration 005: Create user_stats table
```sql
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  money INTEGER DEFAULT 100 CHECK (money >= 0),
  items JSONB DEFAULT '{}',
  battles_won INTEGER DEFAULT 0,
  battles_lost INTEGER DEFAULT 0,
  pokemon_captured INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
```

### Migration 006: Migrate existing starters
```sql
-- Migrate existing starter_pokemon_id to pokemon_owned
INSERT INTO pokemon_owned (user_id, pokemon_id, level, is_active, is_starter)
SELECT id, starter_pokemon_id, 1, true, true
FROM trainers
WHERE starter_pokemon_id IS NOT NULL;

-- Create user_stats for existing users
INSERT INTO user_stats (user_id)
SELECT id FROM trainers
ON CONFLICT (user_id) DO NOTHING;
```

---

## TypeScript Types

```typescript
// Extended types for new entities

export interface UserSecret {
  id: string;
  user_id: string;
  key_hash: string;
  created_at: string;
  last_used_at: string | null;
}

export interface PokemonOwned {
  id: string;
  user_id: string;
  pokemon_id: number;
  level: number;
  selected_moves: string[];
  is_active: boolean;
  is_starter: boolean;
  captured_at: string;
}

export interface WildPokemon {
  pokemon_id: number;
  name: string;
  level: number;
  sr: number;
  types: string[];
  current_hp: number;
}

export interface Battle {
  id: string;
  user_id: string;
  player_pokemon_id: string;
  wild_pokemon: WildPokemon;
  difficulty: 'easy' | 'normal' | 'difficult';
  player_wins: number;
  wild_wins: number;
  capture_attempts: number;
  status: 'active' | 'player_won' | 'wild_won' | 'captured' | 'fled';
  seed: string;
  created_at: string;
  ended_at: string | null;
}

export interface BattleRound {
  id: string;
  battle_id: string;
  round_number: number;
  player_move: string;
  winner: 'player' | 'wild';
  roll: number;
  base_chance: number;
  type_bonus: number;
  stab_bonus: number;
  created_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  money: number;
  items: Record<string, number>;
  battles_won: number;
  battles_lost: number;
  pokemon_captured: number;
  created_at: string;
  updated_at: string;
}

// Extended trainer with related data
export interface TrainerWithData extends Trainer {
  active_pokemon: PokemonOwned | null;
  pokemon_collection: PokemonOwned[];
  stats: UserStats;
}
```

---

## Row Level Security (RLS) Policies

```sql
-- user_secrets: Users can only access their own secrets
ALTER TABLE user_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own secrets"
  ON user_secrets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own secrets"
  ON user_secrets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own secrets"
  ON user_secrets FOR UPDATE
  USING (user_id = auth.uid());

-- pokemon_owned: Users can only access their own Pokemon
ALTER TABLE pokemon_owned ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pokemon"
  ON pokemon_owned FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own pokemon"
  ON pokemon_owned FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pokemon"
  ON pokemon_owned FOR UPDATE
  USING (user_id = auth.uid());

-- battles: Users can only access their own battles
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own battles"
  ON battles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own battles"
  ON battles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own battles"
  ON battles FOR UPDATE
  USING (user_id = auth.uid());

-- user_stats: Users can only access their own stats
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  USING (user_id = auth.uid());
```
