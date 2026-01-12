import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { verifyPin, validatePinFormat } from '@/lib/pin';
import type { ApiError, PinVerifyResult } from '@/lib/types';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

interface VerifyPinRequest {
  pin: string;
}

/**
 * POST /api/pin/verify
 * Verifies the PIN for the authenticated user
 */
export async function POST(request: NextRequest) {
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

    const body: VerifyPinRequest = await request.json();
    const { pin } = body;

    // Validate PIN format
    if (!validatePinFormat(pin)) {
      const error: ApiError = {
        error: 'INVALID_PIN_FORMAT',
        message: 'PIN must be exactly 4 numeric digits',
      };
      return NextResponse.json(error, { status: 400 });
    }

    const supabase = await createClient();

    // Get trainer with PIN data
    const { data: trainer, error: trainerError } = await supabase
      .from('trainers')
      .select('id, pin_hash, pin_failed_attempts, pin_lockout_until, pin_is_temporary')
      .eq('id', trainerId)
      .single();

    if (trainerError || !trainer) {
      const error: ApiError = {
        error: 'NOT_FOUND',
        message: 'Trainer not found',
      };
      return NextResponse.json(error, { status: 404 });
    }

    // Check if account is locked
    const now = new Date();
    const lockoutUntil = trainer.pin_lockout_until
      ? new Date(trainer.pin_lockout_until)
      : null;

    if (lockoutUntil && lockoutUntil > now) {
      const remainingSeconds = Math.ceil((lockoutUntil.getTime() - now.getTime()) / 1000);
      const minutes = Math.floor(remainingSeconds / 60);

      const result: PinVerifyResult = {
        valid: false,
        locked: true,
        lockout_remaining_seconds: remainingSeconds,
        message: `Account locked. Try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
      };

      return NextResponse.json(result, { status: 423 });
    }

    // Check if trainer has a PIN set
    if (!trainer.pin_hash) {
      const error: ApiError = {
        error: 'NO_PIN',
        message: 'No PIN set for this account',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Verify the PIN
    const isValid = await verifyPin(pin, trainer.pin_hash);

    if (!isValid) {
      // Increment failed attempts
      const newAttempts = (trainer.pin_failed_attempts || 0) + 1;
      const updateData: Record<string, unknown> = {
        pin_failed_attempts: newAttempts,
      };

      // Check if should lock account
      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockUntil = new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000);
        updateData.pin_lockout_until = lockUntil.toISOString();

        await supabase
          .from('trainers')
          .update(updateData)
          .eq('id', trainerId);

        const remainingSeconds = LOCKOUT_MINUTES * 60;
        const result: PinVerifyResult = {
          valid: false,
          locked: true,
          lockout_remaining_seconds: remainingSeconds,
          message: `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`,
        };

        return NextResponse.json(result, { status: 423 });
      }

      await supabase
        .from('trainers')
        .update(updateData)
        .eq('id', trainerId);

      const attemptsRemaining = MAX_FAILED_ATTEMPTS - newAttempts;
      const result: PinVerifyResult = {
        valid: false,
        message: `Incorrect PIN. ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining.`,
      };

      return NextResponse.json(result, { status: 200 });
    }

    // PIN is valid - reset failed attempts
    await supabase
      .from('trainers')
      .update({
        pin_failed_attempts: 0,
        pin_lockout_until: null,
      })
      .eq('id', trainerId);

    // Check if temporary PIN that requires change
    if (trainer.pin_is_temporary) {
      const result: PinVerifyResult = {
        valid: true,
        must_change: true,
        message: 'Your PIN was reset by support. Please create a new PIN.',
      };

      return NextResponse.json(result, { status: 200 });
    }

    // Success
    const result: PinVerifyResult = {
      valid: true,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in PIN verify:', err);
    const error: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(error, { status: 500 });
  }
}
