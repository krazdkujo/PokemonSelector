/**
 * Starter API Route
 *
 * GET: Returns available starter Pokemon (SR <= 0.5)
 * POST: Selects a starter Pokemon for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStarterPokemon } from '@/lib/pokemon';
import { getPokemonById } from '@/lib/battle';
import type { ApiError } from '@/lib/types';

/**
 * GET /api/starter
 * Returns available starter Pokemon (SR <= 0.5)
 */
export async function GET() {
  try {
    const starters = getStarterPokemon();

    return NextResponse.json({
      starters: starters.map(p => ({
        id: p.number,
        name: p.name,
        types: p.types,
        sr: p.sr,
        sprite_url: p.sprites?.sprite || null,
      })),
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

/**
 * POST /api/starter
 * Selects a starter Pokemon for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware-injected header or cookie
    const userId = request.headers.get('X-User-ID') || request.cookies.get('trainer_id')?.value;

    if (!userId) {
      const error: ApiError = {
        error: 'UNAUTHORIZED',
        message: 'Authentication required',
      };
      return NextResponse.json(error, { status: 401 });
    }

    const body = await request.json();
    const pokemonId = body.pokemon_id as number;

    if (!pokemonId) {
      const error: ApiError = {
        error: 'VALIDATION_ERROR',
        message: 'pokemon_id is required',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Validate it's a valid starter Pokemon
    const starters = getStarterPokemon();
    const isValidStarter = starters.some(p => p.number === pokemonId);

    if (!isValidStarter) {
      const error: ApiError = {
        error: 'INVALID_STARTER',
        message: 'Pokemon is not available as a starter (SR must be <= 0.5)',
      };
      return NextResponse.json(error, { status: 400 });
    }

    const supabase = await createClient();

    // Check if user already has a starter
    const { data: existingPokemon, error: checkError } = await supabase
      .from('pokemon_owned')
      .select('id')
      .eq('user_id', userId)
      .eq('is_starter', true)
      .limit(1);

    if (checkError) {
      console.error('Database error:', checkError);
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to check existing starter',
      };
      return NextResponse.json(error, { status: 500 });
    }

    if (existingPokemon && existingPokemon.length > 0) {
      const error: ApiError = {
        error: 'ALREADY_HAS_STARTER',
        message: 'You already have a starter Pokemon',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Create pokemon_owned entry
    const { data: newPokemon, error: insertError } = await supabase
      .from('pokemon_owned')
      .insert({
        user_id: userId,
        pokemon_id: pokemonId,
        level: 1,
        is_active: true,
        is_starter: true,
        selected_moves: [],
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to create starter Pokemon',
      };
      return NextResponse.json(error, { status: 500 });
    }

    // Create user_stats entry
    await supabase
      .from('user_stats')
      .insert({
        user_id: userId,
        money: 100,
        items: {},
        battles_won: 0,
        battles_lost: 0,
        pokemon_captured: 0,
      });

    // Get Pokemon data for response
    const pokemonData = getPokemonById(pokemonId);

    return NextResponse.json({
      pokemon: {
        id: newPokemon.id,
        pokemon_id: newPokemon.pokemon_id,
        name: pokemonData?.name || 'Unknown',
        types: pokemonData?.type || [],
        level: newPokemon.level,
        sr: pokemonData?.sr || 0,
        is_starter: newPokemon.is_starter,
        is_active: newPokemon.is_active,
        sprite_url: pokemonData?.media?.sprite || null,
      },
    }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error:', err);
    const error: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(error, { status: 500 });
  }
}
