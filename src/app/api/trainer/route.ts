import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Trainer, CreateTrainerRequest, ApiError } from '@/lib/types';

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

    // Check if trainer already exists (case-insensitive)
    const { data: existingTrainer } = await supabase
      .from('trainers')
      .select()
      .ilike('name', name)
      .single();

    if (existingTrainer) {
      // Login: return existing trainer
      return NextResponse.json(existingTrainer as Trainer, { status: 200 });
    }

    // Register: create new trainer
    const { data: newTrainer, error: dbError } = await supabase
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

    return NextResponse.json(newTrainer as Trainer, { status: 201 });
  } catch (err) {
    console.error('Unexpected error:', err);
    const error: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(error, { status: 500 });
  }
}
