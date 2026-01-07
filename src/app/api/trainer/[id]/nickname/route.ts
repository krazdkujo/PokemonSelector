import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPokemonById } from '@/lib/pokemon';
import type { TrainerWithStarter, ApiError } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface SetNicknameRequest {
  nickname: string | null;
}

/**
 * PUT /api/trainer/[id]/nickname
 * Set or update the nickname for a trainer's Pokemon
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: trainerId } = await params;
    const body = await request.json() as SetNicknameRequest;

    // Process nickname: trim whitespace, convert empty/whitespace-only to null
    let nickname: string | null = null;
    if (body.nickname !== null && body.nickname !== undefined) {
      const trimmed = body.nickname.trim();
      if (trimmed.length > 0) {
        nickname = trimmed;
      }
    }

    // Validate nickname length if provided
    if (nickname !== null && (nickname.length < 1 || nickname.length > 20)) {
      const error: ApiError = {
        error: 'VALIDATION_ERROR',
        message: 'Nickname must be between 1 and 20 characters',
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

    // Check if trainer has a Pokemon to nickname
    if (!trainer.starter_pokemon_id) {
      const error: ApiError = {
        error: 'NO_POKEMON',
        message: 'You must select a Pokemon before setting a nickname',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Update the nickname
    const { data: updatedTrainer, error: updateError } = await supabase
      .from('trainers')
      .update({ starter_pokemon_nickname: nickname })
      .eq('id', trainerId)
      .select()
      .single();

    if (updateError) {
      console.error('Database error:', updateError);
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to update nickname. Please try again.',
      };
      return NextResponse.json(error, { status: 500 });
    }

    // Get Pokemon details
    const pokemon = getPokemonById(updatedTrainer.starter_pokemon_id);

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

/**
 * DELETE /api/trainer/[id]/nickname
 * Clear the nickname for a trainer's Pokemon
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: trainerId } = await params;

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

    // Clear the nickname
    const { data: updatedTrainer, error: updateError } = await supabase
      .from('trainers')
      .update({ starter_pokemon_nickname: null })
      .eq('id', trainerId)
      .select()
      .single();

    if (updateError) {
      console.error('Database error:', updateError);
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to clear nickname. Please try again.',
      };
      return NextResponse.json(error, { status: 500 });
    }

    // Get Pokemon details
    const pokemon = updatedTrainer.starter_pokemon_id
      ? getPokemonById(updatedTrainer.starter_pokemon_id)
      : null;

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
