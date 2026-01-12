import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { hashPin, validatePinFormat } from '@/lib/pin';
import type { ApiError } from '@/lib/types';

interface CreatePinRequest {
  pin: string;
  confirm_pin: string;
}

/**
 * POST /api/pin/create
 * Creates or updates the PIN for the authenticated user
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

    const body: CreatePinRequest = await request.json();
    const { pin, confirm_pin } = body;

    // Validate PIN format
    if (!validatePinFormat(pin)) {
      const error: ApiError = {
        error: 'INVALID_PIN_FORMAT',
        message: 'PIN must be exactly 4 numeric digits',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Validate PINs match
    if (pin !== confirm_pin) {
      const error: ApiError = {
        error: 'PIN_MISMATCH',
        message: 'PINs do not match',
      };
      return NextResponse.json(error, { status: 400 });
    }

    const supabase = await createClient();

    // Check if trainer exists
    const { data: trainer, error: trainerError } = await supabase
      .from('trainers')
      .select('id')
      .eq('id', trainerId)
      .single();

    if (trainerError || !trainer) {
      const error: ApiError = {
        error: 'NOT_FOUND',
        message: 'Trainer not found',
      };
      return NextResponse.json(error, { status: 404 });
    }

    // Hash the PIN
    const pinHash = await hashPin(pin);

    // Update trainer with new PIN
    const { error: updateError } = await supabase
      .from('trainers')
      .update({
        pin_hash: pinHash,
        pin_is_temporary: false,
        pin_failed_attempts: 0,
        pin_lockout_until: null,
        pin_created_at: new Date().toISOString(),
      })
      .eq('id', trainerId);

    if (updateError) {
      console.error('Error updating PIN:', updateError);
      const error: ApiError = {
        error: 'INTERNAL_ERROR',
        message: 'Failed to create PIN',
      };
      return NextResponse.json(error, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: 'PIN created successfully' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Unexpected error in PIN create:', err);
    const error: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(error, { status: 500 });
  }
}
