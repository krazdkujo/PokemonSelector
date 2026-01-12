-- Migration: Add can_evolve column to pokemon_owned table
-- Feature: 012-pokemon-evolution
-- Date: 2026-01-11

ALTER TABLE pokemon_owned
ADD COLUMN can_evolve BOOLEAN DEFAULT false;

-- Note: Existing Pokemon will have can_evolve = false
-- Evolution eligibility will be calculated on next level-up
