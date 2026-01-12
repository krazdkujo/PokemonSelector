-- Migration: 011_add_pin_fields
-- Description: Add PIN authentication columns to trainers table and create audit log
-- Feature: 013-pin-auth

-- ============================================
-- Part 1: Add PIN-related columns to trainers table
-- ============================================

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

-- ============================================
-- Part 2: Create minimal audit log for PIN admin actions
-- ============================================

CREATE TABLE IF NOT EXISTS pin_admin_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('reset', 'unlock', 'set_temp')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS with open policy (matches existing pattern)
ALTER TABLE pin_admin_log ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists and recreate
DROP POLICY IF EXISTS "Allow all operations" ON pin_admin_log;
CREATE POLICY "Allow all operations" ON pin_admin_log
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE pin_admin_log IS 'Minimal audit log for PIN admin actions - no user details per privacy requirements';
