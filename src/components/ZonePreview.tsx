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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading preview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <p className="text-red-600">{error || 'Failed to load preview'}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
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
    easy: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    hard: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{preview.zone.name}</h2>
            <div className="flex flex-wrap gap-1 mt-1">
              {preview.zone.types.map(type => (
                <span
                  key={type}
                  className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700"
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            x
          </button>
        </div>

        <div className="space-y-4">
          {difficulties.map(difficulty => {
            const info = preview.difficulties[difficulty];
            const colors = difficultyColors[difficulty];
            const pokemonList = info.all_pokemon || info.example_pokemon;

            return (
              <div
                key={difficulty}
                className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`font-bold ${colors.text} capitalize`}>{difficulty}</h3>
                  <span className="text-sm text-gray-600">
                    {info.pokemon_count} Pokemon
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{info.description}</p>
                {pokemonList.length > 0 && (
                  <div className="max-h-32 overflow-y-auto">
                    <div className="flex flex-wrap gap-1">
                      {pokemonList.map(name => (
                        <span
                          key={name}
                          className="px-2 py-0.5 text-xs rounded bg-white bg-opacity-60 text-gray-700"
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
          className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
