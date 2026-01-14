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
  // Zone colors available via getZoneColorClasses(zone) if needed
  void getZoneColorClasses;

  return (
    <div
      className={`
        relative p-4 border text-left transition-all duration-100
        bg-[var(--bg-100)] border-[var(--border)]
        ${!disabled ? 'hover:border-[var(--fg-200)] hover:bg-[var(--bg-200)]' : 'opacity-50'}
      `}
      style={{ borderRadius: '6px' }}
    >
      {/* Info button */}
      {onPreview && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview(zone.id);
          }}
          className="absolute top-2 right-2 w-6 h-6 bg-[var(--bg-200)] hover:bg-[var(--bg-300)] flex items-center justify-center text-[var(--fg-100)] text-xs font-mono"
          style={{ borderRadius: '4px' }}
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
        <div className="font-semibold text-[var(--fg-0)] pr-8">
          {zone.name}
        </div>
        <p className="text-sm text-[var(--fg-200)] mt-1 line-clamp-2">
          {zone.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {zone.types.map(type => (
            <span
              key={type}
              className={`type-badge type-${type.toLowerCase()}`}
            >
              {type}
            </span>
          ))}
        </div>
      </button>
    </div>
  );
}
