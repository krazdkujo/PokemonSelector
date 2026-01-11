/**
 * Zone Preview API Route
 *
 * GET: Returns preview information for a specific zone including
 * example Pokemon and counts for each difficulty level.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getZoneById, isValidZoneId, getDifficultyDescription } from '@/lib/zones';
import { getZoneExamplePokemon, countZonePokemon, getPokemonById } from '@/lib/battle';
import type { ApiError, ZonePreviewResponse } from '@/lib/types';

/**
 * GET /api/zones/[zoneId]/preview
 * Returns preview information for the specified zone
 * Requires authentication to get player-specific SR data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ zoneId: string }> }
) {
  try {
    const { zoneId } = await params;

    // Validate zone ID
    if (!isValidZoneId(zoneId)) {
      const error: ApiError = {
        error: 'NOT_FOUND',
        message: 'Zone not found',
      };
      return NextResponse.json(error, { status: 404 });
    }

    const zone = getZoneById(zoneId);
    if (!zone) {
      const error: ApiError = {
        error: 'NOT_FOUND',
        message: 'Zone not found',
      };
      return NextResponse.json(error, { status: 404 });
    }

    // Get trainer ID for player-specific preview
    const supabase = await createClient();
    const trainerId = request.headers.get('X-User-ID') || request.cookies.get('trainer_id')?.value;

    if (!trainerId) {
      const error: ApiError = {
        error: 'UNAUTHORIZED',
        message: 'Authentication required',
      };
      return NextResponse.json(error, { status: 401 });
    }

    // Get player's active Pokemon to determine SR for preview
    const { data: activePokemon } = await supabase
      .from('pokemon_owned')
      .select('pokemon_id')
      .eq('user_id', trainerId)
      .eq('is_active', true)
      .single();

    // Default SR if no active Pokemon
    let playerSR = 0.5;
    if (activePokemon) {
      const pokemonData = getPokemonById(activePokemon.pokemon_id);
      playerSR = pokemonData?.sr ?? 0.5;
    }

    // Build preview data for each difficulty
    const difficulties: ZonePreviewResponse['difficulties'] = {
      easy: {
        description: getDifficultyDescription('easy'),
        example_pokemon: getZoneExamplePokemon(zoneId, 'easy', playerSR, 3),
        pokemon_count: countZonePokemon(zoneId, 'easy', playerSR),
      },
      medium: {
        description: getDifficultyDescription('medium'),
        example_pokemon: getZoneExamplePokemon(zoneId, 'medium', playerSR, 3),
        pokemon_count: countZonePokemon(zoneId, 'medium', playerSR),
      },
      hard: {
        description: getDifficultyDescription('hard'),
        example_pokemon: getZoneExamplePokemon(zoneId, 'hard', playerSR, 3),
        pokemon_count: countZonePokemon(zoneId, 'hard', playerSR),
      },
    };

    const response: ZonePreviewResponse = {
      zone: {
        id: zone.id,
        name: zone.name,
        types: zone.types,
      },
      difficulties,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('Unexpected error:', err);
    const error: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(error, { status: 500 });
  }
}
