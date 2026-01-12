-- Migration 010: Add experience column to pokemon_owned
-- Tracks accumulated XP toward next level for owned Pokemon

ALTER TABLE pokemon_owned
ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0 CHECK (experience >= 0);

-- Add comment for documentation
COMMENT ON COLUMN pokemon_owned.experience IS 'Accumulated experience points toward next level. Level-up threshold: (level * 2) + 10';
