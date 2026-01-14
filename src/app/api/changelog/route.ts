import { NextRequest, NextResponse } from 'next/server';
import changelogData from '@/data/changelog.json';
import type { Version, ChangeCategory, ChangelogResponse } from '@/lib/changelog';

/**
 * GET /api/changelog
 * Returns changelog entries with optional filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse pagination params
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    // Parse filter params
    const search = searchParams.get('search')?.toLowerCase().trim();
    const categories = searchParams.getAll('category').filter(Boolean) as ChangeCategory[];

    // Start with all versions
    let versions = changelogData.versions as Version[];

    // Filter by search query (version number match)
    if (search) {
      versions = versions.filter(v => v.version.toLowerCase().includes(search));
    }

    // Filter by categories (show versions that have at least one change in the selected categories)
    if (categories.length > 0) {
      versions = versions.filter(v =>
        v.changes.some(c => categories.includes(c.category as ChangeCategory))
      );
    }

    // Calculate pagination
    const total = versions.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedVersions = versions.slice(offset, offset + limit);

    const response: ChangelogResponse = {
      versions: paginatedVersions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Changelog API error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to fetch changelog' },
      { status: 500 }
    );
  }
}
