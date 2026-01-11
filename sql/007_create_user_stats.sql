-- Migration 007: Create user_stats table
-- Aggregated user statistics and economy data

CREATE TABLE IF NOT EXISTS user_stats (
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

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- Enable Row Level Security
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Allow all operations (auth handled by API middleware with secret keys)
DROP POLICY IF EXISTS "Allow all operations" ON user_stats;
CREATE POLICY "Allow all operations" ON user_stats
  FOR ALL
  USING (true)
  WITH CHECK (true);
