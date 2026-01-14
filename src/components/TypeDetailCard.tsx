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
