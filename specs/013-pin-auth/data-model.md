# Data Model: PIN Authentication Layer

**Feature**: 013-pin-auth
**Date**: 2026-01-12

## Overview

This feature extends the existing `trainers` table with PIN-related columns. No new tables are required as PIN has a 1:1 relationship with users.

---

## Entity: Trainer (Extended)

### Existing Fields (unchanged)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Unique trainer identifier |
| name | VARCHAR(20) | NOT NULL, CHECK length >= 1 | Trainer display name |
| role | VARCHAR(10) | NOT NULL, DEFAULT 'trainer', CHECK IN ('trainer', 'admin') | User role |
| starter_pokemon_id | INTEGER | UNIQUE | Selected starter Pokemon |
| starter_pokemon_uuid | UUID | FK to pokemon_owned | Reference to owned starter |
| starter_pokemon_nickname | VARCHAR(50) | | Custom nickname for starter |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update time |

### New PIN Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| pin_hash | VARCHAR(255) | NULL | bcrypt hash of 4-digit PIN; NULL if no PIN set |
| pin_failed_attempts | INTEGER | NOT NULL, DEFAULT 0 | Failed PIN entry count since last success |
| pin_lockout_until | TIMESTAMPTZ | NULL | Lockout expiration; NULL if not locked |
| pin_is_temporary | BOOLEAN | NOT NULL, DEFAULT FALSE | True if PIN was set by admin and requires change |
| pin_created_at | TIMESTAMPTZ | NULL | When PIN was created/last changed |

---

## State Transitions

### PIN Lifecycle States

```
[No PIN] --> [PIN Set] --> [Locked Out] --> [PIN Set]
    |            |             |               ^
    |            v             v               |
    |      [Temporary PIN] -------------------|
    |            |
    +------------+  (admin reset clears to No PIN)
```

### State: No PIN
- `pin_hash = NULL`
- User cannot access protected routes until PIN is created
- Triggered by: new account, admin reset

### State: PIN Set
- `pin_hash IS NOT NULL`
- `pin_is_temporary = FALSE`
- `pin_lockout_until IS NULL OR pin_lockout_until < NOW()`
- User can authenticate with PIN

### State: Temporary PIN
- `pin_hash IS NOT NULL`
- `pin_is_temporary = TRUE`
- User can authenticate but must change PIN immediately after

### State: Locked Out
- `pin_lockout_until > NOW()`
- User cannot attempt PIN verification until lockout expires
- Triggered when `pin_failed_attempts >= 5`

---

## Validation Rules

### PIN Format
- Exactly 4 numeric digits (0-9)
- Regex: `^[0-9]{4}$`
- Leading zeros allowed (e.g., "0012" is valid)

### Lockout Rules
- Max failed attempts: 5
- Lockout duration: 15 minutes
- Failed attempts reset to 0 on successful verification
- Admin unlock clears both `pin_failed_attempts` and `pin_lockout_until`

### Temporary PIN Rules
- Set by admin only
- User must change on first successful login
- Cannot be dismissed or skipped

---

## Migration SQL

```sql
-- Migration: 011_add_pin_fields
-- Description: Add PIN authentication columns to trainers table
-- Feature: 013-pin-auth

-- Add PIN-related columns to trainers table
ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(255),
  ADD COLUMN IF NOT EXISTS pin_failed_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pin_lockout_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pin_is_temporary BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS pin_created_at TIMESTAMPTZ;

-- Index for lockout queries (finding locked users)
CREATE INDEX IF NOT EXISTS idx_trainers_pin_lockout
  ON trainers(pin_lockout_until)
  WHERE pin_lockout_until IS NOT NULL;

-- Comment on columns for documentation
COMMENT ON COLUMN trainers.pin_hash IS 'bcrypt hash of 4-digit PIN; NULL if no PIN set';
COMMENT ON COLUMN trainers.pin_failed_attempts IS 'Failed PIN entry count since last success';
COMMENT ON COLUMN trainers.pin_lockout_until IS 'Lockout expiration timestamp; NULL if not locked';
COMMENT ON COLUMN trainers.pin_is_temporary IS 'True if PIN was admin-set and requires change';
COMMENT ON COLUMN trainers.pin_created_at IS 'When PIN was created or last changed';
```

---

## Entity: PIN Admin Action Log

For minimal audit logging (action type + timestamp only).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Log entry identifier |
| action_type | VARCHAR(20) | NOT NULL, CHECK IN ('reset', 'unlock', 'set_temp') | Type of admin action |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When action occurred |

**Note**: Per clarification, no admin ID or target user details are logged.

### Migration SQL (Audit Log)

```sql
-- Create minimal audit log for PIN admin actions
CREATE TABLE IF NOT EXISTS pin_admin_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('reset', 'unlock', 'set_temp')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS with open policy (matches existing pattern)
ALTER TABLE pin_admin_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON pin_admin_log
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE pin_admin_log IS 'Minimal audit log for PIN admin actions - no user details per privacy requirements';
```

---

## TypeScript Types

```typescript
// Extend existing Trainer type
interface Trainer {
  id: string;
  name: string;
  role: 'trainer' | 'admin';
  starter_pokemon_id: number | null;
  starter_pokemon_uuid: string | null;
  starter_pokemon_nickname: string | null;
  created_at: string;
  updated_at: string;
  // PIN fields
  pin_hash: string | null;
  pin_failed_attempts: number;
  pin_lockout_until: string | null;
  pin_is_temporary: boolean;
  pin_created_at: string | null;
}

// PIN verification result
interface PinVerifyResult {
  valid: boolean;
  locked?: boolean;
  lockout_remaining_seconds?: number;
  must_change?: boolean;
  message?: string;
}

// PIN status for UI
interface PinStatus {
  has_pin: boolean;
  is_locked: boolean;
  is_temporary: boolean;
  lockout_remaining_seconds?: number;
}

// Admin action log entry
interface PinAdminLogEntry {
  id: string;
  action_type: 'reset' | 'unlock' | 'set_temp';
  created_at: string;
}
```
