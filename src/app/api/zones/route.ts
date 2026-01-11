/**
 * Zones API Route
 *
 * GET: Returns all available combat zones
 */

import { NextResponse } from 'next/server';
import { getAllZones } from '@/lib/zones';

/**
 * GET /api/zones
 * Returns all available combat zones
 * Public endpoint - no authentication required
 */
export async function GET() {
  const zones = getAllZones();

  return NextResponse.json({
    zones
  });
}
