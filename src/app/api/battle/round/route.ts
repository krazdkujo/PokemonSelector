/**
 * Battle Round API Route
 *
 * POST: Executes a battle round with the specified move
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createBattleRng,
  rollD20,
  calculateRoundWinChance,
  resolveRound,
  getPokemonById,
} from '@/lib/battle';
import { getMoveById } from '@/lib/moves';
import { calculateExperienceGained, applyExperience } from '@/lib/experience';
import { checkEvolutionEligibility, getPokemonSpriteUrl } from '@/lib/evolution';
import type { ApiError, RoundResult, ExperienceGainedWithEvolution } from '@/lib/types';

/**
 * POST /api/battle/round
 * Executes a single battle round
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
    const moveId = body.move_id as string;

    if (!moveId) {
      const error: ApiError = {
        error: 'VALIDATION_ERROR',
        message: 'move_id is required',
      };
      return NextResponse.json(error, { status: 400 });
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

    // Validate move is in selected moves
    const selectedMoves = playerPokemon.selected_moves || [];
    if (!selectedMoves.includes(moveId)) {
      const error: ApiError = {
        error: 'INVALID_MOVE',
        message: 'This move is not in your selected moveset',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Get move data
    const move = getMoveById(moveId);
    if (!move) {
      const error: ApiError = {
        error: 'INVALID_MOVE',
        message: 'Invalid move ID',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Calculate round number
    const roundNumber = battle.player_wins + battle.wild_wins + 1;

    // Create seeded RNG for this round
    const rng = createBattleRng(battle.id, roundNumber);
    const roll = rollD20(rng);

    // Calculate win chance
    const calculation = calculateRoundWinChance({
      playerLevel: playerPokemon.level,
      playerSR: playerPokemonData.sr,
      playerTypes: playerPokemonData.type,
      wildLevel: battle.wild_pokemon.level,
      wildSR: battle.wild_pokemon.sr,
      wildTypes: battle.wild_pokemon.types,
      moveType: move.type,
    });

    // Calculate DC for debugging
    const dc = Math.round(21 - (calculation.totalChance * 20));

    // Resolve the round
    const playerWins = resolveRound(roll, calculation.totalChance);
    const winner = playerWins ? 'player' : 'wild';

    // Debug logging
    console.log('Battle Round Debug:', {
      roll,
      totalChance: calculation.totalChance,
      dc,
      playerWins,
      winner,
      levelBonus: calculation.levelBonus,
      srBonus: calculation.srBonus,
      typeEffectiveness: calculation.typeEffectiveness,
      stabBonus: calculation.stabBonus,
    });

    // Create round record
    const { error: roundError } = await supabase
      .from('battle_rounds')
      .insert({
        battle_id: battle.id,
        round_number: roundNumber,
        player_move: moveId,
        winner,
        roll,
        base_chance: calculation.baseChance,
        type_bonus: calculation.typeEffectiveness - 1, // Store as modifier
        stab_bonus: calculation.stabBonus,
      });

    if (roundError) {
      console.error('Database error:', roundError);
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to record round',
      };
      return NextResponse.json(error, { status: 500 });
    }

    // Update battle wins
    const newPlayerWins = playerWins ? battle.player_wins + 1 : battle.player_wins;
    const newWildWins = playerWins ? battle.wild_wins : battle.wild_wins + 1;

    // Check for battle end
    let newStatus = 'active';
    let endedAt = null;
    if (newPlayerWins >= 3) {
      newStatus = 'player_won';
      endedAt = new Date().toISOString();
    } else if (newWildWins >= 3) {
      newStatus = 'wild_won';
      endedAt = new Date().toISOString();
    }

    // Update battle record
    const updateData: Record<string, unknown> = {
      player_wins: newPlayerWins,
      wild_wins: newWildWins,
      status: newStatus,
    };
    if (endedAt) {
      updateData.ended_at = endedAt;
    }

    const { data: updatedBattle, error: updateError } = await supabase
      .from('battles')
      .update(updateData)
      .eq('id', battle.id)
      .select()
      .single();

    if (updateError) {
      console.error('Database error:', updateError);
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to update battle',
      };
      return NextResponse.json(error, { status: 500 });
    }

    // Update user stats if battle ended
    let experienceGained: ExperienceGainedWithEvolution | undefined;

    if (newStatus !== 'active') {
      const statField = newStatus === 'player_won' ? 'battles_won' : 'battles_lost';

      // Try RPC first, fallback to manual update
      const { error: rpcError } = await supabase.rpc('increment_user_stat', {
        p_user_id: trainerId,
        p_stat_name: statField,
        p_amount: 1,
      });

      if (rpcError) {
        // RPC failed (function may not exist), use manual update
        const { data: stats } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', trainerId)
          .single();

        if (stats) {
          await supabase
            .from('user_stats')
            .update({ [statField]: (stats[statField] || 0) + 1 })
            .eq('user_id', trainerId);
        }
      }

      // Grant experience on battle end (win or loss)
      if (newStatus === 'player_won' || newStatus === 'wild_won') {
        // Win: use formula, Loss: 1 XP consolation
        const xpAwarded = newStatus === 'player_won'
          ? calculateExperienceGained(playerPokemon.level, battle.wild_pokemon.level)
          : 1;

        const previousLevel = playerPokemon.level;
        const previousExperience = playerPokemon.experience || 0;

        // Apply experience and handle level-ups
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

        console.log('Updating Pokemon experience:', {
          pokemonId: playerPokemon.id,
          updateFields,
          previousLevel,
          previousExperience,
        });

        let { data: updatedPokemon, error: xpUpdateError } = await supabase
          .from('pokemon_owned')
          .update(updateFields)
          .eq('id', playerPokemon.id)
          .select()
          .single();

        // If update failed and we tried to set can_evolve, retry without it
        // (handles case where column doesn't exist in database)
        if (xpUpdateError && setCanEvolve) {
          console.warn('Update with can_evolve failed, retrying without:', xpUpdateError.message);
          const retryResult = await supabase
            .from('pokemon_owned')
            .update(coreUpdateFields)
            .eq('id', playerPokemon.id)
            .select()
            .single();
          updatedPokemon = retryResult.data;
          xpUpdateError = retryResult.error;
        }

        if (xpUpdateError) {
          console.error('Failed to update Pokemon experience:', xpUpdateError);
        } else if (!updatedPokemon) {
          console.error('Update returned no data - Pokemon may not have been updated');
        } else {
          // Verify the database actually contains what we expected
          if (updatedPokemon.level !== levelUpResult.newLevel || updatedPokemon.experience !== levelUpResult.newExperience) {
            console.error('Database update verification failed:', {
              expected: { level: levelUpResult.newLevel, experience: levelUpResult.newExperience },
              actual: { level: updatedPokemon.level, experience: updatedPokemon.experience },
            });
          } else {
            console.log('Pokemon updated successfully:', {
              id: updatedPokemon.id,
              newLevel: updatedPokemon.level,
              newExperience: updatedPokemon.experience,
            });
          }

          // Use actual database values in response to ensure consistency
          experienceGained = {
            xp_awarded: xpAwarded,
            previous_level: previousLevel,
            new_level: updatedPokemon.level,
            previous_experience: previousExperience,
            new_experience: updatedPokemon.experience,
            levels_gained: updatedPokemon.level - previousLevel,
            evolution_available: canEvolveNow,
          };

          // Add evolution details if available
          if (canEvolveNow && evolutionInfo.nextEvolutionId && evolutionInfo.nextEvolutionName) {
            const playerData = getPokemonById(playerPokemon.pokemon_id);
            experienceGained.evolution_details = {
              from_name: playerData?.name || 'Unknown',
              from_id: playerPokemon.pokemon_id,
              to_name: evolutionInfo.nextEvolutionName,
              to_id: evolutionInfo.nextEvolutionId,
              from_sprite: getPokemonSpriteUrl(playerPokemon.pokemon_id),
              to_sprite: getPokemonSpriteUrl(evolutionInfo.nextEvolutionId),
              has_multiple_evolutions: evolutionInfo.hasMultipleEvolutions,
              evolution_options: evolutionInfo.evolutionOptions,
            };
          }

          console.log('Experience granted:', experienceGained);
        }
      }
    }

    // Build response
    const roundResult: RoundResult = {
      round_number: roundNumber,
      player_move: move.name,
      winner,
      roll,
      dc,
      base_chance: calculation.totalChance,
      type_effectiveness: calculation.effectivenessLabel,
      had_stab: calculation.hasStab,
    };

    // Build response with optional experience_gained
    const response: {
      round: RoundResult;
      battle: typeof updatedBattle;
      battle_ended: boolean;
      experience_gained?: ExperienceGainedWithEvolution;
    } = {
      round: roundResult,
      battle: updatedBattle,
      battle_ended: newStatus !== 'active',
    };

    if (experienceGained) {
      response.experience_gained = experienceGained;
    }

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
