# Data Model: Admin Dashboard and External API Documentation

**Branch**: `009-admin-dashboard-api` | **Date**: 2026-01-11

## Overview

This document defines the data entities, types, and relationships for the admin dashboard enhancements. No new database tables are required; this feature builds on existing tables.

---

## Existing Entities (No Changes)

### Trainer (trainers table)

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| name | text | Display name |
| role | 'trainer' \| 'admin' | User role |
| starter_pokemon_id | integer \| null | Reference to starter Pokemon |
| created_at | timestamp | Registration time |
| updated_at | timestamp | Last update time |

### UserStats (user_stats table)

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to trainers |
| money | integer | Currency balance |
| items | jsonb | Item inventory |
| battles_won | integer | Total battles won |
| battles_lost | integer | Total battles lost |
| pokemon_captured | integer | Total Pokemon captured |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

### PokemonOwned (pokemon_owned table)

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to trainers |
| pokemon_id | integer | Pokemon species number |
| level | integer | Current level |
| experience | integer | Experience points |
| selected_moves | text[] | Array of 4 move IDs |
| is_active | boolean | Currently active for battles |
| is_starter | boolean | Is the starter Pokemon |
| captured_at | timestamp | When captured |

---

## New TypeScript Types

### TrainerWithStats

Extended trainer type for admin dashboard display.

```typescript
interface TrainerStatsSummary {
  battles_won: number;
  battles_lost: number;
  pokemon_captured: number;
  pokemon_count: number;
}

interface TrainerWithStats extends Trainer {
  starter: Pokemon | null;
  stats: TrainerStatsSummary | null;
}
```

**Derivation**:
- `starter`: Joined from local Pokemon JSON using `starter_pokemon_id`
- `stats.battles_won`: From `user_stats.battles_won`
- `stats.battles_lost`: From `user_stats.battles_lost`
- `stats.pokemon_captured`: From `user_stats.pokemon_captured`
- `stats.pokemon_count`: COUNT from `pokemon_owned` WHERE `user_id` matches

### RoleUpdateRequest

Request body for role assignment endpoint.

```typescript
interface RoleUpdateRequest {
  role: 'trainer' | 'admin';
}
```

**Validation Rules**:
- `role` must be exactly 'trainer' or 'admin'
- Request must come from authenticated admin
- Cannot demote the last admin (server enforced)

### RoleUpdateResponse

Response from role assignment endpoint.

```typescript
interface RoleUpdateResponse {
  trainer_id: string;
  previous_role: 'trainer' | 'admin';
  new_role: 'trainer' | 'admin';
  updated_at: string;
}
```

---

## State Transitions

### Role State Machine

```
     +-------------+
     |  trainer    |
     +-------------+
          |   ^
  promote |   | demote (if not last admin)
          v   |
     +-------------+
     |   admin     |
     +-------------+
```

**Invariants**:
1. At least one admin must exist at all times
2. Role changes are auditable via `updated_at` timestamp
3. Role changes are immediate (no pending state)

---

## Validation Rules

### Role Assignment

| Rule | Validation | Error |
|------|------------|-------|
| Requester must be admin | Check `trainers.role = 'admin'` | 403 FORBIDDEN |
| Target trainer must exist | Check trainer exists by ID | 404 NOT_FOUND |
| Valid role value | Must be 'trainer' or 'admin' | 400 VALIDATION_ERROR |
| Not last admin | Count admins before demote | 400 CANNOT_REMOVE_LAST_ADMIN |

### Statistics Display

| Rule | Handling |
|------|----------|
| Trainer has no stats | Display zeros (default values) |
| Trainer has no Pokemon | Display 0 for pokemon_count |
| Trainer never battled | Display 0/0 for wins/losses |

---

## Query Patterns

### Admin Dashboard Query

```sql
SELECT
  t.id,
  t.name,
  t.role,
  t.starter_pokemon_id,
  t.created_at,
  t.updated_at,
  us.battles_won,
  us.battles_lost,
  us.pokemon_captured,
  (SELECT COUNT(*) FROM pokemon_owned WHERE user_id = t.id) as pokemon_count
FROM trainers t
LEFT JOIN user_stats us ON us.user_id = t.id
ORDER BY t.created_at DESC
```

### Last Admin Check

```sql
SELECT COUNT(*) as admin_count
FROM trainers
WHERE role = 'admin'
```

---

## Relationship Diagram

```
+-------------+       +-------------+       +---------------+
|   trainers  |       | user_stats  |       | pokemon_owned |
+-------------+       +-------------+       +---------------+
| id (PK)     |<------| user_id (FK)|       | id (PK)       |
| name        |       | battles_won |       | user_id (FK)  |-->|
| role        |       | battles_lost|       | pokemon_id    |   |
| starter_... |       | pokemon_... |       | level         |   |
| created_at  |       +-------------+       | is_active     |   |
| updated_at  |                             +---------------+   |
+-------------+<------------------------------------------------+
```
