-- Migration: 003_allow_duplicate_pokemon
-- Description: Allow multiple trainers to select the same Pokemon species
-- Each trainer's Pokemon gets a unique instance UUID

-- Remove the unique constraint on starter_pokemon_id
ALTER TABLE trainers DROP CONSTRAINT IF EXISTS trainers_starter_pokemon_id_key;

-- Add a unique instance UUID for each trainer's Pokemon
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS starter_pokemon_uuid UUID;

-- Generate UUIDs for existing Pokemon selections
UPDATE trainers
SET starter_pokemon_uuid = uuid_generate_v4()
WHERE starter_pokemon_id IS NOT NULL AND starter_pokemon_uuid IS NULL;
