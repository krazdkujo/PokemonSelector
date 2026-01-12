import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import type { PinStatus, ApiError } from '@/lib/types';

/**
 * GET /api/pin/status
 * Returns PIN status for the authenticated user
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const trainerId = cookieStore.get('trainer_id')?.value;

    if (!trainerId) {
      const error: ApiError = {
        error: 'UNAUTHORIZED',
        message: 'Not authenticated',
      };
      return NextResponse.json(error, { status: 401 });
    }

    const supabase = await createClient();

    const { data: trainer, error: trainerError } = await supabase
      .from('trainers')
      .select('pin_hash, pin_lockout_until, pin_is_temporary')
      .eq('id', trainerId)
      .single();

    if (trainerError || !trainer) {
      const error: ApiError = {
        error: 'NOT_FOUND',
        message: 'Trainer not found',
      };
      return NextResponse.json(error, { status: 404 });
    }

    const now = new Date();
    const lockoutUntil = trainer.pin_lockout_until
      ? new Date(trainer.pin_lockout_until)
      : null;
    const isLocked = lockoutUntil !== null && lockoutUntil > now;

    const status: PinStatus = {
      has_pin: trainer.pin_hash !== null,
      is_locked: isLocked,
      is_temporary: trainer.pin_is_temporary ?? false,
    };

    if (isLocked && lockoutUntil) {
      status.lockout_remaining_seconds = Math.ceil(
        (lockoutUntil.getTime() - now.getTime()) / 1000
      );
    }

    return NextResponse.json(status, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in PIN status:', err);
    const error: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(error, { status: 500 });
  }
}
