/**
 * Role Assignment API Route
 *
 * PATCH: Updates a trainer's role (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiError, RoleUpdateResponse } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/trainers/[id]/role
 * Updates the role of a trainer. Only accessible to admin users.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: trainerId } = await params;
    const supabase = await createClient();

    // Get requester from session cookie or API key header
    const requesterId = request.cookies.get('trainer_id')?.value || request.headers.get('X-User-ID');

    if (!requesterId) {
      const error: ApiError = {
        error: 'UNAUTHORIZED',
        message: 'Authentication required',
      };
      return NextResponse.json(error, { status: 401 });
    }

    // Verify requester is an admin
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
        message: 'Only admins can change user roles',
      };
      return NextResponse.json(error, { status: 403 });
    }

    // Parse and validate the request body
    const body = await request.json();
    const newRole = body.role;

    if (!newRole || !['trainer', 'admin'].includes(newRole)) {
      const error: ApiError = {
        error: 'VALIDATION_ERROR',
        message: "Role must be 'trainer' or 'admin'",
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Get the target trainer's current role
    const { data: targetTrainer, error: targetError } = await supabase
      .from('trainers')
      .select('role, name')
      .eq('id', trainerId)
      .single();

    if (targetError || !targetTrainer) {
      const error: ApiError = {
        error: 'NOT_FOUND',
        message: 'Trainer not found',
      };
      return NextResponse.json(error, { status: 404 });
    }

    const previousRole = targetTrainer.role;

    // If demoting an admin, check if they're the last admin
    if (previousRole === 'admin' && newRole === 'trainer') {
      const { count: adminCount, error: countError } = await supabase
        .from('trainers')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      if (countError) {
        console.error('Database error:', countError);
        const error: ApiError = {
          error: 'DATABASE_ERROR',
          message: 'Failed to verify admin count',
        };
        return NextResponse.json(error, { status: 500 });
      }

      if (adminCount === 1) {
        const error: ApiError = {
          error: 'CANNOT_REMOVE_LAST_ADMIN',
          message: 'Cannot demote the last admin. Assign another admin first.',
        };
        return NextResponse.json(error, { status: 400 });
      }
    }

    // Update the trainer's role
    const { data: updatedTrainer, error: updateError } = await supabase
      .from('trainers')
      .update({ role: newRole })
      .eq('id', trainerId)
      .select('updated_at')
      .single();

    if (updateError) {
      console.error('Database error:', updateError);
      const error: ApiError = {
        error: 'DATABASE_ERROR',
        message: 'Failed to update role',
      };
      return NextResponse.json(error, { status: 500 });
    }

    const response: RoleUpdateResponse = {
      trainer_id: trainerId,
      previous_role: previousRole as 'trainer' | 'admin',
      new_role: newRole,
      updated_at: updatedTrainer.updated_at,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error('Unexpected error:', err);
    const error: ApiError = {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
    return NextResponse.json(error, { status: 500 });
  }
}
