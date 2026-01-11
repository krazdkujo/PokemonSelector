/**
 * Secret Key API Route
 *
 * GET: Returns metadata about the user's secret key (if exists)
 * POST: Generates or regenerates a secret key for the user
 *
 * Note: This route requires session authentication (web UI access)
 * to prevent unauthorized key generation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSecretKey, hashKey } from '@/lib/secret-key';
import type { ApiError, SecretKeyMeta, SecretKeyResponse } from '@/lib/types';

/**
 * GET /api/secret-key
 * Returns metadata about the user's secret key
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the trainer ID from session or cookie
    const trainerId = request.cookies.get('trainer_id')?.value;

    if (!trainerId) {
      const error: ApiError = {
        error: 'UNAUTHORIZED',
        message: 'You must be logged in to view secret key metadata',
      };
      return NextResponse.json(error, { status: 401 });
    }

    // Fetch secret key metadata
    const { data: secret, error: dbError } = await supabase
      .from('user_secrets')
      .select('created_at, last_used_at')
      .eq('user_id', trainerId)
      .single();

    if (dbError && dbError.code !== 'PGRST116') {
      // PGRST116 = no rows found (user has no key)
      console.error('Database error:', dbError);
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to fetch secret key metadata',
      };
      return NextResponse.json(error, { status: 500 });
    }

    const response: SecretKeyMeta = {
      has_key: !!secret,
      created_at: secret?.created_at || null,
      last_used_at: secret?.last_used_at || null,
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

/**
 * POST /api/secret-key
 * Generates or regenerates a secret key for the user
 * Returns the plaintext key only once - it cannot be retrieved again
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the trainer ID from session or cookie
    const trainerId = request.cookies.get('trainer_id')?.value;

    if (!trainerId) {
      const error: ApiError = {
        error: 'UNAUTHORIZED',
        message: 'You must be logged in to generate a secret key',
      };
      return NextResponse.json(error, { status: 401 });
    }

    // Verify the trainer exists
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

    // Generate a new key
    const plainKey = generateSecretKey();
    const keyHash = await hashKey(plainKey);
    const createdAt = new Date().toISOString();

    // Upsert the key (insert or update if exists)
    const { error: upsertError } = await supabase
      .from('user_secrets')
      .upsert(
        {
          user_id: trainerId,
          key_hash: keyHash,
          created_at: createdAt,
          last_used_at: null,
        },
        {
          onConflict: 'user_id',
        }
      );

    if (upsertError) {
      console.error('Database error:', upsertError);
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to save secret key',
      };
      return NextResponse.json(error, { status: 500 });
    }

    const response: SecretKeyResponse = {
      key: plainKey,
      created_at: createdAt,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error('Unexpected error:', err);
    const error: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(error, { status: 500 });
  }
}
