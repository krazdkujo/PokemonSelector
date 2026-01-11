/**
 * Experience and Leveling Utility Library
 *
 * Handles experience calculations, level-up logic, and display formatting.
 * XP Formula: max(1, wildPokemonLevel - playerPokemonLevel)
 * Level Threshold: (currentLevel * 2) + 10
 */

import type { PokemonOwned, ExperienceInfo } from './types';

/**
 * Result of applying experience to a Pokemon
 */
export interface LevelUpResult {
  newLevel: number;
  newExperience: number;
  levelsGained: number;
}

/**
 * Maximum level a Pokemon can reach
 */
export const MAX_LEVEL = 10;

/**
 * Calculate experience gained from defeating a wild Pokemon
 * Formula: max(1, wildPokemonLevel - playerPokemonLevel)
 *
 * @param playerLevel - The player Pokemon's current level
 * @param wildLevel - The defeated wild Pokemon's level
 * @returns Experience points gained (minimum 1)
 */
export function calculateExperienceGained(playerLevel: number, wildLevel: number): number {
  const diff = wildLevel - playerLevel;
  return Math.max(1, diff);
}

/**
 * Calculate experience threshold required to level up
 * Formula: (currentLevel * 2) + 10
 *
 * @param level - Current level
 * @returns Experience points needed to reach the next level
 */
export function calculateExperienceThreshold(level: number): number {
  return (level * 2) + 10;
}

/**
 * Apply experience to a Pokemon and handle level-ups
 * Supports multiple level-ups if XP exceeds multiple thresholds
 *
 * @param pokemon - The Pokemon receiving experience
 * @param xpGained - Amount of experience to add
 * @returns Result containing new level, new experience, and levels gained
 */
export function applyExperience(pokemon: PokemonOwned, xpGained: number): LevelUpResult {
  let level = pokemon.level;
  let experience = (pokemon.experience || 0) + xpGained;
  let levelsGained = 0;

  // Process level-ups while below max level and XP exceeds threshold
  while (level < MAX_LEVEL) {
    const threshold = calculateExperienceThreshold(level);
    if (experience >= threshold) {
      experience -= threshold;
      level += 1;
      levelsGained += 1;
    } else {
      break;
    }
  }

  // Cap at max level
  if (level >= MAX_LEVEL) {
    level = MAX_LEVEL;
    // Experience can still accumulate but won't cause level-ups
  }

  return {
    newLevel: level,
    newExperience: experience,
    levelsGained,
  };
}

/**
 * Get experience required for the current level
 * Alias for calculateExperienceThreshold
 *
 * @param level - Current level
 * @returns Experience points needed to reach next level
 */
export function getExperienceRequired(level: number): number {
  return calculateExperienceThreshold(level);
}

/**
 * Get experience information for display
 *
 * @param pokemon - Pokemon to get experience info for
 * @returns ExperienceInfo object with current, required, and max level status
 */
export function getExperienceInfo(pokemon: PokemonOwned): ExperienceInfo {
  const isMaxLevel = pokemon.level >= MAX_LEVEL;
  return {
    current: pokemon.experience || 0,
    required: isMaxLevel ? 0 : calculateExperienceThreshold(pokemon.level),
    isMaxLevel,
  };
}

/**
 * Format experience for display
 *
 * @param pokemon - Pokemon to format experience for
 * @returns Formatted string like "5 / 12 XP" or "MAX LEVEL"
 */
export function formatExperienceDisplay(pokemon: PokemonOwned): string {
  if (pokemon.level >= MAX_LEVEL) {
    return 'MAX LEVEL';
  }
  const current = pokemon.experience || 0;
  const required = calculateExperienceThreshold(pokemon.level);
  return `${current} / ${required} XP`;
}

/**
 * Calculate experience to next level
 *
 * @param pokemon - Pokemon to calculate for
 * @returns Experience points needed to reach next level, or 0 if max level
 */
export function getExperienceToNext(pokemon: PokemonOwned): number {
  if (pokemon.level >= MAX_LEVEL) {
    return 0;
  }
  const threshold = calculateExperienceThreshold(pokemon.level);
  return threshold - (pokemon.experience || 0);
}
