/**
 * Zone Configuration and Helper Functions
 *
 * Defines the 8 combat zones and their Pokemon type mappings,
 * plus difficulty constraints for zone-based encounters.
 */

import type { Zone, ZoneDifficulty, DifficultyConstraints, ZoneId } from './types';

// Zone configuration - 8 zones covering all 17 Pokemon types
export const ZONES: Zone[] = [
  {
    id: 'jungle',
    name: 'Jungle',
    description: 'Dense vegetation filled with bugs, plants, and venomous creatures',
    types: ['bug', 'grass', 'poison'],
    color: 'green'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Coastal and aquatic environments with sea creatures',
    types: ['water', 'flying', 'normal'],
    color: 'blue'
  },
  {
    id: 'volcano',
    name: 'Volcano',
    description: 'Volcanic terrain with fire and rock dwellers',
    types: ['fire', 'rock', 'ground'],
    color: 'red'
  },
  {
    id: 'power-plant',
    name: 'Power Plant',
    description: 'Industrial facilities housing electric and steel types',
    types: ['electric', 'steel', 'normal'],
    color: 'yellow'
  },
  {
    id: 'haunted-tower',
    name: 'Haunted Tower',
    description: 'Abandoned structures with supernatural presence',
    types: ['ghost', 'psychic', 'poison'],
    color: 'purple'
  },
  {
    id: 'frozen-cave',
    name: 'Frozen Cave',
    description: 'Frozen underground caverns with ice and rock types',
    types: ['ice', 'rock', 'ground'],
    color: 'cyan'
  },
  {
    id: 'dojo',
    name: 'Dojo',
    description: 'Martial arts training grounds with fighting spirit',
    types: ['fighting', 'normal', 'flying'],
    color: 'orange'
  },
  {
    id: 'dragon-shrine',
    name: 'Dragon Shrine',
    description: 'Ancient mystical location housing legendary creatures',
    types: ['dragon', 'fairy', 'psychic'],
    color: 'indigo'
  }
];

// Valid zone IDs for validation
export const VALID_ZONE_IDS: ZoneId[] = [
  'jungle',
  'ocean',
  'volcano',
  'power-plant',
  'haunted-tower',
  'frozen-cave',
  'dojo',
  'dragon-shrine'
];

// Difficulty constraints per spec
// Easy: Max +2 SR, same level or lower
// Medium: Max +5 SR, +0 to +3 levels
// Hard: Any SR, +4 to +6 levels
export const DIFFICULTY_CONSTRAINTS: Record<ZoneDifficulty, DifficultyConstraints> = {
  easy: {
    maxSrOffset: 2,
    minLevelOffset: -Infinity,
    maxLevelOffset: 0
  },
  medium: {
    maxSrOffset: 5,
    minLevelOffset: 0,
    maxLevelOffset: 3
  },
  hard: {
    maxSrOffset: Infinity,
    minLevelOffset: 4,
    maxLevelOffset: 6
  }
};

// Difficulty descriptions for UI
export const DIFFICULTY_DESCRIPTIONS: Record<ZoneDifficulty, string> = {
  easy: 'Pokemon at your level or lower, up to +2 SR above yours',
  medium: 'Pokemon 0-3 levels higher, up to +5 SR above yours',
  hard: 'Pokemon 4-6 levels higher, any SR - maximum challenge!'
};

/**
 * Get a zone by ID
 */
export function getZoneById(zoneId: string): Zone | undefined {
  return ZONES.find(z => z.id === zoneId);
}

/**
 * Get all zones
 */
export function getAllZones(): Zone[] {
  return ZONES;
}

/**
 * Check if a zone ID is valid
 */
export function isValidZoneId(zoneId: string): zoneId is ZoneId {
  return VALID_ZONE_IDS.includes(zoneId as ZoneId);
}

/**
 * Check if a difficulty is valid for zone battles
 */
export function isValidZoneDifficulty(difficulty: string): difficulty is ZoneDifficulty {
  return ['easy', 'medium', 'hard'].includes(difficulty);
}

/**
 * Get difficulty constraints
 */
export function getDifficultyConstraints(difficulty: ZoneDifficulty): DifficultyConstraints {
  return DIFFICULTY_CONSTRAINTS[difficulty];
}

/**
 * Get difficulty description for UI
 */
export function getDifficultyDescription(difficulty: ZoneDifficulty): string {
  return DIFFICULTY_DESCRIPTIONS[difficulty];
}

/**
 * Get zone types as a formatted string
 */
export function formatZoneTypes(zone: Zone): string {
  return zone.types.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
}

/**
 * Get Tailwind color classes for a zone
 */
export function getZoneColorClasses(zone: Zone): {
  bg: string;
  border: string;
  text: string;
  bgLight: string;
} {
  const colorMap: Record<string, { bg: string; border: string; text: string; bgLight: string }> = {
    green: { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-700', bgLight: 'bg-green-100' },
    blue: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-700', bgLight: 'bg-blue-100' },
    red: { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-700', bgLight: 'bg-red-100' },
    yellow: { bg: 'bg-yellow-500', border: 'border-yellow-500', text: 'text-yellow-700', bgLight: 'bg-yellow-100' },
    purple: { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-700', bgLight: 'bg-purple-100' },
    cyan: { bg: 'bg-cyan-500', border: 'border-cyan-500', text: 'text-cyan-700', bgLight: 'bg-cyan-100' },
    orange: { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-700', bgLight: 'bg-orange-100' },
    indigo: { bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-700', bgLight: 'bg-indigo-100' }
  };
  return colorMap[zone.color] || colorMap.blue;
}
