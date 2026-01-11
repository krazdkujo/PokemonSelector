import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPokemonById } from '@/lib/battle';
import type { ApiError } from '@/lib/types';

/**
 * External API endpoint for authenticated users to retrieve their trainer data.
 *
 * Headers required:
 * - X-API-Key: User's personal secret key (obtained from dashboard)
 *
 * The middleware validates the API key and injects X-User-ID.
 *
 * Returns:
 * - 200: Trainer data with active Pokemon details
 * - 401: Invalid or missing API key
 * - 404: Trainer not found
 * - 500: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID from middleware-injected header
    const userId = request.headers.get('X-User-ID');

    if (!userId) {
      const error: ApiError = {
        error: 'UNAUTHORIZED',
        message: 'API key required. Include X-API-Key header.',
      };
      return NextResponse.json(error, { status: 401 });
    }

    const supabase = await createClient();

    // Get trainer data
    const { data: trainer, error: trainerError } = await supabase
      .from('trainers')
      .select('id, name, role, created_at')
      .eq('id', userId)
      .single();

    if (trainerError || !trainer) {
      const error: ApiError = {
        error: 'TRAINER_NOT_FOUND',
        message: 'Trainer not found',
      };
      return NextResponse.json(error, { status: 404 });
    }

    // Get active Pokemon
    const { data: activePokemon } = await supabase
      .from('pokemon_owned')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    let pokemon = null;
    if (activePokemon) {
      const pokemonData = getPokemonById(activePokemon.pokemon_id);
      if (pokemonData) {
        pokemon = {
          id: activePokemon.id,
          pokemon_id: activePokemon.pokemon_id,
          name: pokemonData.name,
          types: pokemonData.type,
          level: activePokemon.level,
          sr: pokemonData.sr,
          is_starter: activePokemon.is_starter,
          selected_moves: activePokemon.selected_moves,
          sprite_url: pokemonData.media.sprite,
        };
      }
    }

    // Get user stats
    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get total Pokemon count
    const { count: pokemonCount } = await supabase
      .from('pokemon_owned')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return NextResponse.json({
      trainer: {
        id: trainer.id,
        name: trainer.name,
        role: trainer.role,
        created_at: trainer.created_at,
      },
      active_pokemon: pokemon,
      stats: stats ? {
        money: stats.money,
        items: stats.items,
        battles_won: stats.battles_won,
        battles_lost: stats.battles_lost,
        pokemon_captured: stats.pokemon_captured,
      } : null,
      pokemon_count: pokemonCount || 0,
    });
  } catch (err) {
    console.error('External API error:', err);
    const error: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(error, { status: 500 });
  }
}
