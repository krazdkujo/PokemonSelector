import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isValidPokemonId } from '@/lib/pokemon';
import { getStarterPokemon, getPokemonById } from '@/lib/battle';
import { getDefaultMoves } from '@/lib/moves';
import type { SelectStarterRequest, ApiError, PokemonOwnedWithDetails } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Starter Pokemon must have SR <= 0.5
const MAX_STARTER_SR = 0.5;

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

    // Verify Pokemon is eligible as starter (SR <= 0.5)
    const pokemonData = getPokemonById(pokemonId);
    if (!pokemonData || pokemonData.sr > MAX_STARTER_SR) {
      const error: ApiError = {
        error: 'INVALID_STARTER',
        message: `This Pokemon cannot be selected as a starter. Starters must have SR <= ${MAX_STARTER_SR}.`,
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

    // Check if trainer already has a starter in pokemon_owned
    const { data: existingStarter } = await supabase
      .from('pokemon_owned')
      .select('id')
      .eq('user_id', trainerId)
      .eq('is_starter', true)
      .single();

    if (existingStarter) {
      const error: ApiError = {
        error: 'ALREADY_HAS_STARTER',
        message: 'You have already selected a starter Pokemon. This choice is final.',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Get default moves for the starter
    const defaultMoves = getDefaultMoves(pokemonId, 1);

    // Create entry in pokemon_owned
    const { data: ownedPokemon, error: insertError } = await supabase
      .from('pokemon_owned')
      .insert({
        user_id: trainerId,
        pokemon_id: pokemonId,
        level: 1,
        selected_moves: defaultMoves,
        is_active: true,
        is_starter: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to select starter. Please try again.',
      };
      return NextResponse.json(error, { status: 500 });
    }

    // Also update the legacy starter_pokemon_id field for backwards compatibility
    await supabase
      .from('trainers')
      .update({ starter_pokemon_id: pokemonId })
      .eq('id', trainerId);

    // Create user_stats if they don't exist
    await supabase
      .from('user_stats')
      .upsert({
        user_id: trainerId,
        money: 100,
        items: {},
        battles_won: 0,
        battles_lost: 0,
        pokemon_captured: 0,
      }, { onConflict: 'user_id' });

    // Build response with Pokemon details
    const response: PokemonOwnedWithDetails = {
      ...ownedPokemon,
      name: pokemonData.name,
      types: pokemonData.type,
      sr: pokemonData.sr,
      sprite_url: pokemonData.media.sprite,
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
 * GET /api/trainer/[id]/starter
 * Returns available starter Pokemon (SR <= 0.5)
 */
export async function GET() {
  try {
    const starters = getStarterPokemon();

    const response = starters.map(p => ({
      pokemon_id: p.number,
      name: p.name,
      types: p.type,
      sr: p.sr,
      sprite_url: p.media.sprite,
    }));

    return NextResponse.json({ starters: response });
  } catch (err) {
    console.error('Unexpected error:', err);
    const error: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(error, { status: 500 });
  }
}
