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
            <th className="sticky left-0 bg-[var(--bg-0)] p-2 font-mono z-10">ATK / DEF</th>
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
              <td className="sticky left-0 bg-[var(--bg-0)] p-2 font-mono capitalize font-bold z-10">
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
