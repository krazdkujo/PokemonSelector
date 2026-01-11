/**
 * Moves Utility Library
 *
 * Handles move availability and selection for Pokemon.
 */

// Import Pokemon and moves data
import pokemonData from '../../docs/pokemon-cleaned.json';
import movesData from '../../docs/moves-cleaned.json';
import type { Move } from './types';

interface PokemonDataWithMoves {
  id: string;
  name: string;
  number: number;
  type: string[];
  moves: {
    start?: string[];
    level2?: string[];
    level6?: string[];
    level10?: string[];
    level14?: string[];
    level18?: string[];
  };
  evolution: string;
}

interface MoveData {
  id: string;
  name: string;
  type: string;
  flavor?: string;
  description?: string;
}

const allPokemon = pokemonData as PokemonDataWithMoves[];
const allMoves = movesData as MoveData[];

/**
 * All move tiers available for Pokemon
 * Note: Level filtering has been removed - all moves are now available regardless of level
 */
const ALL_MOVE_TIERS: string[] = ['start', 'level2', 'level6', 'level10', 'level14', 'level18'];

/**
 * Get the pre-evolution Pokemon for inheritance
 * @param pokemon Current Pokemon data
 * @returns Pre-evolution Pokemon data or null
 */
function getPreEvolution(pokemon: PokemonDataWithMoves): PokemonDataWithMoves | null {
  // Parse evolution stage from string like "Stage 2 of 3"
  const match = pokemon.evolution.match(/Stage (\d+) of (\d+)/);
  if (!match || match[1] === '1') {
    return null; // First stage or no evolution chain
  }

  // Find the previous stage based on number (simple heuristic)
  // For Gen 1, evolutions are typically sequential (e.g., 1->2->3, 4->5->6)
  const prevNumber = pokemon.number - 1;
  const prevPokemon = allPokemon.find(p => p.number === prevNumber);

  // Verify it's actually a pre-evolution (same evolution line)
  if (prevPokemon) {
    const prevMatch = prevPokemon.evolution.match(/Stage (\d+) of (\d+)/);
    if (prevMatch && parseInt(prevMatch[2]) === parseInt(match[2])) {
      return prevPokemon;
    }
  }

  return null;
}

/**
 * Collect all move IDs available to a Pokemon, including evolution inheritance
 * Note: All moves are available regardless of level (level filtering removed)
 * @param pokemon Pokemon data
 * @returns Array of move IDs
 */
function collectMoveIds(pokemon: PokemonDataWithMoves): string[] {
  const moveIds = new Set<string>();

  // Add ALL moves from current Pokemon (no level filtering)
  for (const tier of ALL_MOVE_TIERS) {
    const tierMoves = pokemon.moves[tier as keyof typeof pokemon.moves];
    if (tierMoves) {
      tierMoves.forEach(m => moveIds.add(m));
    }
  }

  // Add inherited moves from pre-evolution (full moveset)
  const preEvo = getPreEvolution(pokemon);
  if (preEvo) {
    // Pre-evolution contributes all its moves
    for (const tier of ALL_MOVE_TIERS) {
      const tierMoves = preEvo.moves[tier as keyof typeof preEvo.moves];
      if (tierMoves) {
        tierMoves.forEach(m => moveIds.add(m));
      }
    }
  }

  return Array.from(moveIds);
}

/**
 * Get all available moves for a Pokemon
 * Note: Returns ALL learnable moves regardless of level
 * @param pokemonId Pokemon number
 * @returns Array of Move objects
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getAvailableMoves(pokemonId: number, _level?: number): Move[] {
  const pokemon = allPokemon.find(p => p.number === pokemonId);
  if (!pokemon) {
    return [];
  }

  const moveIds = collectMoveIds(pokemon);

  const moves: Move[] = [];
  for (const id of moveIds) {
    const moveData = allMoves.find(m => m.id === id);
    if (moveData) {
      moves.push({
        id: moveData.id,
        name: moveData.name,
        type: moveData.type,
        description: moveData.flavor || moveData.description,
      });
    }
  }
  return moves;
}

/**
 * Validate that selected moves are available to the Pokemon
 * Note: Validates against full move pool (no level filtering)
 * @param pokemonId Pokemon number
 * @param _level Current level (kept for API compatibility, not used)
 * @param selectedMoves Array of selected move IDs
 * @returns Object with valid flag and invalid move IDs
 */
export function validateSelectedMoves(
  pokemonId: number,
  _level: number,
  selectedMoves: string[]
): { valid: boolean; invalidMoves: string[] } {
  if (selectedMoves.length !== 4) {
    return { valid: false, invalidMoves: [] };
  }

  const availableMoveIds = getAvailableMoves(pokemonId).map(m => m.id);
  const invalidMoves = selectedMoves.filter(id => !availableMoveIds.includes(id));

  return {
    valid: invalidMoves.length === 0,
    invalidMoves,
  };
}

/**
 * Get move data by ID
 * @param moveId Move ID string
 * @returns Move data or undefined
 */
export function getMoveById(moveId: string): Move | undefined {
  const moveData = allMoves.find(m => m.id === moveId);
  if (!moveData) {
    return undefined;
  }
  return {
    id: moveData.id,
    name: moveData.name,
    type: moveData.type,
    description: moveData.flavor || moveData.description,
  };
}

/**
 * Get default moves for a Pokemon (first 4 available)
 * @param pokemonId Pokemon number
 * @returns Array of 4 move IDs
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getDefaultMoves(pokemonId: number, _level?: number): string[] {
  const available = getAvailableMoves(pokemonId);
  return available.slice(0, 4).map(m => m.id);
}
