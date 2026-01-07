import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPokemonById, isValidPokemonId } from '@/lib/pokemon';
import type { TrainerWithStarter, SelectStarterRequest, ApiError } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: trainerId } = await params;
    const body = await request.json() as SelectStarterRequest;
    const pokemonId = body.pokemon_id;

    // Validate Pokemon ID
    if (!pokemonId || !isValidPokemonId(pokemonId)) {
      const error: ApiError = {
        error: 'VALIDATION_ERROR',
        message: 'Invalid Pokemon ID. Must be between 1 and 151.',
      };
      return NextResponse.json(error, { status: 400 });
    }

    const supabase = await createClient();

    // Check if trainer exists
    const { data: trainer, error: trainerError } = await supabase
      .from('trainers')
      .select('*')
      .eq('id', trainerId)
      .single();

    if (trainerError || !trainer) {
      const error: ApiError = {
        error: 'NOT_FOUND',
        message: 'Trainer not found',
      };
      return NextResponse.json(error, { status: 404 });
    }

    // Check if trainer already has a starter
    if (trainer.starter_pokemon_id) {
      const error: ApiError = {
        error: 'ALREADY_HAS_STARTER',
        message: 'You have already selected a starter Pokemon. This choice is final.',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Select the Pokemon and generate a unique instance UUID
    const { data: updatedTrainer, error: updateError } = await supabase
      .from('trainers')
      .update({
        starter_pokemon_id: pokemonId,
        starter_pokemon_uuid: crypto.randomUUID(),
      })
      .eq('id', trainerId)
      .select()
      .single();

    if (updateError) {
      console.error('Database error:', updateError);
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to select starter. Please try again.',
      };
      return NextResponse.json(error, { status: 500 });
    }

    // Get Pokemon details
    const pokemon = getPokemonById(pokemonId);

    const response: TrainerWithStarter = {
      ...updatedTrainer,
      starter: pokemon || null,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error('Unexpected error:', err);
    const error: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(error, { status: 500 });
  }
}
