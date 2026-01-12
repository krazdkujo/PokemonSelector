/**
 * Evolution Utility Library
 *
 * Handles Pokemon evolution eligibility, threshold calculation, and evolution execution.
 */

import pokemonData from '../../docs/pokemon-cleaned.json';
import type { EvolutionInfo } from './types';

interface PokemonDataEntry {
  id: string;
  name: string;
  number: number;
  type: string[];
  evolution: string;
  media: {
    main: string;
    sprite: string;
  };
}

const allPokemon = pokemonData as PokemonDataEntry[];

/**
 * Parse evolution stage from string like "Stage 2 of 3"
 * @param evolutionString Evolution string from Pokemon data
 * @returns Object with stage and total, or null if invalid
 */
export function parseEvolutionStage(evolutionString: string): { stage: number; total: number } | null {
  const match = evolutionString.match(/Stage (\d+) of (\d+)/);
  if (!match) {
    return null;
  }
  return {
    stage: parseInt(match[1], 10),
    total: parseInt(match[2], 10),
  };
}

/**
 * Get the level threshold at which a Pokemon can evolve
 * @param stage Current evolution stage (1, 2, or 3)
 * @param totalStages Total stages in evolution chain (1, 2, or 3)
 * @returns Level threshold for evolution, or null if cannot evolve
 */
export function getEvolutionThreshold(stage: number, totalStages: number): number | null {
  // Final stage or single-stage Pokemon cannot evolve
  if (stage >= totalStages) return null;
  if (totalStages === 1) return null;

  // 2-stage Pokemon: evolve at level 5
  if (totalStages === 2) return 5;

  // 3-stage Pokemon
  if (totalStages === 3) {
    if (stage === 1) return 3; // First evolution at level 3
    if (stage === 2) return 6; // Second evolution at level 6
  }

  return null;
}

/**
 * Get the next evolution for a Pokemon
 * @param pokemonId Current Pokemon number
 * @returns Next evolution info or null if at final stage
 */
export function getNextEvolution(pokemonId: number): { id: number; name: string } | null {
  const pokemon = allPokemon.find(p => p.number === pokemonId);
  if (!pokemon) return null;

  const stages = parseEvolutionStage(pokemon.evolution);
  if (!stages || stages.stage >= stages.total) {
    return null; // Already at final stage or no evolution
  }

  // Next evolution is the next sequential Pokemon number (Gen 1 pattern)
  const nextPokemon = allPokemon.find(p => p.number === pokemonId + 1);
  if (!nextPokemon) return null;

  // Verify it's actually the next evolution (same chain)
  const nextStages = parseEvolutionStage(nextPokemon.evolution);
  if (!nextStages || nextStages.total !== stages.total || nextStages.stage !== stages.stage + 1) {
    return null;
  }

  return {
    id: nextPokemon.number,
    name: nextPokemon.name,
  };
}

/**
 * Check if a Pokemon is eligible for evolution
 * @param pokemonId Pokemon number
 * @param level Current level
 * @returns EvolutionInfo object with eligibility details
 */
export function checkEvolutionEligibility(pokemonId: number, level: number): EvolutionInfo {
  const pokemon = allPokemon.find(p => p.number === pokemonId);
  if (!pokemon) {
    return {
      canEvolve: false,
      currentStage: 1,
      totalStages: 1,
      evolvesAtLevel: null,
      nextEvolutionId: null,
      nextEvolutionName: null,
    };
  }

  const stages = parseEvolutionStage(pokemon.evolution);
  if (!stages) {
    return {
      canEvolve: false,
      currentStage: 1,
      totalStages: 1,
      evolvesAtLevel: null,
      nextEvolutionId: null,
      nextEvolutionName: null,
    };
  }

  const threshold = getEvolutionThreshold(stages.stage, stages.total);
  const nextEvolution = getNextEvolution(pokemonId);
  const canEvolve = threshold !== null && level >= threshold && nextEvolution !== null;

  return {
    canEvolve,
    currentStage: stages.stage,
    totalStages: stages.total,
    evolvesAtLevel: threshold,
    nextEvolutionId: nextEvolution?.id ?? null,
    nextEvolutionName: nextEvolution?.name ?? null,
  };
}

/**
 * Get Pokemon data by ID
 * @param pokemonId Pokemon number
 * @returns Pokemon data entry or null
 */
export function getPokemonById(pokemonId: number): PokemonDataEntry | null {
  return allPokemon.find(p => p.number === pokemonId) ?? null;
}

/**
 * Get sprite URL for a Pokemon
 * @param pokemonId Pokemon number
 * @returns Sprite URL or empty string
 */
export function getPokemonSpriteUrl(pokemonId: number): string {
  const pokemon = getPokemonById(pokemonId);
  return pokemon?.media.sprite ?? '';
}
