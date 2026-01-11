-- Migration 004: Create pokemon_owned table
-- Tracks Pokemon owned by users, including level, moves, and active status

CREATE TABLE IF NOT EXISTS pokemon_owned (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  pokemon_id INTEGER NOT NULL,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 10),
  selected_moves JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT false,
  is_starter BOOLEAN DEFAULT false,
  captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_pokemon_owned_user_id ON pokemon_owned(user_id);

-- Partial unique index to ensure only one active Pokemon per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_pokemon_owned_active ON pokemon_owned(user_id)
  WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE pokemon_owned ENABLE ROW LEVEL SECURITY;

-- Allow all operations (auth handled by API middleware with secret keys)
DROP POLICY IF EXISTS "Allow all operations" ON pokemon_owned;
CREATE POLICY "Allow all operations" ON pokemon_owned
  FOR ALL
  USING (true)
  WITH CHECK (true);
