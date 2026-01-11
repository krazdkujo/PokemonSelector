/**
 * Pokecenter API Route
 *
 * GET: Returns all Pokemon owned by the user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPokemonById } from '@/lib/battle';
import { getExperienceToNext } from '@/lib/experience';
import type { ApiError, PokemonOwnedWithDetails } from '@/lib/types';

/**
 * GET /api/pokecenter
 * Returns all Pokemon owned by the user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get trainer ID from session or API key auth
    const trainerId = request.headers.get('X-User-ID') || request.cookies.get('trainer_id')?.value;

    if (!trainerId) {
      const error: ApiError = {
        error: 'UNAUTHORIZED',
        message: 'Authentication required',
      };
      return NextResponse.json(error, { status: 401 });
    }

    // Fetch all owned Pokemon
    const { data: ownedPokemon, error: dbError } = await supabase
      .from('pokemon_owned')
      .select('*')
      .eq('user_id', trainerId)
      .order('captured_at', { ascending: true });

    if (dbError) {
      console.error('Database error:', dbError);
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to fetch Pokemon collection',
      };
      return NextResponse.json(error, { status: 500 });
    }

    // Enrich with Pokemon data
    const pokemonWithDetails: PokemonOwnedWithDetails[] = (ownedPokemon || []).map(pokemon => {
      const data = getPokemonById(pokemon.pokemon_id);
      return {
        ...pokemon,
        name: data?.name || 'Unknown',
        types: data?.type || [],
        sr: data?.sr || 0,
        sprite_url: data?.media.sprite || '',
        experience_to_next: getExperienceToNext(pokemon),
      };
    });

    // Find active Pokemon ID
    const activePokemon = pokemonWithDetails.find(p => p.is_active);

    return NextResponse.json({
      pokemon: pokemonWithDetails,
      active_pokemon_id: activePokemon?.id || null,
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
