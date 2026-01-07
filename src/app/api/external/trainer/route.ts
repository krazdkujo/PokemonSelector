import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPokemonById } from '@/lib/pokemon';
import type { ExternalTrainerResponse, ApiError } from '@/lib/types';

/**
 * External API endpoint for students to retrieve their trainer data.
 *
 * Headers required:
 * - X-API-Key: Shared secret key provided by instructor
 * - X-Trainer-Name: The trainer's name (case-insensitive)
 *
 * Returns:
 * - 200: Trainer data with Pokemon details
 * - 400: Missing required headers
 * - 401: Invalid or missing API key
 * - 404: Trainer not found
 * - 500: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    // T008-T010: Validate API key
    const apiKey = request.headers.get('X-API-Key');
    const expectedKey = process.env.EXTERNAL_API_SECRET_KEY;

    if (!apiKey) {
      const error: ApiError = {
        error: 'UNAUTHORIZED',
        message: 'Invalid or missing API key',
      };
      return NextResponse.json(error, { status: 401 });
    }

    if (apiKey !== expectedKey) {
      const error: ApiError = {
        error: 'UNAUTHORIZED',
        message: 'Invalid or missing API key',
      };
      return NextResponse.json(error, { status: 401 });
    }

    // T011: Validate trainer name header
    const trainerName = request.headers.get('X-Trainer-Name');

    if (!trainerName) {
      const error: ApiError = {
        error: 'BAD_REQUEST',
        message: 'X-Trainer-Name header is required',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // T004: Query trainer by name (case-insensitive)
    const supabase = await createClient();

    const { data: trainer, error: trainerError } = await supabase
      .from('trainers')
      .select('id, name, starter_pokemon_id, starter_pokemon_uuid')
      .ilike('name', trainerName)
      .limit(1)
      .single();

    // T007: Handle trainer not found
    if (trainerError || !trainer) {
      const error: ApiError = {
        error: 'TRAINER_NOT_FOUND',
        message: 'No trainer found with that name',
      };
      return NextResponse.json(error, { status: 404 });
    }

    // T005: Enrich with Pokemon details
    let pokemon: ExternalTrainerResponse['pokemon'] = null;

    if (trainer.starter_pokemon_id && trainer.starter_pokemon_uuid) {
      const pokemonData = getPokemonById(trainer.starter_pokemon_id);
      if (pokemonData) {
        pokemon = {
          uuid: trainer.starter_pokemon_uuid,
          number: pokemonData.number,
          name: pokemonData.name,
          types: pokemonData.types,
        };
      }
    }

    // T006: Return ExternalTrainerResponse format
    const response: ExternalTrainerResponse = {
      trainer_id: trainer.id,
      trainer_name: trainer.name,
      pokemon,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error('External API error:', err);
    const error: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(error, { status: 500 });
  }
}
