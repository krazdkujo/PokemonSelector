-- Migration: Add zone column to battles table
-- Feature: 006-combat-zones
-- Date: 2026-01-11

-- Add nullable zone column for backward compatibility
-- Existing battles without zone will show as "Random" in UI
ALTER TABLE battles ADD COLUMN IF NOT EXISTS zone TEXT;

-- Add comment for documentation
COMMENT ON COLUMN battles.zone IS 'Zone ID for zone-based battles (jungle, ocean, volcano, power-plant, haunted-tower, frozen-cave, dojo, dragon-shrine). NULL for legacy random battles.';

-- No index needed as we don't query by zone frequently
-- If needed later: CREATE INDEX idx_battles_zone ON battles(zone);
