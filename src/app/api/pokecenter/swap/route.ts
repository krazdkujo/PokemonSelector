/**
 * Pokecenter Swap API Route
 *
 * POST: Swaps the active Pokemon
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPokemonById } from '@/lib/battle';
import type { ApiError, PokemonOwnedWithDetails } from '@/lib/types';

/**
 * POST /api/pokecenter/swap
 * Swaps the active Pokemon
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const pokemonId = body.pokemon_id as string;

    if (!pokemonId) {
      const error: ApiError = {
        error: 'VALIDATION_ERROR',
        message: 'pokemon_id is required',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Check for active battle
    const { data: activeBattle } = await supabase
      .from('battles')
      .select('id')
      .eq('user_id', trainerId)
      .eq('status', 'active')
      .single();

    if (activeBattle) {
      const error: ApiError = {
        error: 'BATTLE_IN_PROGRESS',
        message: 'Cannot swap Pokemon during an active battle',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Verify the Pokemon belongs to the user
    const { data: targetPokemon, error: targetError } = await supabase
      .from('pokemon_owned')
      .select('*')
      .eq('id', pokemonId)
      .eq('user_id', trainerId)
      .single();

    if (targetError || !targetPokemon) {
      const error: ApiError = {
        error: 'NOT_FOUND',
        message: 'Pokemon not found or not owned by you',
      };
      return NextResponse.json(error, { status: 404 });
    }

    // If already active, nothing to do
    if (targetPokemon.is_active) {
      const data = getPokemonById(targetPokemon.pokemon_id);
      const response: PokemonOwnedWithDetails = {
        ...targetPokemon,
        name: data?.name || 'Unknown',
        types: data?.type || [],
        sr: data?.sr || 0,
        sprite_url: data?.media.sprite || '',
      };
      return NextResponse.json({ active_pokemon: response });
    }

    // Set current active Pokemon to inactive
    const { error: deactivateError } = await supabase
      .from('pokemon_owned')
      .update({ is_active: false })
      .eq('user_id', trainerId)
      .eq('is_active', true);

    if (deactivateError) {
      console.error('Failed to deactivate current Pokemon:', deactivateError);
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to swap Pokemon',
      };
      return NextResponse.json(error, { status: 500 });
    }

    // Set target Pokemon to active
    const { data: updatedPokemon, error: activateError } = await supabase
      .from('pokemon_owned')
      .update({ is_active: true })
      .eq('id', pokemonId)
      .select()
      .single();

    if (activateError || !updatedPokemon) {
      console.error('Failed to activate target Pokemon:', activateError);
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to swap Pokemon',
      };
      return NextResponse.json(error, { status: 500 });
    }

    // Enrich with Pokemon data
    const data = getPokemonById(updatedPokemon.pokemon_id);
    const response: PokemonOwnedWithDetails = {
      ...updatedPokemon,
      name: data?.name || 'Unknown',
      types: data?.type || [],
      sr: data?.sr || 0,
      sprite_url: data?.media.sprite || '',
    };

    return NextResponse.json({ active_pokemon: response });
  } catch (err) {
    console.error('Unexpected error:', err);
    const error: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(error, { status: 500 });
  }
}
