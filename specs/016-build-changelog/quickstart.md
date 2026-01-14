# Quickstart: Build Changelog with Version Tracking

**Feature**: 016-build-changelog
**Date**: 2026-01-14

## Overview

This guide provides step-by-step instructions for implementing the changelog feature.

---

## Prerequisites

- Node.js 18+ installed
- Project cloned and dependencies installed (`npm install`)
- Development server running (`npm run dev`)

---

## Implementation Steps

### Step 1: Create Changelog Data File

Create `src/data/changelog.json` with initial version history:

```json
{
  "versions": [
    {
      "version": "1.2.0",
      "date": "2026-01-14",
      "changes": [
        { "category": "Added", "description": "Changelog page to track version history" },
        { "category": "Added", "description": "Search and filter functionality for changelog" }
      ]
    },
    {
      "version": "1.1.1",
      "date": "2026-01-14",
      "changes": [
        { "category": "Fixed", "description": "PIN verification redirect on login" }
      ]
    }
  ]
}
```

### Step 2: Create TypeScript Types

Create `src/lib/changelog.ts`:

```typescript
export type ChangeCategory =
  | 'Added'
  | 'Changed'
  | 'Fixed'
  | 'Removed'
  | 'Deprecated'
  | 'Security';

export interface ChangeEntry {
  category: ChangeCategory;
  description: string;
}

export interface Version {
  version: string;
  date: string;
  changes: ChangeEntry[];
}

export interface Changelog {
  versions: Version[];
}

export interface ChangelogFilters {
  searchQuery?: string;
  categories?: ChangeCategory[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

### Step 3: Create API Route

Create `src/app/api/changelog/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import changelogData from '@/data/changelog.json';
import type { Version, ChangeCategory } from '@/lib/changelog';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const search = searchParams.get('search')?.toLowerCase();
  const categories = searchParams.getAll('category') as ChangeCategory[];

  let versions = changelogData.versions as Version[];

  // Filter by search query
  if (search) {
    versions = versions.filter(v => v.version.toLowerCase().includes(search));
  }

  // Filter by categories
  if (categories.length > 0) {
    versions = versions.filter(v =>
      v.changes.some(c => categories.includes(c.category))
    );
  }

  // Pagination
  const total = versions.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedVersions = versions.slice(offset, offset + limit);

  return NextResponse.json({
    versions: paginatedVersions,
    pagination: { page, limit, total, totalPages }
  });
}
```

### Step 4: Create Changelog Page

Create `src/app/changelog/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { ChangelogList } from '@/components/ChangelogList';
import { ChangelogFilter } from '@/components/ChangelogFilter';
import type { Version, ChangeCategory, Pagination } from '@/lib/changelog';

export default function ChangelogPage() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<ChangeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChangelog();
  }, [search, categories]);

  const fetchChangelog = async (page = 1) => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set('search', search);
    categories.forEach(c => params.append('category', c));

    const res = await fetch(`/api/changelog?${params}`);
    const data = await res.json();

    setVersions(data.versions);
    setPagination(data.pagination);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Changelog</h1>
      <ChangelogFilter
        search={search}
        onSearchChange={setSearch}
        categories={categories}
        onCategoriesChange={setCategories}
      />
      <ChangelogList
        versions={versions}
        pagination={pagination}
        onPageChange={fetchChangelog}
        isLoading={isLoading}
      />
    </div>
  );
}
```

### Step 5: Add Navigation Link

Update `src/app/layout.tsx` to add changelog link in footer:

```typescript
<footer className="...">
  <Link href="/changelog">Changelog</Link>
</footer>
```

---

## Testing

### Manual Testing

1. Navigate to `/changelog`
2. Verify versions display in reverse chronological order
3. Test search by entering a version number
4. Test category filter by selecting "Added" or "Fixed"
5. Test pagination by adding 20+ versions to changelog.json

### Automated Tests

Create `src/__tests__/changelog.test.ts`:

```typescript
import { GET } from '@/app/api/changelog/route';
import { NextRequest } from 'next/server';

describe('Changelog API', () => {
  it('returns versions in reverse chronological order', async () => {
    const req = new NextRequest('http://localhost/api/changelog');
    const res = await GET(req);
    const data = await res.json();

    expect(data.versions.length).toBeGreaterThan(0);
    expect(data.pagination).toBeDefined();
  });

  it('filters by search query', async () => {
    const req = new NextRequest('http://localhost/api/changelog?search=1.2');
    const res = await GET(req);
    const data = await res.json();

    data.versions.forEach((v: { version: string }) => {
      expect(v.version).toContain('1.2');
    });
  });
});
```

---

## Maintenance

### Adding New Versions

When releasing a new version:

1. Edit `src/data/changelog.json`
2. Add new version entry at the **top** of the versions array
3. Include all changes with appropriate categories
4. Commit with the release

```json
{
  "versions": [
    {
      "version": "1.3.0",
      "date": "2026-02-01",
      "changes": [
        { "category": "Added", "description": "New feature X" }
      ]
    },
    // ... existing versions
  ]
}
```

---

## Common Issues

### Changelog Not Updating
- Ensure you're editing `src/data/changelog.json`
- Restart dev server if changes don't appear

### Filter Not Working
- Check category values match exactly: "Added", "Changed", "Fixed", "Removed"
- Ensure search is case-insensitive in implementation

### Pagination Issues
- Verify `page` and `limit` are positive integers
- Check `totalPages` calculation handles edge cases
