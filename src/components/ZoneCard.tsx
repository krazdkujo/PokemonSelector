'use client';

import type { Zone } from '@/lib/types';
import { getZoneColorClasses } from '@/lib/zones';

interface ZoneCardProps {
  zone: Zone;
  onSelect: (zoneId: string) => void;
  onPreview?: (zoneId: string) => void;
  disabled?: boolean;
}

export function ZoneCard({ zone, onSelect, onPreview, disabled = false }: ZoneCardProps) {
  const colors = getZoneColorClasses(zone);

  return (
    <div
      className={`
        relative p-4 rounded-lg border-2 text-left transition-all duration-200
        ${colors.bgLight} ${colors.border}
        ${!disabled ? 'hover:shadow-lg' : 'opacity-50'}
      `}
    >
      {/* Info button */}
      {onPreview && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview(zone.id);
          }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-bold"
          title="View zone details"
        >
          ?
        </button>
      )}

      <button
        onClick={() => onSelect(zone.id)}
        disabled={disabled}
        className={`
          w-full text-left
          disabled:cursor-not-allowed
          focus:outline-none
        `}
      >
        <div className={`font-bold text-lg ${colors.text} pr-8`}>
          {zone.name}
        </div>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {zone.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {zone.types.map(type => (
            <span
              key={type}
              className={`
                px-2 py-0.5 text-xs rounded-full
                ${colors.bg} text-white font-medium
              `}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          ))}
        </div>
      </button>
    </div>
  );
}
