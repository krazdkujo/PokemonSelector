/**
 * Pokedex API Route
 *
 * GET: Returns all 151 Pokemon with seen/caught status for the user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiError } from '@/lib/types';

// Import Pokemon data
import pokemonData from '../../../../docs/pokemon-cleaned.json';

interface PokemonEntry {
  number: number;
  name: string;
  types: string[];
  sprite_url: string;
  status: 'unknown' | 'seen' | 'caught';
}

/**
 * GET /api/pokedex
 * Returns all 151 Pokemon with seen/caught status
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get trainer ID from session cookie or X-User-ID header
    const trainerId = request.headers.get('X-User-ID') || request.cookies.get('trainer_id')?.value;

    if (!trainerId) {
      const error: ApiError = {
        error: 'UNAUTHORIZED',
        message: 'Authentication required',
      };
      return NextResponse.json(error, { status: 401 });
    }

    // Get all caught Pokemon IDs for this user
    const { data: ownedPokemon } = await supabase
      .from('pokemon_owned')
      .select('pokemon_id')
      .eq('user_id', trainerId);

    const caughtIds = new Set((ownedPokemon || []).map(p => p.pokemon_id));

    // Get all seen Pokemon IDs from battles (wild Pokemon encountered)
    const { data: battles } = await supabase
      .from('battles')
      .select('wild_pokemon')
      .eq('user_id', trainerId);

    const seenIds = new Set<number>();
    (battles || []).forEach(battle => {
      if (battle.wild_pokemon?.pokemon_id) {
        seenIds.add(battle.wild_pokemon.pokemon_id);
      }
    });

    // Build Pokedex entries for all 151 Pokemon
    interface PokemonData {
      number: number;
      name: string;
      type: string[];
      media: { sprite: string };
    }
    const pokedex: PokemonEntry[] = (pokemonData as PokemonData[]).map(pokemon => {
      let status: 'unknown' | 'seen' | 'caught' = 'unknown';

      if (caughtIds.has(pokemon.number)) {
        status = 'caught';
      } else if (seenIds.has(pokemon.number)) {
        status = 'seen';
      }

      return {
        number: pokemon.number,
        name: pokemon.name,
        types: pokemon.type,
        sprite_url: pokemon.media.sprite,
        status,
      };
    });

    // Sort by Pokemon number
    pokedex.sort((a, b) => a.number - b.number);

    // Calculate stats
    const stats = {
      total: pokedex.length,
      caught: pokedex.filter(p => p.status === 'caught').length,
      seen: pokedex.filter(p => p.status === 'seen' || p.status === 'caught').length,
    };

    return NextResponse.json({
      pokedex,
      stats,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    const error: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(error, { status: 500 });
  }
}
