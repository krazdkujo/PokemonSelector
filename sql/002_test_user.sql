-- Insert test user with Mewtwo as starter Pokemon
-- Mewtwo is Pokemon #150

-- Delete existing test user if any, then insert fresh
DELETE FROM trainers WHERE LOWER(name) = 'test';

INSERT INTO trainers (name, role, starter_pokemon_id)
VALUES ('test', 'trainer', 150);
