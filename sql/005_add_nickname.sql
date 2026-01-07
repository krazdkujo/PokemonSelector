-- Migration: 005_add_nickname
-- Description: Add nickname column for trainer's Pokemon
-- Created: 2026-01-07

-- Add nullable nickname column with same constraints as name
ALTER TABLE trainers
ADD COLUMN IF NOT EXISTS starter_pokemon_nickname VARCHAR(20);

-- Add check constraint: if provided, must have at least 1 character after trim
ALTER TABLE trainers
ADD CONSTRAINT trainers_nickname_length
CHECK (char_length(trim(starter_pokemon_nickname)) >= 1 OR starter_pokemon_nickname IS NULL);

-- Note: updated_at will be automatically updated by existing trigger
