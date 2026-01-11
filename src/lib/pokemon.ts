import type { Pokemon } from './types';
import pokemonData from '@/data/pokemon.json';
import pokemonCleanedData from '../../docs/pokemon-cleaned.json';

// Create a map of SR values from cleaned data
interface CleanedPokemon {
  number: number;
  sr: number;
}
const srMap = new Map<number, number>(
  (pokemonCleanedData as CleanedPokemon[]).map(p => [p.number, p.sr])
);

// Cast the imported data to Pokemon[]
const allPokemon: Pokemon[] = pokemonData as Pokemon[];

// Pokemon with SR data for starter selection
export interface PokemonWithSR extends Pokemon {
  sr: number;
}

// Create Pokemon list with SR values
const pokemonWithSR: PokemonWithSR[] = allPokemon.map(p => ({
  ...p,
  sr: srMap.get(p.number) ?? 0,
}));

// Maximum SR for starter Pokemon
const MAX_STARTER_SR = 0.5;

/**
 * Get all Pokemon
 */
export function getPokemon(): Pokemon[] {
  return allPokemon;
}

/**
 * Get Pokemon filtered by type
 */
export function getPokemonByType(type: string): Pokemon[] {
  return allPokemon.filter(p =>
    p.types.some(t => t.toLowerCase() === type.toLowerCase())
  );
}

/**
 * Get all unique Pokemon types
 */
export function getUniqueTypes(): string[] {
  const types = new Set<string>();
  allPokemon.forEach(p => {
    p.types.forEach(t => types.add(t));
  });
  return Array.from(types).sort();
}

/**
 * Get a single Pokemon by its number
 */
export function getPokemonById(id: number): Pokemon | undefined {
  return allPokemon.find(p => p.number === id);
}

/**
 * Get Pokemon count
 */
export function getPokemonCount(): number {
  return allPokemon.length;
}

/**
 * Check if a Pokemon number is valid
 */
export function isValidPokemonId(id: number): boolean {
  return id >= 1 && id <= 151 && allPokemon.some(p => p.number === id);
}

/**
 * Get starter-eligible Pokemon (SR <= 0.5)
 */
export function getStarterPokemon(): PokemonWithSR[] {
  return pokemonWithSR.filter(p => p.sr <= MAX_STARTER_SR);
}

/**
 * Get all Pokemon with SR data
 */
export function getPokemonWithSR(): PokemonWithSR[] {
  return pokemonWithSR;
}

/**
 * Check if a Pokemon is eligible as starter
 */
export function isStarterEligible(id: number): boolean {
  const pokemon = pokemonWithSR.find(p => p.number === id);
  return pokemon ? pokemon.sr <= MAX_STARTER_SR : false;
}

/**
 * Get unique types from starter-eligible Pokemon
 */
export function getStarterTypes(): string[] {
  const types = new Set<string>();
  getStarterPokemon().forEach(p => {
    p.types.forEach(t => types.add(t));
  });
  return Array.from(types).sort();
}
