'use client';

import { useState, useEffect } from 'react';
import type { PokemonOwnedWithDetails } from '@/lib/types';

interface CaptureAttemptProps {
  battleId: string;
  wildPokemonName: string;
  playerWins: number;
  onCapture: (result: {
    success: boolean;
    roll: number;
    dc: number;
    fled: boolean;
    captured_pokemon?: PokemonOwnedWithDetails;
  }) => void;
}

export function CaptureAttempt({
  battleId,
  wildPokemonName,
  playerWins,
  onCapture,
}: CaptureAttemptProps) {
  const [captureDC, setCaptureDC] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAttempting, setIsAttempting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCaptureDC();
  }, [battleId, playerWins]);

  async function loadCaptureDC() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/capture');

      if (response.ok) {
        const data = await response.json();
        setCaptureDC(data.dc);
      }
    } catch (err) {
      console.error('Failed to load capture DC:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function attemptCapture() {
    try {
      setIsAttempting(true);
      setError(null);

      const response = await fetch('/api/capture', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to attempt capture');
        return;
      }

      onCapture({
        success: data.result.success,
        roll: data.result.roll,
        dc: data.result.dc,
        fled: data.result.fled,
        captured_pokemon: data.captured_pokemon,
      });
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsAttempting(false);
    }
  }

  const getDifficultyColor = (dc: number) => {
    if (dc <= 7) return 'text-green-600';
    if (dc <= 10) return 'text-green-500';
    if (dc <= 13) return 'text-yellow-600';
    if (dc <= 16) return 'text-orange-500';
    if (dc <= 19) return 'text-red-500';
    return 'text-red-700';
  };

  const getDifficultyLabel = (dc: number) => {
    if (dc <= 7) return 'Very Easy';
    if (dc <= 10) return 'Easy';
    if (dc <= 13) return 'Moderate';
    if (dc <= 16) return 'Difficult';
    if (dc <= 19) return 'Very Difficult';
    return 'Extremely Difficult';
  };

  return (
    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
      <h3 className="font-semibold text-purple-800 mb-2">Capture {wildPokemonName}?</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-gray-600">Calculating capture difficulty...</div>
      ) : (
        <>
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Capture DC:</span>
              <span className={`font-bold ${getDifficultyColor(captureDC || 15)}`}>
                {captureDC} ({getDifficultyLabel(captureDC || 15)})
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Roll d20. Need {captureDC} or higher to capture.
            </p>
          </div>

          <div className="mb-3 text-sm text-gray-600">
            <p>Your round wins: {playerWins} (-{playerWins * 3} to DC)</p>
            <p className="text-xs text-gray-500 mt-1">
              Warning: Failed capture gives the wild Pokemon a round win (25% flee chance)
            </p>
          </div>

          <button
            onClick={attemptCapture}
            disabled={isAttempting}
            className={`
              w-full py-3 rounded-lg font-semibold transition
              ${isAttempting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
              }
            `}
          >
            {isAttempting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Attempting Capture...
              </span>
            ) : (
              'Throw Pokeball!'
            )}
          </button>
        </>
      )}
    </div>
  );
}
