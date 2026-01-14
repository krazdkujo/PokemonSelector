# Quickstart: Type Effectiveness Reference

**Feature**: 017-type-effectiveness
**Date**: 2026-01-14

## Overview

This guide provides step-by-step instructions for implementing the type effectiveness reference page and API.

---

## Prerequisites

- Node.js 18+ installed
- Project cloned and dependencies installed (`npm install`)
- Development server running (`npm run dev`)
- Existing `src/lib/type-chart.ts` with type effectiveness data

---

## Implementation Steps

### Step 1: Create Types API Endpoint

Create `src/app/api/types/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { TYPE_CHART } from '@/lib/type-chart';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type')?.toLowerCase();

  const availableTypes = Object.keys(TYPE_CHART);

  // No type parameter - return list of all types
  if (!type) {
    return NextResponse.json({ types: availableTypes });
  }

  // Look up specific type
  const typeData = TYPE_CHART[type];

  if (!typeData) {
    // Find similar types for suggestion
    const similar = availableTypes.filter(t =>
      t.includes(type) || type.includes(t)
    );

    return NextResponse.json(
      {
        error: 'TYPE_NOT_FOUND',
        message: `Type '${type}' not found.${similar.length ? ` Did you mean '${similar[0]}'?` : ''}`,
        availableTypes: similar.length ? similar : availableTypes,
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    type,
    strongAgainst: typeData.strongAgainst,
    weakAgainst: typeData.weakAgainst,
    immuneTo: typeData.immuneTo,
  });
}
```

### Step 2: Create Type Effectiveness Grid Component

Create `src/components/TypeEffectivenessGrid.tsx`:

```typescript
'use client';

import { TYPE_CHART, getTypeEffectiveness } from '@/lib/type-chart';

const TYPES = Object.keys(TYPE_CHART);

function getEffectivenessClass(multiplier: number): string {
  if (multiplier === 0) return 'bg-gray-800 text-gray-400';
  if (multiplier >= 2) return 'bg-green-500/20 text-green-400';
  if (multiplier < 1) return 'bg-red-500/20 text-red-400';
  return 'text-[var(--fg-300)]';
}

function getEffectivenessDisplay(multiplier: number): string {
  if (multiplier === 0) return '0';
  if (multiplier === 0.5) return '1/2';
  if (multiplier === 2) return '2';
  return '-';
}

export function TypeEffectivenessGrid() {
  return (
    <div className="overflow-x-auto">
      <table className="text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 bg-[var(--bg-0)] p-2 font-mono">ATK / DEF</th>
            {TYPES.map(type => (
              <th key={type} className="p-2 font-mono capitalize">
                {type.slice(0, 3)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TYPES.map(attackType => (
            <tr key={attackType}>
              <td className="sticky left-0 bg-[var(--bg-0)] p-2 font-mono capitalize font-bold">
                {attackType.slice(0, 3)}
              </td>
              {TYPES.map(defendType => {
                const effectiveness = getTypeEffectiveness(attackType, [defendType]);
                return (
                  <td
                    key={defendType}
                    className={`p-2 text-center ${getEffectivenessClass(effectiveness)}`}
                    title={`${attackType} vs ${defendType}: ${effectiveness}x`}
                  >
                    {getEffectivenessDisplay(effectiveness)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Step 3: Create Type Selector Component

Create `src/components/TypeSelector.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { TYPE_CHART } from '@/lib/type-chart';
import { TypeDetailCard } from './TypeDetailCard';

const TYPES = Object.keys(TYPE_CHART);

export function TypeSelector() {
  const [selectedType, setSelectedType] = useState<string>('');

  return (
    <div className="space-y-4">
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        className="input py-2 capitalize"
      >
        <option value="">Select a type...</option>
        {TYPES.map(type => (
          <option key={type} value={type} className="capitalize">
            {type}
          </option>
        ))}
      </select>

      {selectedType && <TypeDetailCard type={selectedType} />}
    </div>
  );
}
```

### Step 4: Create Type Detail Card Component

Create `src/components/TypeDetailCard.tsx`:

```typescript
'use client';

import { TYPE_CHART } from '@/lib/type-chart';

interface TypeDetailCardProps {
  type: string;
}

export function TypeDetailCard({ type }: TypeDetailCardProps) {
  const typeData = TYPE_CHART[type];
  if (!typeData) return null;

  return (
    <div className="card p-4 space-y-4">
      <h3 className="text-lg font-bold capitalize">{type}</h3>

      {typeData.strongAgainst.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-green-400 mb-1">
            Super Effective Against (2x)
          </h4>
          <div className="flex flex-wrap gap-2">
            {typeData.strongAgainst.map(t => (
              <span key={t} className="px-2 py-1 bg-green-500/20 rounded text-sm capitalize">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {typeData.weakAgainst.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-red-400 mb-1">
            Not Very Effective Against (0.5x)
          </h4>
          <div className="flex flex-wrap gap-2">
            {typeData.weakAgainst.map(t => (
              <span key={t} className="px-2 py-1 bg-red-500/20 rounded text-sm capitalize">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {typeData.immuneTo.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-1">
            No Effect On (0x)
          </h4>
          <div className="flex flex-wrap gap-2">
            {typeData.immuneTo.map(t => (
              <span key={t} className="px-2 py-1 bg-gray-700 rounded text-sm capitalize">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Step 5: Create Types Page

Create `src/app/types/page.tsx`:

```typescript
import Link from 'next/link';
import { TypeEffectivenessGrid } from '@/components/TypeEffectivenessGrid';
import { TypeSelector } from '@/components/TypeSelector';

export default function TypesPage() {
  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <Link
          href="/"
          className="text-xs font-mono uppercase tracking-wider text-[var(--fg-300)] hover:text-[var(--fg-100)]"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-[var(--fg-0)] mt-4 mb-2">
          Type Effectiveness
        </h1>
        <p className="text-[var(--fg-200)]">
          Reference chart showing Pokemon type matchups for battle strategy.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Look Up Type</h2>
        <TypeSelector />
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Full Type Chart</h2>
        <TypeEffectivenessGrid />
      </section>
    </div>
  );
}
```

### Step 6: Add Navigation Link

Update `src/app/layout.tsx` footer to include Types link:

```typescript
<Link href="/types" className="hover:text-[var(--fg-100)] transition-colors">
  Types
</Link>
```

### Step 7: Update Changelog

Add entry to `src/data/changelog.json` for version 1.3.0.

### Step 8: Update API Documentation

Add types endpoint to `src/app/api-docs/page.tsx`.

---

## Testing

### Manual Testing

1. Navigate to `/types`
2. Verify 18x18 grid displays with correct color coding
3. Select a type from dropdown, verify detail card shows
4. Test API: `curl http://localhost:3000/api/types`
5. Test API: `curl http://localhost:3000/api/types?type=fire`
6. Test invalid type: `curl http://localhost:3000/api/types?type=invalid`

### Verification Checklist

- [ ] Grid shows all 18 types as rows and columns
- [ ] Green cells for super effective (2x)
- [ ] Red cells for not very effective (0.5x)
- [ ] Dark cells for immune (0x)
- [ ] Tooltips show on hover
- [ ] Type selector shows detail card
- [ ] API returns correct data
- [ ] 404 for invalid types
- [ ] Mobile: horizontal scroll works
- [ ] Changelog updated
- [ ] API docs updated

---

## Common Issues

### Grid Not Rendering
- Check `TYPE_CHART` import path
- Verify all 18 types exist in type-chart.ts

### Wrong Effectiveness Values
- Review `getTypeEffectiveness` function
- Check that weakAgainst vs strongAgainst arrays are correct

### Mobile Scrolling Issues
- Ensure `overflow-x-auto` is on container
- Check sticky column CSS
