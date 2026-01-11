-- Migration 008: Migrate existing starters to pokemon_owned table
-- This migration moves existing starter_pokemon_id from trainers to the new pokemon_owned table

-- Migrate existing starter_pokemon_id to pokemon_owned
-- Only migrate if the trainer has a starter and doesn't already have an entry in pokemon_owned
INSERT INTO pokemon_owned (user_id, pokemon_id, level, is_active, is_starter, selected_moves)
SELECT
  t.id as user_id,
  t.starter_pokemon_id as pokemon_id,
  1 as level,
  true as is_active,
  true as is_starter,
  '[]'::jsonb as selected_moves
FROM trainers t
WHERE t.starter_pokemon_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM pokemon_owned po WHERE po.user_id = t.id AND po.is_starter = true
);

-- Create user_stats for existing users who don't have stats yet
INSERT INTO user_stats (user_id, money, items, battles_won, battles_lost, pokemon_captured)
SELECT
  t.id as user_id,
  100 as money,
  '{}'::jsonb as items,
  0 as battles_won,
  0 as battles_lost,
  0 as pokemon_captured
FROM trainers t
WHERE NOT EXISTS (
  SELECT 1 FROM user_stats us WHERE us.user_id = t.id
);

-- Note: We keep starter_pokemon_id in trainers table for backwards compatibility
-- It will be deprecated in future releases
