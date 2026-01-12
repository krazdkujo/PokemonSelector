'use client';

import { useState, useEffect } from 'react';
import type { PokemonOwnedWithDetails, ExperienceGainedWithEvolution } from '@/lib/types';

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
    experience_gained?: ExperienceGainedWithEvolution;
  }) => void;
  alreadyOwned?: boolean;
  ownershipMessage?: string;
}

export function CaptureAttempt({
  battleId,
  wildPokemonName,
  playerWins,
  onCapture,
  alreadyOwned = false,
  ownershipMessage,
}: CaptureAttemptProps) {
  const [captureDC, setCaptureDC] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAttempting, setIsAttempting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOwned, setIsOwned] = useState(alreadyOwned);
  const [ownedMessage, setOwnedMessage] = useState(ownershipMessage);

  useEffect(() => {
    loadCaptureDC();
  }, [battleId, playerWins]);

  // Update owned state from props
  useEffect(() => {
    setIsOwned(alreadyOwned);
    setOwnedMessage(ownershipMessage);
  }, [alreadyOwned, ownershipMessage]);

  async function loadCaptureDC() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/capture');

      if (response.ok) {
        const data = await response.json();
        setCaptureDC(data.dc);
        // Also update ownership from API response
        if (data.already_owned !== undefined) {
          setIsOwned(data.already_owned);
          setOwnedMessage(data.ownership_message);
        }
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
        // Handle ALREADY_OWNED error specially
        if (data.error === 'ALREADY_OWNED') {
          setIsOwned(true);
          setOwnedMessage(data.message);
        }
        setError(data.message || 'Failed to attempt capture');
        return;
      }

      onCapture({
        success: data.result.success,
        roll: data.result.roll,
        dc: data.result.dc,
        fled: data.result.fled,
        captured_pokemon: data.captured_pokemon,
        experience_gained: data.experience_gained,
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

  // Show ownership message if already owned
  if (isOwned) {
    return (
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
        <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Capture Unavailable</h3>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{ownedMessage || 'Already caught - can only knock out'}</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          You already have {wildPokemonName} in your collection. Defeat it for XP instead!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
      <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Capture {wildPokemonName}?</h3>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-gray-600 dark:text-gray-400">Calculating capture difficulty...</div>
      ) : (
        <>
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Capture DC:</span>
              <span className={`font-bold ${getDifficultyColor(captureDC || 15)}`}>
                {captureDC} ({getDifficultyLabel(captureDC || 15)})
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Roll d20. Need {captureDC} or higher to capture.
            </p>
          </div>

          <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
            <p>Your round wins: {playerWins} (-{playerWins * 3} to DC)</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
