/**
 * Battle API Route
 *
 * GET: Returns current active battle or null
 * POST: Starts a new battle encounter
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateWildPokemon, generateBattleSeed, getPokemonById, generateZoneWildPokemon } from '@/lib/battle';
import { isValidZoneId, isValidZoneDifficulty, VALID_ZONE_IDS } from '@/lib/zones';
import type { ApiError, BattleDifficulty, ZoneDifficulty } from '@/lib/types';

/**
 * GET /api/battle
 * Returns the current active battle or null
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

    // Fetch active battle
    const { data: battle, error: dbError } = await supabase
      .from('battles')
      .select('*')
      .eq('user_id', trainerId)
      .eq('status', 'active')
      .single();

    if (dbError && dbError.code !== 'PGRST116') {
      // PGRST116 = no rows found
      console.error('Database error:', dbError);
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to fetch battle',
      };
      return NextResponse.json(error, { status: 500 });
    }

    // Return null if no active battle
    if (!battle) {
      return NextResponse.json(null);
    }

    // Enrich with player Pokemon data
    const { data: playerPokemon } = await supabase
      .from('pokemon_owned')
      .select('*')
      .eq('id', battle.player_pokemon_id)
      .single();

    // Check if player already owns the wild Pokemon species
    const { data: existingOwned } = await supabase
      .from('pokemon_owned')
      .select('id')
      .eq('user_id', trainerId)
      .eq('pokemon_id', battle.wild_pokemon.pokemon_id)
      .limit(1);

    const wildPokemonOwned = existingOwned && existingOwned.length > 0;

    let enrichedBattle = { ...battle, wild_pokemon_owned: wildPokemonOwned };
    if (playerPokemon) {
      const pokemonData = getPokemonById(playerPokemon.pokemon_id);
      enrichedBattle = {
        ...enrichedBattle,
        player_pokemon: {
          ...playerPokemon,
          name: pokemonData?.name,
          types: pokemonData?.type,
          sprite_url: pokemonData?.media.sprite,
        },
      };
    }

    return NextResponse.json(enrichedBattle);
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
 * POST /api/battle
 * Starts a new battle encounter
 *
 * Supports two modes:
 * 1. Zone-based: { zone_id: string, difficulty: 'easy'|'medium'|'hard' }
 * 2. Legacy random: { difficulty: 'easy'|'normal'|'difficult' }
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
    const zoneId = body.zone_id as string | undefined;
    const difficulty = body.difficulty as string;

    // Determine if this is a zone-based or legacy battle
    const isZoneBattle = !!zoneId;

    // Validate zone_id if provided
    if (isZoneBattle && !isValidZoneId(zoneId)) {
      const error: ApiError = {
        error: 'VALIDATION_ERROR',
        message: `Invalid zone_id. Must be one of: ${VALID_ZONE_IDS.join(', ')}`,
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Validate difficulty based on battle type
    if (isZoneBattle) {
      // Zone battles use easy/medium/hard
      if (!isValidZoneDifficulty(difficulty)) {
        const error: ApiError = {
          error: 'VALIDATION_ERROR',
          message: 'Invalid difficulty for zone battle. Must be easy, medium, or hard.',
        };
        return NextResponse.json(error, { status: 400 });
      }
    } else {
      // Legacy battles use easy/normal/difficult
      if (!['easy', 'normal', 'difficult'].includes(difficulty)) {
        const error: ApiError = {
          error: 'VALIDATION_ERROR',
          message: 'Invalid difficulty. Must be easy, normal, or difficult.',
        };
        return NextResponse.json(error, { status: 400 });
      }
    }

    // Check for existing active battle
    const { data: existingBattle } = await supabase
      .from('battles')
      .select('id')
      .eq('user_id', trainerId)
      .eq('status', 'active')
      .single();

    if (existingBattle) {
      const error: ApiError = {
        error: 'BATTLE_IN_PROGRESS',
        message: 'You already have an active battle. Complete or forfeit it first.',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Get player's active Pokemon
    const { data: activePokemon, error: pokemonError } = await supabase
      .from('pokemon_owned')
      .select('*')
      .eq('user_id', trainerId)
      .eq('is_active', true)
      .single();

    if (pokemonError || !activePokemon) {
      const error: ApiError = {
        error: 'NO_ACTIVE_POKEMON',
        message: 'You need an active Pokemon to battle.',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Get player Pokemon SR for zone-based encounters
    const playerPokemonData = getPokemonById(activePokemon.pokemon_id);
    const playerSR = playerPokemonData?.sr ?? 0;

    // Generate battle seed and wild Pokemon
    const seed = generateBattleSeed();
    let wildPokemon;

    if (isZoneBattle) {
      // Zone-based battle
      wildPokemon = generateZoneWildPokemon(
        zoneId!,
        difficulty as ZoneDifficulty,
        activePokemon.level,
        playerSR,
        seed
      );
    } else {
      // Legacy random battle
      wildPokemon = generateWildPokemon(difficulty as BattleDifficulty, activePokemon.level, seed);
    }

    // Create battle record
    const { data: battle, error: createError } = await supabase
      .from('battles')
      .insert({
        user_id: trainerId,
        player_pokemon_id: activePokemon.id,
        wild_pokemon: wildPokemon,
        difficulty,
        zone: isZoneBattle ? zoneId : null,
        player_wins: 0,
        wild_wins: 0,
        capture_attempts: 0,
        status: 'active',
        seed,
      })
      .select()
      .single();

    if (createError) {
      console.error('Database error:', createError);
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to create battle',
      };
      return NextResponse.json(error, { status: 500 });
    }

    // Check if player already owns the wild Pokemon species
    const { data: existingOwned } = await supabase
      .from('pokemon_owned')
      .select('id')
      .eq('user_id', trainerId)
      .eq('pokemon_id', wildPokemon.pokemon_id)
      .limit(1);

    const wildPokemonOwned = existingOwned && existingOwned.length > 0;

    // Enrich with player Pokemon data
    const enrichedBattle = {
      ...battle,
      wild_pokemon_owned: wildPokemonOwned,
      player_pokemon: {
        ...activePokemon,
        name: playerPokemonData?.name,
        types: playerPokemonData?.type,
        sprite_url: playerPokemonData?.media.sprite,
      },
    };

    return NextResponse.json(enrichedBattle, { status: 201 });
  } catch (err) {
    console.error('Unexpected error:', err);
    const error: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(error, { status: 500 });
  }
}
