/**
 * Battle Logic Library
 *
 * Handles battle mechanics including RNG, round resolution, and wild Pokemon generation.
 */

import seedrandom from 'seedrandom';
import { getTypeEffectiveness, hasStabBonus, getEffectivenessLabel } from './type-chart';
import type { WildPokemon, BattleDifficulty, TypeEffectiveness, ZoneDifficulty, Zone } from './types';
import { getZoneById, getDifficultyConstraints } from './zones';

// Import Pokemon data
import pokemonData from '../../docs/pokemon-cleaned.json';

interface PokemonData {
  id: string;
  name: string;
  number: number;
  type: string[];
  sr: number;
  minLevel: number;
  media: {
    main: string;
    sprite: string;
  };
}

const allPokemon = pokemonData as PokemonData[];

/**
 * Create a seeded RNG for deterministic battle outcomes
 * @param battleId The battle UUID
 * @param roundNumber The current round number
 * @returns A seeded PRNG
 */
export function createBattleRng(battleId: string, roundNumber: number): seedrandom.PRNG {
  return seedrandom(`${battleId}:${roundNumber}`);
}

/**
 * Roll a d20 using the seeded RNG
 * @param rng The seeded PRNG
 * @returns A number between 1 and 20
 */
export function rollD20(rng: seedrandom.PRNG): number {
  return Math.floor(rng() * 20) + 1;
}

/**
 * Difficulty modifiers for wild Pokemon level generation
 */
const DIFFICULTY_LEVEL_MODIFIER: Record<BattleDifficulty, { min: number; max: number }> = {
  easy: { min: -2, max: 0 },
  normal: { min: -1, max: 1 },
  difficult: { min: 0, max: 2 },
};

/**
 * Difficulty modifiers for SR filter
 */
const DIFFICULTY_SR_RANGE: Record<BattleDifficulty, { min: number; max: number }> = {
  easy: { min: 0, max: 2 },
  normal: { min: 0, max: 5 },
  difficult: { min: 2, max: 10 },
};

/**
 * Generate a wild Pokemon for battle
 * @param difficulty Battle difficulty
 * @param playerLevel Player's active Pokemon level
 * @param seed Random seed for deterministic generation
 * @returns A WildPokemon object
 */
export function generateWildPokemon(
  difficulty: BattleDifficulty,
  playerLevel: number,
  seed: string
): WildPokemon {
  const rng = seedrandom(seed);

  // Filter Pokemon by SR range based on difficulty
  const srRange = DIFFICULTY_SR_RANGE[difficulty];
  const eligiblePokemon = allPokemon.filter(
    p => p.sr >= srRange.min && p.sr <= srRange.max
  );

  if (eligiblePokemon.length === 0) {
    // Fallback to all Pokemon if filter is too restrictive
    const fallback = allPokemon[Math.floor(rng() * allPokemon.length)];
    return createWildPokemonFromData(fallback, playerLevel, difficulty, rng);
  }

  // Select a random Pokemon from eligible pool
  const selected = eligiblePokemon[Math.floor(rng() * eligiblePokemon.length)];
  return createWildPokemonFromData(selected, playerLevel, difficulty, rng);
}

function createWildPokemonFromData(
  data: PokemonData,
  playerLevel: number,
  difficulty: BattleDifficulty,
  rng: seedrandom.PRNG
): WildPokemon {
  // Calculate level based on player level and difficulty
  const levelMod = DIFFICULTY_LEVEL_MODIFIER[difficulty];
  const levelOffset = Math.floor(rng() * (levelMod.max - levelMod.min + 1)) + levelMod.min;
  const level = Math.max(1, Math.min(10, playerLevel + levelOffset));

  return {
    pokemon_id: data.number,
    name: data.name,
    level,
    sr: data.sr,
    types: data.type,
    current_hp: 100, // Simplified HP system
    sprite_url: data.media.sprite,
  };
}

/**
 * Context for calculating round win chance
 */
export interface RoundContext {
  playerLevel: number;
  playerSR: number;
  playerTypes: string[];
  wildLevel: number;
  wildSR: number;
  wildTypes: string[];
  moveType: string;
}

/**
 * Result of round calculation
 */
export interface RoundCalculation {
  baseChance: number;
  levelBonus: number;
  srBonus: number;
  typeEffectiveness: number;
  stabBonus: number;
  totalChance: number;
  effectivenessLabel: TypeEffectiveness;
  hasStab: boolean;
}

/**
 * Calculate the player's chance to win a round
 * Base chance is 50%, modified by level difference, SR difference, type effectiveness, and STAB
 *
 * @param ctx Round context with all relevant Pokemon data
 * @returns Calculation details including total win chance
 */
export function calculateRoundWinChance(ctx: RoundContext): RoundCalculation {
  const baseChance = 0.5; // 50% base

  // Level difference: +/- 5% per level difference (max +/- 25%)
  const levelDiff = ctx.playerLevel - ctx.wildLevel;
  const levelBonus = Math.max(-0.25, Math.min(0.25, levelDiff * 0.05));

  // SR difference: +/- 2% per SR point (max +/- 20%)
  const srDiff = ctx.playerSR - ctx.wildSR;
  const srBonus = Math.max(-0.20, Math.min(0.20, srDiff * 0.02));

  // Type effectiveness
  const typeMultiplier = getTypeEffectiveness(ctx.moveType, ctx.wildTypes);
  let typeBonus = 0;
  if (typeMultiplier >= 2) {
    typeBonus = 0.15; // Super effective: +15%
  } else if (typeMultiplier < 1 && typeMultiplier > 0) {
    typeBonus = -0.10; // Not very effective: -10%
  } else if (typeMultiplier === 0) {
    typeBonus = -0.30; // Immune: -30%
  }

  // STAB bonus
  const hasStab = hasStabBonus(ctx.moveType, ctx.playerTypes);
  const stabBonus = hasStab ? 0.10 : 0; // +10% if STAB

  // Total chance (clamped between 10% and 90%)
  const totalChance = Math.max(0.10, Math.min(0.90,
    baseChance + levelBonus + srBonus + typeBonus + stabBonus
  ));

  return {
    baseChance,
    levelBonus,
    srBonus,
    typeEffectiveness: typeMultiplier,
    stabBonus,
    totalChance,
    effectivenessLabel: getEffectivenessLabel(typeMultiplier),
    hasStab,
  };
}

/**
 * Resolve a battle round
 * @param roll The d20 roll result (1-20)
 * @param winChance The calculated win chance (0-1)
 * @returns true if the player wins the round
 */
export function resolveRound(roll: number, winChance: number): boolean {
  // Convert win chance to a DC (difficulty class)
  // DC = 21 - (winChance * 20)
  // e.g., 50% chance = DC 11, 90% chance = DC 3, 10% chance = DC 19
  const dc = Math.round(21 - (winChance * 20));
  return roll >= dc;
}

/**
 * Generate a battle seed
 * @returns A unique seed string for the battle
 */
export function generateBattleSeed(): string {
  return `battle_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get Pokemon data by ID
 * @param pokemonId The Pokemon number
 * @returns Pokemon data or undefined
 */
export function getPokemonById(pokemonId: number): PokemonData | undefined {
  return allPokemon.find(p => p.number === pokemonId);
}

/**
 * Get all Pokemon data
 * @returns All Pokemon
 */
export function getAllPokemon(): PokemonData[] {
  return allPokemon;
}

/**
 * Get starter-eligible Pokemon (SR <= 0.5)
 * @returns Pokemon eligible for starter selection
 */
export function getStarterPokemon(): PokemonData[] {
  return allPokemon.filter(p => p.sr <= 0.5);
}

// ============================================
// Zone-based Battle Functions (006-combat-zones)
// ============================================

/**
 * Filter Pokemon by zone types
 * A Pokemon matches if ANY of its types are in the zone's type list
 */
export function filterPokemonByZone(zone: Zone): PokemonData[] {
  return allPokemon.filter(p =>
    p.type.some(t => zone.types.includes(t.toLowerCase()))
  );
}

/**
 * Filter Pokemon by zone types and difficulty constraints
 */
export function filterPokemonByZoneAndDifficulty(
  zoneId: string,
  difficulty: ZoneDifficulty,
  playerSR: number
): PokemonData[] {
  const zone = getZoneById(zoneId);
  if (!zone) return [];

  const constraints = getDifficultyConstraints(difficulty);
  const maxSR = playerSR + constraints.maxSrOffset;

  // Filter by zone types first
  const zonePokemon = filterPokemonByZone(zone);

  // Then filter by SR constraints
  return zonePokemon.filter(p => p.sr <= maxSR);
}

/**
 * Generate a wild Pokemon for zone-based battle
 * @param zoneId Zone identifier
 * @param difficulty Zone difficulty level
 * @param playerLevel Player's active Pokemon level
 * @param playerSR Player's active Pokemon SR
 * @param seed Random seed for deterministic generation
 * @returns A WildPokemon object matching zone and difficulty constraints
 */
export function generateZoneWildPokemon(
  zoneId: string,
  difficulty: ZoneDifficulty,
  playerLevel: number,
  playerSR: number,
  seed: string
): WildPokemon {
  const rng = seedrandom(seed);
  const zone = getZoneById(zoneId);

  // Get eligible Pokemon for this zone and difficulty
  let eligiblePokemon = filterPokemonByZoneAndDifficulty(zoneId, difficulty, playerSR);

  // Fallback 1: If no Pokemon match SR constraint, relax SR but keep zone
  if (eligiblePokemon.length === 0 && zone) {
    eligiblePokemon = filterPokemonByZone(zone);
  }

  // Fallback 2: If still no Pokemon, use any Pokemon
  if (eligiblePokemon.length === 0) {
    eligiblePokemon = allPokemon;
  }

  // Select a random Pokemon from eligible pool
  const selected = eligiblePokemon[Math.floor(rng() * eligiblePokemon.length)];

  // Calculate level based on difficulty constraints
  const levelOffset = calculateZoneLevelOffset(difficulty, rng);
  const wildLevel = Math.max(1, playerLevel + levelOffset);

  return {
    pokemon_id: selected.number,
    name: selected.name,
    level: wildLevel,
    sr: selected.sr,
    types: selected.type,
    current_hp: 100,
    sprite_url: selected.media.sprite,
  };
}

/**
 * Calculate level offset based on zone difficulty
 */
function calculateZoneLevelOffset(difficulty: ZoneDifficulty, rng: seedrandom.PRNG): number {
  const constraints = getDifficultyConstraints(difficulty);

  // Handle -Infinity for easy mode (level <= player level)
  const minOffset = constraints.minLevelOffset === -Infinity ? -3 : constraints.minLevelOffset;
  const maxOffset = constraints.maxLevelOffset;

  // Random offset within range
  const range = maxOffset - minOffset + 1;
  return Math.floor(rng() * range) + minOffset;
}

/**
 * Get example Pokemon for a zone and difficulty (for preview)
 * @param zoneId Zone identifier
 * @param difficulty Zone difficulty level
 * @param playerSR Player's active Pokemon SR (for SR filtering)
 * @param count Number of examples to return
 * @returns Array of Pokemon names
 */
export function getZoneExamplePokemon(
  zoneId: string,
  difficulty: ZoneDifficulty,
  playerSR: number,
  count: number = 3
): string[] {
  const eligible = filterPokemonByZoneAndDifficulty(zoneId, difficulty, playerSR);

  // Sort by SR to show representative Pokemon
  const sorted = [...eligible].sort((a, b) => a.sr - b.sr);

  // Take evenly spaced examples
  const examples: string[] = [];
  const step = Math.max(1, Math.floor(sorted.length / count));

  for (let i = 0; i < count && i * step < sorted.length; i++) {
    examples.push(sorted[i * step].name);
  }

  return examples;
}

/**
 * Count Pokemon available for a zone and difficulty
 */
export function countZonePokemon(
  zoneId: string,
  difficulty: ZoneDifficulty,
  playerSR: number
): number {
  return filterPokemonByZoneAndDifficulty(zoneId, difficulty, playerSR).length;
}
