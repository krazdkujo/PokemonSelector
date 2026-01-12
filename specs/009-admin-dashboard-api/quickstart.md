# Quickstart: Admin Dashboard and External API Documentation

**Branch**: `009-admin-dashboard-api` | **Date**: 2026-01-11

## Overview

This guide provides step-by-step instructions for implementing the admin dashboard enhancements and comprehensive API documentation.

---

## Prerequisites

- Node.js 18+ installed
- Existing Pokemon Starter Selector codebase
- Access to Supabase dashboard (for initial admin setup)
- At least one trainer account with admin role

---

## Setup Steps

### 1. Initial Admin Setup (One-time, via Database)

Before the admin dashboard can be used, at least one admin must be created via direct database modification:

```sql
-- In Supabase SQL Editor
UPDATE trainers
SET role = 'admin'
WHERE name = 'YourAdminName';
```

### 2. Verify Existing Admin Page Access

```bash
npm run dev
# Navigate to http://localhost:3000/admin
# Should redirect to dashboard if not admin
```

---

## Implementation Tasks

### Task 1: Extend TrainerWithStats Type

**File**: `src/lib/types.ts`

Add the new type after existing `TrainerWithStarter`:

```typescript
// Statistics summary for admin dashboard
export interface TrainerStatsSummary {
  battles_won: number;
  battles_lost: number;
  pokemon_captured: number;
  pokemon_count: number;
}

// Extended trainer type with statistics
export interface TrainerWithStats extends Trainer {
  starter: Pokemon | null;
  stats: TrainerStatsSummary | null;
}
```

### Task 2: Enhance /api/trainers Endpoint

**File**: `src/app/api/trainers/route.ts`

Modify the GET handler to include statistics:

```typescript
// After fetching trainers, get stats for each
const trainersWithStats = await Promise.all(
  trainers.map(async (trainer) => {
    // Get user stats
    const { data: stats } = await supabase
      .from('user_stats')
      .select('battles_won, battles_lost, pokemon_captured')
      .eq('user_id', trainer.id)
      .single();

    // Get Pokemon count
    const { count: pokemonCount } = await supabase
      .from('pokemon_owned')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', trainer.id);

    return {
      ...trainer,
      starter: trainer.starter_pokemon_id
        ? getPokemonById(trainer.starter_pokemon_id)
        : null,
      stats: stats ? {
        ...stats,
        pokemon_count: pokemonCount || 0,
      } : null,
    };
  })
);
```

### Task 3: Create Role Assignment Endpoint

**File**: `src/app/api/trainers/[id]/role/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiError } from '@/lib/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: trainerId } = await params;
  const supabase = await createClient();

  // 1. Get requester from session
  const requesterId = request.cookies.get('trainer_id')?.value;
  if (!requesterId) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  // 2. Verify requester is admin
  const { data: requester } = await supabase
    .from('trainers')
    .select('role')
    .eq('id', requesterId)
    .single();

  if (requester?.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  // 3. Parse and validate new role
  const body = await request.json();
  const newRole = body.role;
  if (!['trainer', 'admin'].includes(newRole)) {
    return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 });
  }

  // 4. Get target trainer's current role
  const { data: target } = await supabase
    .from('trainers')
    .select('role')
    .eq('id', trainerId)
    .single();

  if (!target) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  // 5. Prevent last admin demotion
  if (target.role === 'admin' && newRole === 'trainer') {
    const { count } = await supabase
      .from('trainers')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');

    if (count === 1) {
      return NextResponse.json(
        { error: 'CANNOT_REMOVE_LAST_ADMIN' },
        { status: 400 }
      );
    }
  }

  // 6. Update role
  const { data: updated } = await supabase
    .from('trainers')
    .update({ role: newRole })
    .eq('id', trainerId)
    .select()
    .single();

  return NextResponse.json({
    trainer_id: trainerId,
    previous_role: target.role,
    new_role: newRole,
    updated_at: updated?.updated_at,
  });
}
```

### Task 4: Enhance TrainerList Component

**File**: `src/components/TrainerList.tsx`

Add statistics columns to the table:

```typescript
// Add to table header
<th>Battles</th>
<th>Captured</th>
<th>Collection</th>

// Add to table body (in trainer row)
<td>{trainer.stats?.battles_won ?? 0}W / {trainer.stats?.battles_lost ?? 0}L</td>
<td>{trainer.stats?.pokemon_captured ?? 0}</td>
<td>{trainer.stats?.pokemon_count ?? 0}</td>
```

### Task 5: Add Role Assignment UI

**File**: `src/app/admin/page.tsx`

Add role toggle button to each trainer row (only for non-self):

```typescript
const handleRoleChange = async (trainerId: string, newRole: string) => {
  const response = await fetch(`/api/trainers/${trainerId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: newRole }),
  });

  if (response.ok) {
    // Refresh trainer list
    loadData();
  }
};
```

### Task 6: Complete API Documentation

**File**: `docs/API.md`

Replace existing content with comprehensive documentation including:
- All external endpoints
- Authentication guide
- Request/response examples
- Error reference

See `specs/009-admin-dashboard-api/contracts/openapi.yaml` for the complete API specification.

---

## Testing Checklist

```markdown
- [ ] Admin can access /admin page
- [ ] Non-admin is redirected from /admin to /dashboard
- [ ] Trainer list displays all statistics
- [ ] Admin can promote trainer to admin
- [ ] Admin can demote admin to trainer (if not last)
- [ ] Last admin cannot be demoted (error shown)
- [ ] API documentation renders correctly
- [ ] All code examples in docs work
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/lib/types.ts` | MODIFY | Add TrainerWithStats type |
| `src/app/api/trainers/route.ts` | MODIFY | Include statistics in response |
| `src/app/api/trainers/[id]/role/route.ts` | CREATE | Role assignment endpoint |
| `src/components/TrainerList.tsx` | MODIFY | Add statistics columns |
| `src/app/admin/page.tsx` | MODIFY | Add role toggle UI |
| `docs/API.md` | REPLACE | Complete API documentation |
| `docs/openapi.yaml` | CREATE | OpenAPI specification |

---

## Verification

After implementation, verify:

1. **Admin Dashboard**: Navigate to `/admin` as an admin and confirm all trainer stats display
2. **Role Assignment**: Promote a trainer to admin, verify they can access admin page
3. **Last Admin Protection**: Try to demote the only admin, verify error
4. **API Documentation**: Review `docs/API.md` for completeness and accuracy
