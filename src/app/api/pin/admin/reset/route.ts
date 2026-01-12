import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import type { ApiError } from '@/lib/types';

interface ResetPinRequest {
  user_id: string;
}

/**
 * POST /api/pin/admin/reset
 * Admin endpoint to reset (clear) a user's PIN
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('trainer_id')?.value;

    if (!adminId) {
      const error: ApiError = {
        error: 'UNAUTHORIZED',
        message: 'Not authenticated',
      };
      return NextResponse.json(error, { status: 401 });
    }

    const supabase = await createClient();

    // Verify requester is an admin
    const { data: admin, error: adminError } = await supabase
      .from('trainers')
      .select('role')
      .eq('id', adminId)
      .single();

    if (adminError || !admin || admin.role !== 'admin') {
      const error: ApiError = {
        error: 'FORBIDDEN',
        message: 'Admin access required',
      };
      return NextResponse.json(error, { status: 403 });
    }

    const body: ResetPinRequest = await request.json();
    const { user_id } = body;

    if (!user_id) {
      const error: ApiError = {
        error: 'INVALID_REQUEST',
        message: 'user_id is required',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Check if target user exists
    const { data: targetUser, error: userError } = await supabase
      .from('trainers')
      .select('id')
      .eq('id', user_id)
      .single();

    if (userError || !targetUser) {
      const error: ApiError = {
        error: 'NOT_FOUND',
        message: 'User not found',
      };
      return NextResponse.json(error, { status: 404 });
    }

    // Reset PIN (clear hash)
    const { error: updateError } = await supabase
      .from('trainers')
      .update({
        pin_hash: null,
        pin_is_temporary: false,
        pin_failed_attempts: 0,
        pin_lockout_until: null,
        pin_created_at: null,
      })
      .eq('id', user_id);

    if (updateError) {
      console.error('Error resetting PIN:', updateError);
      const error: ApiError = {
        error: 'INTERNAL_ERROR',
        message: 'Failed to reset PIN',
      };
      return NextResponse.json(error, { status: 500 });
    }

    // Log admin action
    await supabase
      .from('pin_admin_log')
      .insert({ action_type: 'reset' });

    return NextResponse.json(
      { success: true, message: 'PIN reset successfully' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Unexpected error in admin PIN reset:', err);
    const error: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(error, { status: 500 });
  }
}
