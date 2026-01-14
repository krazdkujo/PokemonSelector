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
