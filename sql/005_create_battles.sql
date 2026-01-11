-- Migration 005: Create battles table
-- Tracks active and completed battle encounters

CREATE TABLE IF NOT EXISTS battles (
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

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_battles_user_id ON battles(user_id);

-- Partial unique index to ensure only one active battle per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_battles_active ON battles(user_id)
  WHERE status = 'active';

-- Enable Row Level Security
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;

-- Allow all operations (auth handled by API middleware with secret keys)
DROP POLICY IF EXISTS "Allow all operations" ON battles;
CREATE POLICY "Allow all operations" ON battles
  FOR ALL
  USING (true)
  WITH CHECK (true);
