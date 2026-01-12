'use client';

import { useState, useEffect } from 'react';
import type { Zone } from '@/lib/types';
import { ZoneCard } from './ZoneCard';
import { ZonePreview } from './ZonePreview';

interface ZoneSelectorProps {
  onSelect: (zoneId: string) => void;
  disabled?: boolean;
}

export function ZoneSelector({ onSelect, disabled = false }: ZoneSelectorProps) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewZoneId, setPreviewZoneId] = useState<string | null>(null);

  useEffect(() => {
    async function loadZones() {
      try {
        const response = await fetch('/api/zones');
        if (!response.ok) {
          throw new Error('Failed to load zones');
        }
        const data = await response.json();
        setZones(data.zones);
      } catch (err) {
        setError('Failed to load combat zones');
        console.error('Error loading zones:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadZones();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading zones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Select a Zone</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Choose a combat zone to explore. Each zone has different Pokemon types you can encounter.
        Click the ? button on any zone to see example Pokemon.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {zones.map(zone => (
          <ZoneCard
            key={zone.id}
            zone={zone}
            onSelect={onSelect}
            onPreview={setPreviewZoneId}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Preview modal */}
      {previewZoneId && (
        <ZonePreview
          zoneId={previewZoneId}
          onClose={() => setPreviewZoneId(null)}
        />
      )}
    </div>
  );
}
