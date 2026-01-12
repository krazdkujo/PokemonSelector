/**
 * Script to fix can_evolve flag for existing Pokemon
 * Run with: node scripts/fix-evolution-eligibility.js
 */

const { createClient } = require('@supabase/supabase-js');
const pokemonData = require('../docs/pokemon-cleaned.json');

const supabase = createClient(
  'https://umidriznlehehswmdloy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaWRyaXpubGVoZWhzd21kbG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzEwNzY0OCwiZXhwIjoyMDgyNjgzNjQ4fQ.Otc2n95iavx7SC5K5aTCBdwkX0xqlsgva7ZQg3gePIM'
);

function parseEvolutionStage(evolutionString) {
  const match = evolutionString.match(/Stage (\d+) of (\d+)/);
  if (!match) return null;
  return {
    stage: parseInt(match[1], 10),
    total: parseInt(match[2], 10),
  };
}

function getEvolutionThreshold(stage, totalStages) {
  if (stage >= totalStages) return null;
  if (totalStages === 1) return null;
  if (totalStages === 2) return 5;
  if (totalStages === 3) {
    if (stage === 1) return 3;
    if (stage === 2) return 6;
  }
  return null;
}

function getNextEvolution(pokemonId) {
  const pokemon = pokemonData.find(p => p.number === pokemonId);
  if (!pokemon) return null;

  const stages = parseEvolutionStage(pokemon.evolution);
  if (!stages || stages.stage >= stages.total) return null;

  const nextPokemon = pokemonData.find(p => p.number === pokemonId + 1);
  if (!nextPokemon) return null;

  const nextStages = parseEvolutionStage(nextPokemon.evolution);
  if (!nextStages || nextStages.total !== stages.total || nextStages.stage !== stages.stage + 1) {
    return null;
  }

  return { id: nextPokemon.number, name: nextPokemon.name };
}

function checkEvolutionEligibility(pokemonId, level) {
  const pokemon = pokemonData.find(p => p.number === pokemonId);
  if (!pokemon) return { canEvolve: false };

  const stages = parseEvolutionStage(pokemon.evolution);
  if (!stages) return { canEvolve: false };

  const threshold = getEvolutionThreshold(stages.stage, stages.total);
  const nextEvolution = getNextEvolution(pokemonId);
  const canEvolve = threshold !== null && level >= threshold && nextEvolution !== null;

  return {
    canEvolve,
    nextEvolutionId: nextEvolution?.id ?? null,
    nextEvolutionName: nextEvolution?.name ?? null,
    threshold
  };
}

async function fixExistingPokemon() {
  // Get all Pokemon
  const { data: allPokemon, error } = await supabase
    .from('pokemon_owned')
    .select('id, pokemon_id, level, can_evolve');

  if (error) {
    console.error('Error fetching Pokemon:', error.message);
    return;
  }

  console.log('Checking', allPokemon.length, 'Pokemon for evolution eligibility...');

  const toUpdate = [];

  for (const pokemon of allPokemon) {
    const eligibility = checkEvolutionEligibility(pokemon.pokemon_id, pokemon.level);
    if (eligibility.canEvolve && !pokemon.can_evolve) {
      toUpdate.push({
        id: pokemon.id,
        pokemon_id: pokemon.pokemon_id,
        level: pokemon.level,
        ...eligibility
      });
    }
  }

  if (toUpdate.length === 0) {
    console.log('No Pokemon need updating.');
    return;
  }

  console.log('Found', toUpdate.length, 'Pokemon that should be able to evolve:');
  for (const p of toUpdate) {
    console.log('  - Pokemon #' + p.pokemon_id + ' at level ' + p.level + ' -> can evolve to ' + p.nextEvolutionName);
  }

  // Update them
  for (const p of toUpdate) {
    const { error: updateError } = await supabase
      .from('pokemon_owned')
      .update({ can_evolve: true })
      .eq('id', p.id);

    if (updateError) {
      console.error('Failed to update Pokemon', p.id, ':', updateError.message);
    } else {
      console.log('Updated Pokemon #' + p.pokemon_id + ' - can_evolve set to true');
    }
  }

  console.log('Done!');
}

fixExistingPokemon();
