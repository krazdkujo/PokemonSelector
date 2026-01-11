-- Migration 006: Create battle_rounds table
-- Tracks individual round results for replay and auditing

CREATE TABLE IF NOT EXISTS battle_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL CHECK (round_number >= 1 AND round_number <= 5),
  player_move VARCHAR(50) NOT NULL,
  winner VARCHAR(20) NOT NULL,
  roll INTEGER NOT NULL,
  base_chance DECIMAL(5,2) NOT NULL,
  type_bonus DECIMAL(5,2) DEFAULT 0,
  stab_bonus DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for battle lookups
CREATE INDEX IF NOT EXISTS idx_battle_rounds_battle_id ON battle_rounds(battle_id);

-- Enable Row Level Security
ALTER TABLE battle_rounds ENABLE ROW LEVEL SECURITY;

-- Allow all operations (auth handled by API middleware with secret keys)
DROP POLICY IF EXISTS "Allow all operations" ON battle_rounds;
CREATE POLICY "Allow all operations" ON battle_rounds
  FOR ALL
  USING (true)
  WITH CHECK (true);
