/**
 * API Authentication Middleware
 *
 * Validates X-API-Key header for API routes and injects X-User-ID header
 * when authentication succeeds.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyKey } from './lib/secret-key';

// Routes that don't require API key authentication
const PUBLIC_ROUTES = [
  '/api/health',
];

// Routes that are only accessible via web UI (session-based)
const WEB_ONLY_ROUTES = [
  '/api/trainer',  // Existing trainer routes use session
];

// Check if a path matches any of the patterns
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only process API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow public routes without authentication
  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  // For web-only routes, let them pass through (they handle their own session auth)
  if (matchesRoute(pathname, WEB_ONLY_ROUTES)) {
    return NextResponse.next();
  }

  // Check for API key
  const apiKey = request.headers.get('X-API-Key');

  // If no API key provided, let the request through
  // Individual route handlers will decide if they require auth
  if (!apiKey) {
    return NextResponse.next();
  }

  try {
    // Create a service role client to query user_secrets
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Look up all user secrets and verify the key
    const { data: secrets, error } = await supabase
      .from('user_secrets')
      .select('user_id, key_hash');

    if (error) {
      console.error('Error querying user_secrets:', error);
      return NextResponse.json(
        { error: 'INTERNAL_ERROR', message: 'Authentication service error' },
        { status: 500 }
      );
    }

    // Find matching user by verifying key against each hash
    let matchedUserId: string | null = null;

    for (const secret of secrets || []) {
      const matches = await verifyKey(apiKey, secret.key_hash);
      if (matches) {
        matchedUserId = secret.user_id;

        // Update last_used_at timestamp
        await supabase
          .from('user_secrets')
          .update({ last_used_at: new Date().toISOString() })
          .eq('user_id', secret.user_id);

        break;
      }
    }

    if (!matchedUserId) {
      return NextResponse.json(
        { error: 'INVALID_KEY', message: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Inject the user ID into the request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-User-ID', matchedUserId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    '/api/:path*',
  ],
};
