/**
 * Pokemon Evolution API Route
 *
 * POST: Evolve a Pokemon to its next evolution form
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPokemonById } from '@/lib/battle';
import { getExperienceToNext } from '@/lib/experience';
import { checkEvolutionEligibility, getNextEvolution, getPokemonById as getEvolutionPokemonById } from '@/lib/evolution';
import type { ApiError, EvolutionResult, PokemonOwnedWithDetails } from '@/lib/types';

interface EvolveRequest {
  pokemon_id: string; // The owned Pokemon record ID (UUID)
  target_evolution_id?: number; // Optional: specific evolution ID for Pokemon with multiple options (e.g., Eevee)
}

/**
 * POST /api/pokecenter/evolve
 * Evolve a Pokemon to its next evolution form
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
    const body: EvolveRequest = await request.json();
    const { pokemon_id, target_evolution_id } = body;

    if (!pokemon_id) {
      const error: ApiError = {
        error: 'BAD_REQUEST',
        message: 'pokemon_id is required',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Fetch the owned Pokemon
    const { data: ownedPokemon, error: fetchError } = await supabase
      .from('pokemon_owned')
      .select('*')
      .eq('id', pokemon_id)
      .eq('user_id', trainerId)
      .single();

    if (fetchError || !ownedPokemon) {
      const error: ApiError = {
        error: 'NOT_FOUND',
        message: 'Pokemon not found or not owned by user',
      };
      return NextResponse.json(error, { status: 404 });
    }

    // Check if Pokemon can evolve
    if (!ownedPokemon.can_evolve) {
      const error: ApiError = {
        error: 'CANNOT_EVOLVE',
        message: 'Pokemon is not eligible for evolution',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Get evolution info to verify eligibility
    const evolutionInfo = checkEvolutionEligibility(ownedPokemon.pokemon_id, ownedPokemon.level);
    if (!evolutionInfo.canEvolve || !evolutionInfo.nextEvolutionId) {
      const error: ApiError = {
        error: 'FINAL_STAGE',
        message: 'Pokemon is already at its final evolution',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // For Pokemon with multiple evolutions (e.g., Eevee), require a target
    if (evolutionInfo.hasMultipleEvolutions && !target_evolution_id) {
      const error: ApiError = {
        error: 'TARGET_REQUIRED',
        message: 'This Pokemon has multiple evolutions. Please specify target_evolution_id.',
      };
      return NextResponse.json({
        ...error,
        evolution_options: evolutionInfo.evolutionOptions,
      }, { status: 400 });
    }

    // Get the Pokemon names for the response
    const fromPokemon = getEvolutionPokemonById(ownedPokemon.pokemon_id);
    const nextEvolution = getNextEvolution(ownedPokemon.pokemon_id, target_evolution_id);

    if (!fromPokemon || !nextEvolution) {
      const error: ApiError = {
        error: 'EVOLUTION_ERROR',
        message: 'Failed to determine evolution target',
      };
      return NextResponse.json(error, { status: 500 });
    }

    // Perform evolution: update pokemon_id and clear can_evolve
    const { data: updatedPokemon, error: updateError } = await supabase
      .from('pokemon_owned')
      .update({
        pokemon_id: nextEvolution.id,
        can_evolve: false,
      })
      .eq('id', pokemon_id)
      .eq('user_id', trainerId)
      .select()
      .single();

    if (updateError || !updatedPokemon) {
      console.error('Evolution update error:', updateError);
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to evolve Pokemon',
      };
      return NextResponse.json(error, { status: 500 });
    }

    // Enrich the updated Pokemon with details
    const pokemonData = getPokemonById(updatedPokemon.pokemon_id);
    const newEvolutionInfo = checkEvolutionEligibility(updatedPokemon.pokemon_id, updatedPokemon.level);

    const pokemonWithDetails: PokemonOwnedWithDetails = {
      ...updatedPokemon,
      name: pokemonData?.name || 'Unknown',
      types: pokemonData?.type || [],
      sr: pokemonData?.sr || 0,
      sprite_url: pokemonData?.media.sprite || '',
      experience_to_next: getExperienceToNext(updatedPokemon),
    };

    const result: EvolutionResult = {
      success: true,
      pokemon: {
        ...pokemonWithDetails,
        evolution_info: newEvolutionInfo,
      } as PokemonOwnedWithDetails & { evolution_info: typeof newEvolutionInfo },
      evolved_from: {
        pokemon_id: ownedPokemon.pokemon_id,
        name: fromPokemon.name,
      },
      evolved_to: {
        pokemon_id: nextEvolution.id,
        name: nextEvolution.name,
      },
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error('Unexpected error:', err);
    const error: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(error, { status: 500 });
  }
}
