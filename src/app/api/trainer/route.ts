import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Trainer, CreateTrainerRequest, ApiError } from '@/lib/types';

/**
 * GET /api/trainer
 * Returns the authenticated user's trainer profile
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID from middleware-injected header or cookie
    const userId = request.headers.get('X-User-ID') || request.cookies.get('trainer_id')?.value;

    if (!userId) {
      const error: ApiError = {
        error: 'UNAUTHORIZED',
        message: 'Authentication required',
      };
      return NextResponse.json(error, { status: 401 });
    }

    const supabase = await createClient();

    const { data: trainer, error: dbError } = await supabase
      .from('trainers')
      .select('id, name, role, created_at')
      .eq('id', userId)
      .single();

    if (dbError || !trainer) {
      const error: ApiError = {
        error: 'NOT_FOUND',
        message: 'Trainer not found',
      };
      return NextResponse.json(error, { status: 404 });
    }

    return NextResponse.json(trainer as Trainer);
  } catch (err) {
    console.error('Unexpected error:', err);
    const error: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(error, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateTrainerRequest;
    const name = body.name?.trim();

    // Validate name
    if (!name || name.length === 0) {
      const error: ApiError = {
        error: 'VALIDATION_ERROR',
        message: 'Name is required and must contain at least 1 non-whitespace character',
      };
      return NextResponse.json(error, { status: 400 });
    }

    if (name.length > 20) {
      const error: ApiError = {
        error: 'VALIDATION_ERROR',
        message: 'Name must be 20 characters or less',
      };
      return NextResponse.json(error, { status: 400 });
    }

    const supabase = await createClient();

    // Check if trainer with this name already exists (case-insensitive)
    const { data: existingTrainers, error: lookupError } = await supabase
      .from('trainers')
      .select('*')
      .ilike('name', name)
      .limit(1);

    if (!lookupError && existingTrainers && existingTrainers.length > 0) {
      // Return existing trainer
      const existingTrainer = existingTrainers[0];
      const response = NextResponse.json(existingTrainer as Trainer, { status: 200 });
      response.cookies.set('trainer_id', existingTrainer.id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
      return response;
    }

    // Create new trainer
    const { data: trainer, error: dbError } = await supabase
      .from('trainers')
      .insert({ name })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to create trainer. Please try again.',
      };
      return NextResponse.json(error, { status: 500 });
    }

    // Set trainer_id cookie for session
    const response = NextResponse.json(trainer as Trainer, { status: 201 });
    response.cookies.set('trainer_id', trainer.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('Unexpected error:', err);
    const error: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(error, { status: 500 });
  }
}
