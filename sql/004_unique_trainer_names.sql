-- Migration: 004_unique_trainer_names
-- Description: Make trainer names unique (case-insensitive)

-- First, remove duplicate trainers (keep the one with a Pokemon, or the oldest)
DELETE FROM trainers t1
USING trainers t2
WHERE LOWER(t1.name) = LOWER(t2.name)
  AND t1.id <> t2.id
  AND (
    -- Keep the one with a Pokemon selected
    (t2.starter_pokemon_id IS NOT NULL AND t1.starter_pokemon_id IS NULL)
    OR
    -- If both have or both don't have Pokemon, keep the older one
    (
      ((t2.starter_pokemon_id IS NOT NULL AND t1.starter_pokemon_id IS NOT NULL)
       OR (t2.starter_pokemon_id IS NULL AND t1.starter_pokemon_id IS NULL))
      AND t1.created_at > t2.created_at
    )
  );

-- Create unique index on lowercase name
CREATE UNIQUE INDEX IF NOT EXISTS idx_trainers_name_unique ON trainers (LOWER(name));
