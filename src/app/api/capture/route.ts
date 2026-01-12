/**
 * Capture API Route
 *
 * POST: Attempts to capture the wild Pokemon in the current battle
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { attemptCapture, calculateCaptureDC } from '@/lib/capture';
import { getPokemonById } from '@/lib/battle';
import { getDefaultMoves } from '@/lib/moves';
import { applyExperience } from '@/lib/experience';
import { checkEvolutionEligibility, getPokemonSpriteUrl } from '@/lib/evolution';
import type { ApiError, CaptureResult, PokemonOwnedWithDetails, ExperienceGainedWithEvolution } from '@/lib/types';

/**
 * POST /api/capture
 * Attempts to capture the wild Pokemon
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

    // Fetch active battle
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select('*')
      .eq('user_id', trainerId)
      .eq('status', 'active')
      .single();

    if (battleError || !battle) {
      const error: ApiError = {
        error: 'NO_ACTIVE_BATTLE',
        message: 'You do not have an active battle',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Check if player has at least one win
    if (battle.player_wins < 1) {
      const error: ApiError = {
        error: 'NOT_ENOUGH_WINS',
        message: 'You need at least 1 round win to attempt capture',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Check if player already owns this Pokemon species
    const { data: existingOwned } = await supabase
      .from('pokemon_owned')
      .select('id')
      .eq('user_id', trainerId)
      .eq('pokemon_id', battle.wild_pokemon.pokemon_id)
      .limit(1);

    if (existingOwned && existingOwned.length > 0) {
      const error: ApiError = {
        error: 'ALREADY_OWNED',
        message: 'You already have this Pokemon species in your collection',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Fetch player's Pokemon
    const { data: playerPokemon, error: pokemonError } = await supabase
      .from('pokemon_owned')
      .select('*')
      .eq('id', battle.player_pokemon_id)
      .single();

    if (pokemonError || !playerPokemon) {
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to fetch player Pokemon',
      };
      return NextResponse.json(error, { status: 500 });
    }

    // Get Pokemon data
    const playerPokemonData = getPokemonById(playerPokemon.pokemon_id);
    if (!playerPokemonData) {
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Invalid player Pokemon data',
      };
      return NextResponse.json(error, { status: 500 });
    }

    // Calculate capture context
    const captureContext = {
      playerLevel: playerPokemon.level,
      playerSR: playerPokemonData.sr,
      wildLevel: battle.wild_pokemon.level,
      wildSR: battle.wild_pokemon.sr,
      playerRoundWins: battle.player_wins,
      captureAttempts: battle.capture_attempts,
    };

    // Attempt capture
    const attemptNumber = battle.capture_attempts + 1;
    const result = attemptCapture(captureContext, battle.id, attemptNumber);

    // Update capture attempts
    const updateData: Record<string, unknown> = {
      capture_attempts: attemptNumber,
    };

    if (result.success) {
      // Capture successful!
      updateData.status = 'captured';
      updateData.ended_at = new Date().toISOString();

      // Create new pokemon_owned entry for the captured Pokemon
      const wildPokemon = battle.wild_pokemon;
      const defaultMoves = getDefaultMoves(wildPokemon.pokemon_id, wildPokemon.level);

      const { data: capturedPokemon, error: captureError } = await supabase
        .from('pokemon_owned')
        .insert({
          user_id: trainerId,
          pokemon_id: wildPokemon.pokemon_id,
          level: wildPokemon.level,
          selected_moves: defaultMoves,
          is_active: false, // Not active by default
          is_starter: false,
        })
        .select()
        .single();

      if (captureError) {
        console.error('Failed to create captured Pokemon:', captureError);
        const error: ApiError = {
          error: 'DATABASE_ERROR',
          message: 'Failed to register captured Pokemon',
        };
        return NextResponse.json(error, { status: 500 });
      }

      // Increment pokemon_captured
      const { data: stats } = await supabase
        .from('user_stats')
        .select('pokemon_captured')
        .eq('user_id', trainerId)
        .single();

      if (stats) {
        await supabase
          .from('user_stats')
          .update({ pokemon_captured: (stats.pokemon_captured || 0) + 1 })
          .eq('user_id', trainerId);
      }

      // Grant 1 XP for successful capture
      const xpAwarded = 1;
      const previousLevel = playerPokemon.level;
      const previousExperience = playerPokemon.experience || 0;
      const levelUpResult = applyExperience(playerPokemon, xpAwarded);

      // Check if Pokemon is now eligible for evolution
      const evolutionInfo = checkEvolutionEligibility(playerPokemon.pokemon_id, levelUpResult.newLevel);
      const canEvolveNow = evolutionInfo.canEvolve && evolutionInfo.nextEvolutionId !== null;

      // Update Pokemon in database (including can_evolve flag)
      const coreUpdateFields = {
        experience: levelUpResult.newExperience,
        level: levelUpResult.newLevel,
      };

      // Build update with optional can_evolve field
      const updateFields: Record<string, unknown> = { ...coreUpdateFields };
      const setCanEvolve = canEvolveNow && levelUpResult.levelsGained > 0;
      if (setCanEvolve) {
        updateFields.can_evolve = true;
      }

      console.log('Updating Pokemon experience on capture:', {
        pokemonId: playerPokemon.id,
        updateFields,
        previousLevel,
        previousExperience,
      });

      let { data: updatedPlayerPokemon, error: xpUpdateError } = await supabase
        .from('pokemon_owned')
        .update(updateFields)
        .eq('id', playerPokemon.id)
        .select()
        .single();

      // If update failed and we tried to set can_evolve, retry without it
      if (xpUpdateError && setCanEvolve) {
        console.warn('Update with can_evolve failed, retrying without:', xpUpdateError.message);
        const retryResult = await supabase
          .from('pokemon_owned')
          .update(coreUpdateFields)
          .eq('id', playerPokemon.id)
          .select()
          .single();
        updatedPlayerPokemon = retryResult.data;
        xpUpdateError = retryResult.error;
      }

      let experienceGained: ExperienceGainedWithEvolution | null = null;

      if (xpUpdateError) {
        console.error('Failed to update Pokemon experience on capture:', xpUpdateError);
      } else if (!updatedPlayerPokemon) {
        console.error('Capture update returned no data');
      } else {
        console.log('Pokemon updated successfully on capture:', {
          id: updatedPlayerPokemon.id,
          newLevel: updatedPlayerPokemon.level,
          newExperience: updatedPlayerPokemon.experience,
        });

        experienceGained = {
          xp_awarded: xpAwarded,
          previous_level: previousLevel,
          new_level: updatedPlayerPokemon.level,
          previous_experience: previousExperience,
          new_experience: updatedPlayerPokemon.experience,
          levels_gained: updatedPlayerPokemon.level - previousLevel,
          evolution_available: canEvolveNow,
        };
      }

      // Add evolution details if available
      if (experienceGained && canEvolveNow && evolutionInfo.nextEvolutionId && evolutionInfo.nextEvolutionName) {
        experienceGained.evolution_details = {
          from_name: playerPokemonData?.name || 'Unknown',
          from_id: playerPokemon.pokemon_id,
          to_name: evolutionInfo.nextEvolutionName,
          to_id: evolutionInfo.nextEvolutionId,
          from_sprite: getPokemonSpriteUrl(playerPokemon.pokemon_id),
          to_sprite: getPokemonSpriteUrl(evolutionInfo.nextEvolutionId),
        };
      }

      if (experienceGained) {
        console.log('Capture XP granted:', experienceGained);
      }

      // Update battle
      const { data: updatedBattle, error: updateError } = await supabase
        .from('battles')
        .update(updateData)
        .eq('id', battle.id)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to update battle:', updateError);
      }

      // Build captured Pokemon response with details
      const wildPokemonData = getPokemonById(wildPokemon.pokemon_id);
      const capturedPokemonWithDetails: PokemonOwnedWithDetails | null = capturedPokemon && wildPokemonData ? {
        ...capturedPokemon,
        name: wildPokemonData.name,
        types: wildPokemonData.type,
        sr: wildPokemonData.sr,
        sprite_url: wildPokemonData.media.sprite,
      } : null;

      return NextResponse.json({
        result: {
          success: true,
          roll: result.roll,
          dc: result.dc,
          fled: false,
        } as CaptureResult,
        battle: updatedBattle,
        captured_pokemon: capturedPokemonWithDetails,
        experience_gained: experienceGained,
      });
    } else if (result.fled) {
      // Pokemon fled!
      updateData.status = 'fled';
      updateData.ended_at = new Date().toISOString();

      const { data: updatedBattle, error: updateError } = await supabase
        .from('battles')
        .update(updateData)
        .eq('id', battle.id)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to update battle:', updateError);
      }

      return NextResponse.json({
        result: {
          success: false,
          roll: result.roll,
          dc: result.dc,
          fled: true,
        } as CaptureResult,
        battle: updatedBattle,
      });
    } else {
      // Capture failed, wild Pokemon gets a win
      const newWildWins = battle.wild_wins + 1;
      updateData.wild_wins = newWildWins;

      // Check if wild Pokemon won the battle
      if (newWildWins >= 3) {
        updateData.status = 'wild_won';
        updateData.ended_at = new Date().toISOString();

        // Update user stats for loss
        const { data: stats } = await supabase
          .from('user_stats')
          .select('battles_lost')
          .eq('user_id', trainerId)
          .single();

        if (stats) {
          await supabase
            .from('user_stats')
            .update({ battles_lost: (stats.battles_lost || 0) + 1 })
            .eq('user_id', trainerId);
        }
      }

      const { data: updatedBattle, error: updateError } = await supabase
        .from('battles')
        .update(updateData)
        .eq('id', battle.id)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to update battle:', updateError);
      }

      return NextResponse.json({
        result: {
          success: false,
          roll: result.roll,
          dc: result.dc,
          fled: false,
        } as CaptureResult,
        battle: updatedBattle,
      });
    }
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
 * GET /api/capture
 * Returns the current capture DC for the active battle
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
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select('*')
      .eq('user_id', trainerId)
      .eq('status', 'active')
      .single();

    if (battleError || !battle) {
      const error: ApiError = {
        error: 'NO_ACTIVE_BATTLE',
        message: 'You do not have an active battle',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Fetch player's Pokemon
    const { data: playerPokemon } = await supabase
      .from('pokemon_owned')
      .select('*')
      .eq('id', battle.player_pokemon_id)
      .single();

    if (!playerPokemon) {
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to fetch player Pokemon',
      };
      return NextResponse.json(error, { status: 500 });
    }

    const playerPokemonData = getPokemonById(playerPokemon.pokemon_id);

    // Calculate capture DC
    const dc = calculateCaptureDC({
      playerLevel: playerPokemon.level,
      playerSR: playerPokemonData?.sr || 0,
      wildLevel: battle.wild_pokemon.level,
      wildSR: battle.wild_pokemon.sr,
      playerRoundWins: battle.player_wins,
      captureAttempts: battle.capture_attempts,
    });

    // Check if player already owns this Pokemon species
    const { data: existingOwned } = await supabase
      .from('pokemon_owned')
      .select('id')
      .eq('user_id', trainerId)
      .eq('pokemon_id', battle.wild_pokemon.pokemon_id)
      .limit(1);

    const alreadyOwned = existingOwned && existingOwned.length > 0;

    return NextResponse.json({
      dc,
      can_capture: battle.player_wins >= 1 && !alreadyOwned,
      player_wins: battle.player_wins,
      wild_pokemon: battle.wild_pokemon.name,
      already_owned: alreadyOwned,
      ownership_message: alreadyOwned ? 'Already caught - can only knock out' : null,
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
