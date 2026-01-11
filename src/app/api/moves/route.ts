/**
 * Moves API Route
 *
 * GET: Returns available moves for the active Pokemon
 * PUT: Updates the selected moves for the active Pokemon
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAvailableMoves, validateSelectedMoves } from '@/lib/moves';
import type { ApiError } from '@/lib/types';

/**
 * GET /api/moves
 * Returns available moves for the user's active Pokemon
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

    // Fetch active Pokemon
    const { data: activePokemon, error: pokemonError } = await supabase
      .from('pokemon_owned')
      .select('*')
      .eq('user_id', trainerId)
      .eq('is_active', true)
      .single();

    if (pokemonError || !activePokemon) {
      const error: ApiError = {
        error: 'NO_ACTIVE_POKEMON',
        message: 'You do not have an active Pokemon',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Get available moves for the Pokemon
    const availableMoves = getAvailableMoves(activePokemon.pokemon_id, activePokemon.level);
    const selectedMoves = activePokemon.selected_moves || [];

    return NextResponse.json({
      available_moves: availableMoves,
      selected_moves: selectedMoves,
      pokemon_id: activePokemon.id,
      pokemon_level: activePokemon.level,
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
 * PUT /api/moves
 * Updates the selected moves for the active Pokemon
 */
export async function PUT(request: NextRequest) {
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
    const moves = body.moves as string[];

    // Validate move count
    if (!moves || moves.length !== 4) {
      const error: ApiError = {
        error: 'VALIDATION_ERROR',
        message: 'Exactly 4 moves must be selected',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Fetch active Pokemon
    const { data: activePokemon, error: pokemonError } = await supabase
      .from('pokemon_owned')
      .select('*')
      .eq('user_id', trainerId)
      .eq('is_active', true)
      .single();

    if (pokemonError || !activePokemon) {
      const error: ApiError = {
        error: 'NO_ACTIVE_POKEMON',
        message: 'You do not have an active Pokemon',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Validate moves are available to this Pokemon
    const validation = validateSelectedMoves(activePokemon.pokemon_id, activePokemon.level, moves);

    if (!validation.valid) {
      const error: ApiError = {
        error: 'INVALID_MOVES',
        message: `Some moves are not available to your Pokemon: ${validation.invalidMoves.join(', ')}`,
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Update selected moves
    const { error: updateError } = await supabase
      .from('pokemon_owned')
      .update({ selected_moves: moves })
      .eq('id', activePokemon.id);

    if (updateError) {
      console.error('Database error:', updateError);
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to update moves',
      };
      return NextResponse.json(error, { status: 500 });
    }

    return NextResponse.json({
      selected_moves: moves,
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
