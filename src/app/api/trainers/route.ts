import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPokemonById } from '@/lib/pokemon';
import type { TrainerWithStats, ApiError } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Get trainer ID from query params for role check
    const { searchParams } = new URL(request.url);
    const requesterId = searchParams.get('requester_id');

    if (!requesterId) {
      const error: ApiError = {
        error: 'UNAUTHORIZED',
        message: 'Requester ID is required',
      };
      return NextResponse.json(error, { status: 401 });
    }

    const supabase = await createClient();

    // Check if requester is an admin
    const { data: requester, error: requesterError } = await supabase
      .from('trainers')
      .select('role')
      .eq('id', requesterId)
      .single();

    if (requesterError || !requester) {
      const error: ApiError = {
        error: 'UNAUTHORIZED',
        message: 'Invalid requester',
      };
      return NextResponse.json(error, { status: 401 });
    }

    if (requester.role !== 'admin') {
      const error: ApiError = {
        error: 'FORBIDDEN',
        message: 'Only admins can view the trainer list',
      };
      return NextResponse.json(error, { status: 403 });
    }

    // Fetch all trainers
    const { data: trainers, error: trainersError } = await supabase
      .from('trainers')
      .select('*')
      .order('created_at', { ascending: false });

    if (trainersError) {
      console.error('Database error:', trainersError);
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to fetch trainers',
      };
      return NextResponse.json(error, { status: 500 });
    }

    // Add Pokemon details and statistics for each trainer
    const trainersWithStats: TrainerWithStats[] = await Promise.all(
      trainers.map(async (trainer) => {
        // Get user stats
        const { data: userStats } = await supabase
          .from('user_stats')
          .select('battles_won, battles_lost, pokemon_captured')
          .eq('user_id', trainer.id)
          .single();

        // Get Pokemon count
        const { count: pokemonCount } = await supabase
          .from('pokemon_owned')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', trainer.id);

        return {
          ...trainer,
          starter: trainer.starter_pokemon_id
            ? getPokemonById(trainer.starter_pokemon_id)
            : null,
          stats: userStats
            ? {
                battles_won: userStats.battles_won ?? 0,
                battles_lost: userStats.battles_lost ?? 0,
                pokemon_captured: userStats.pokemon_captured ?? 0,
                pokemon_count: pokemonCount ?? 0,
              }
            : null,
        };
      })
    );

    return NextResponse.json(trainersWithStats, { status: 200 });
  } catch (err) {
    console.error('Unexpected error:', err);
    const error: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(error, { status: 500 });
  }
}
