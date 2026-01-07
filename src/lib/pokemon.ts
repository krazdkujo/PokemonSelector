import type { Pokemon } from './types';
import pokemonData from '@/data/pokemon.json';

// Cast the imported data to Pokemon[]
const allPokemon: Pokemon[] = pokemonData as Pokemon[];

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
