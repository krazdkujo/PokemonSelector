import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyPin, validatePinFormat } from '@/lib/pin';
import type { Trainer, CreateTrainerRequest, ApiError } from '@/lib/types';

const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

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
    const body = await request.json() as CreateTrainerRequest & { pin?: string };
    const name = body.name?.trim();
    const pin = body.pin;

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
      // Existing trainer - require PIN verification if they have one set
      const existingTrainer = existingTrainers[0];

      // Check if account has a PIN set
      if (existingTrainer.pin_hash) {
        // Check if account is locked out
        if (existingTrainer.pin_lockout_until) {
          const lockoutUntil = new Date(existingTrainer.pin_lockout_until);
          if (lockoutUntil > new Date()) {
            const remainingMs = lockoutUntil.getTime() - Date.now();
            const remainingSecs = Math.ceil(remainingMs / 1000);
            const error: ApiError = {
              error: 'ACCOUNT_LOCKED',
              message: `Account is locked. Try again in ${Math.ceil(remainingSecs / 60)} minutes.`,
            };
            return NextResponse.json({ ...error, lockout_remaining_seconds: remainingSecs }, { status: 423 });
          }
        }

        // PIN is required for existing accounts with PIN set
        if (!pin) {
          const error: ApiError = {
            error: 'PIN_REQUIRED',
            message: 'PIN is required for this account',
          };
          return NextResponse.json(error, { status: 401 });
        }

        // Validate PIN format
        if (!validatePinFormat(pin)) {
          const error: ApiError = {
            error: 'INVALID_PIN_FORMAT',
            message: 'PIN must be exactly 4 numeric digits',
          };
          return NextResponse.json(error, { status: 400 });
        }

        // Verify PIN
        const pinValid = await verifyPin(pin, existingTrainer.pin_hash);

        if (!pinValid) {
          // Increment failed attempts
          const newAttempts = (existingTrainer.pin_failed_attempts || 0) + 1;
          const updates: Record<string, unknown> = { pin_failed_attempts: newAttempts };

          // Lock account if too many attempts
          if (newAttempts >= MAX_PIN_ATTEMPTS) {
            updates.pin_lockout_until = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
          }

          await supabase
            .from('trainers')
            .update(updates)
            .eq('id', existingTrainer.id);

          const attemptsRemaining = MAX_PIN_ATTEMPTS - newAttempts;
          if (attemptsRemaining <= 0) {
            const error: ApiError = {
              error: 'ACCOUNT_LOCKED',
              message: 'Too many failed attempts. Account locked for 15 minutes.',
            };
            return NextResponse.json({ ...error, lockout_remaining_seconds: LOCKOUT_DURATION_MS / 1000 }, { status: 423 });
          }

          const error: ApiError = {
            error: 'INVALID_PIN',
            message: `Incorrect PIN. ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining.`,
          };
          return NextResponse.json(error, { status: 401 });
        }

        // PIN verified - reset failed attempts
        await supabase
          .from('trainers')
          .update({ pin_failed_attempts: 0, pin_lockout_until: null })
          .eq('id', existingTrainer.id);

        // Check if PIN is temporary (needs to be changed)
        const mustChangePin = existingTrainer.pin_is_temporary === true;

        // Return existing trainer with session
        const responseData = {
          ...existingTrainer,
          ...(mustChangePin && { must_change_pin: true }),
        };
        const response = NextResponse.json(responseData as Trainer, { status: 200 });
        response.cookies.set('trainer_id', existingTrainer.id, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
        });
        return response;
      }

      // No PIN set - allow login but indicate they should set one
      const response = NextResponse.json({ ...existingTrainer, pin_not_set: true } as Trainer, { status: 200 });
      response.cookies.set('trainer_id', existingTrainer.id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
      return response;
    }

    // Create new trainer (no PIN required for registration)
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
    const response = NextResponse.json({ ...trainer, pin_not_set: true } as Trainer, { status: 201 });
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
