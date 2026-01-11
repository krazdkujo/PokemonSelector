/**
 * Dashboard API Route
 *
 * GET: Returns aggregated dashboard data including active Pokemon, stats, and battle status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPokemonById } from '@/lib/battle';
import type { ApiError, Dashboard, PokemonOwnedWithDetails, UserStats } from '@/lib/types';

/**
 * GET /api/dashboard
 * Returns dashboard data for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the trainer ID from session cookie or X-User-ID header (from API key auth)
    const trainerId = request.headers.get('X-User-ID') || request.cookies.get('trainer_id')?.value;

    if (!trainerId) {
      const error: ApiError = {
        error: 'UNAUTHORIZED',
        message: 'You must be logged in to view the dashboard',
      };
      return NextResponse.json(error, { status: 401 });
    }

    // Fetch trainer info
    const { data: trainer, error: trainerError } = await supabase
      .from('trainers')
      .select('id, name, role')
      .eq('id', trainerId)
      .single();

    if (trainerError || !trainer) {
      const error: ApiError = {
        error: 'NOT_FOUND',
        message: 'Trainer not found',
      };
      return NextResponse.json(error, { status: 404 });
    }

    // Fetch active Pokemon
    const { data: activePokemon } = await supabase
      .from('pokemon_owned')
      .select('*')
      .eq('user_id', trainerId)
      .eq('is_active', true)
      .single();

    // Fetch total Pokemon count
    const { count: pokemonCount } = await supabase
      .from('pokemon_owned')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', trainerId);

    // Fetch user stats
    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', trainerId)
      .single();

    // Check for active battle
    const { data: activeBattle } = await supabase
      .from('battles')
      .select('id')
      .eq('user_id', trainerId)
      .eq('status', 'active')
      .single();

    // Build active Pokemon with details
    let activePokemonWithDetails: PokemonOwnedWithDetails | null = null;
    if (activePokemon) {
      const pokemonData = getPokemonById(activePokemon.pokemon_id);
      if (pokemonData) {
        activePokemonWithDetails = {
          ...activePokemon,
          name: pokemonData.name,
          types: pokemonData.type,
          sr: pokemonData.sr,
          sprite_url: pokemonData.media.sprite,
        };
      }
    }

    // Build default stats if none exist
    const userStats: UserStats = stats || {
      id: '',
      user_id: trainerId,
      money: 100,
      items: {},
      battles_won: 0,
      battles_lost: 0,
      pokemon_captured: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const response: Dashboard = {
      trainer_name: trainer.name,
      active_pokemon: activePokemonWithDetails,
      pokemon_count: pokemonCount || 0,
      stats: userStats,
      has_active_battle: !!activeBattle,
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
