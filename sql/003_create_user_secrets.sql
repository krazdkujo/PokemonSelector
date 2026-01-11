-- Migration 003: Create user_secrets table
-- Stores hashed API secret keys for authenticated API access

CREATE TABLE IF NOT EXISTS user_secrets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_secrets_user_id ON user_secrets(user_id);

-- Enable Row Level Security
ALTER TABLE user_secrets ENABLE ROW LEVEL SECURITY;

-- Allow all operations (auth handled by API middleware with secret keys)
DROP POLICY IF EXISTS "Allow all operations" ON user_secrets;
CREATE POLICY "Allow all operations" ON user_secrets
  FOR ALL
  USING (true)
  WITH CHECK (true);
