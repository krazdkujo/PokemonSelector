import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import type { ApiError } from '@/lib/types';

interface UnlockRequest {
  user_id: string;
}

/**
 * POST /api/pin/admin/unlock
 * Admin endpoint to unlock a user's account (clear lockout)
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    // Support both session cookie and API key authentication
    const adminId = cookieStore.get('trainer_id')?.value || request.headers.get('X-User-ID');

    if (!adminId) {
      const error: ApiError = {
        error: 'UNAUTHORIZED',
        message: 'Authentication required',
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

    const body: UnlockRequest = await request.json();
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

    // Unlock account
    const { error: updateError } = await supabase
      .from('trainers')
      .update({
        pin_failed_attempts: 0,
        pin_lockout_until: null,
      })
      .eq('id', user_id);

    if (updateError) {
      console.error('Error unlocking account:', updateError);
      const error: ApiError = {
        error: 'INTERNAL_ERROR',
        message: 'Failed to unlock account',
      };
      return NextResponse.json(error, { status: 500 });
    }

    // Log admin action
    await supabase
      .from('pin_admin_log')
      .insert({ action_type: 'unlock' });

    return NextResponse.json(
      { success: true, message: 'Account unlocked successfully' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Unexpected error in admin unlock:', err);
    const error: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(error, { status: 500 });
  }
}
