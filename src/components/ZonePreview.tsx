'use client';

import { useState, useEffect } from 'react';
import type { ZonePreviewResponse, ZoneDifficulty } from '@/lib/types';

interface ZonePreviewProps {
  zoneId: string;
  onClose: () => void;
}

export function ZonePreview({ zoneId, onClose }: ZonePreviewProps) {
  const [preview, setPreview] = useState<ZonePreviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPreview() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/zones/${zoneId}/preview`);
        if (!response.ok) {
          throw new Error('Failed to load zone preview');
        }
        const data = await response.json();
        setPreview(data);
      } catch (err) {
        setError('Failed to load zone preview');
        console.error('Error loading preview:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPreview();
  }, [zoneId]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="card p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="loading-spinner h-6 w-6 mx-auto"></div>
            <p className="mt-2 text-[var(--fg-200)] text-sm font-mono">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="card p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <p className="text-[var(--accent-error)]">{error || 'Failed to load preview'}</p>
            <button
              onClick={onClose}
              className="mt-4 btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const difficulties: ZoneDifficulty[] = ['easy', 'medium', 'hard'];
  const difficultyColors = {
    easy: { text: 'text-[var(--accent-success)]', border: 'border-[var(--accent-success)]' },
    medium: { text: 'text-[var(--accent-warning)]', border: 'border-[var(--accent-warning)]' },
    hard: { text: 'text-[var(--accent-error)]', border: 'border-[var(--accent-error)]' },
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="card p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--fg-0)]">{preview.zone.name}</h2>
            <div className="flex flex-wrap gap-1 mt-2">
              {preview.zone.types.map(type => (
                <span
                  key={type}
                  className={`type-badge type-${type.toLowerCase()}`}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--fg-300)] hover:text-[var(--fg-0)] text-xl font-mono leading-none"
          >
            x
          </button>
        </div>

        <div className="space-y-3">
          {difficulties.map(difficulty => {
            const info = preview.difficulties[difficulty];
            const colors = difficultyColors[difficulty];
            const pokemonList = info.all_pokemon || info.example_pokemon;

            return (
              <div
                key={difficulty}
                className={`p-3 bg-[var(--bg-200)] border ${colors.border}`}
                style={{ borderRadius: '4px' }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`font-mono uppercase text-sm font-bold ${colors.text}`}>{difficulty}</h3>
                  <span className="text-xs font-mono text-[var(--fg-200)]">
                    {info.pokemon_count} pokemon
                  </span>
                </div>
                <p className="text-xs text-[var(--fg-200)] mb-2">{info.description}</p>
                {pokemonList.length > 0 && (
                  <div className="max-h-32 overflow-y-auto">
                    <div className="flex flex-wrap gap-1">
                      {pokemonList.map(name => (
                        <span
                          key={name}
                          className="px-2 py-0.5 text-xs font-mono bg-[var(--bg-100)] text-[var(--fg-100)]"
                          style={{ borderRadius: '2px' }}
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full btn-primary"
        >
          Close
        </button>
      </div>
    </div>
  );
}
