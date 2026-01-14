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
    if (dc <= 7) return 'text-[var(--accent-success)]';
    if (dc <= 10) return 'text-[var(--accent-success)]';
    if (dc <= 13) return 'text-[var(--accent-warning)]';
    if (dc <= 16) return 'text-[var(--accent-warning)]';
    if (dc <= 19) return 'text-[var(--accent-error)]';
    return 'text-[var(--accent-error)]';
  };

  const getDifficultyLabel = (dc: number) => {
    if (dc <= 7) return 'EASY';
    if (dc <= 10) return 'EASY';
    if (dc <= 13) return 'MODERATE';
    if (dc <= 16) return 'HARD';
    if (dc <= 19) return 'VERY HARD';
    return 'EXTREME';
  };

  // Show ownership message if already owned
  if (isOwned) {
    return (
      <div className="bg-[var(--bg-200)] p-4 border border-[var(--border)]" style={{ borderRadius: '4px' }}>
        <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--fg-200)] mb-2">Capture Unavailable</h3>
        <div className="flex items-center gap-2 text-[var(--fg-200)]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{ownedMessage || 'Already caught - can only knock out'}</span>
        </div>
        <p className="text-xs text-[var(--fg-300)] mt-2">
          You already have {wildPokemonName} in your collection. Defeat it for XP.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-200)] p-4 border border-[var(--accent-primary)]" style={{ borderRadius: '4px' }}>
      <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--accent-primary)] mb-2">Capture {wildPokemonName}</h3>

      {error && (
        <div className="error-message text-sm mb-3">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-[var(--fg-200)] text-sm font-mono">Calculating DC...</div>
      ) : (
        <>
          <div className="mb-3">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[var(--fg-200)] text-sm">Capture DC:</span>
              <span className={`font-bold ${getDifficultyColor(captureDC || 15)}`}>
                {captureDC} <span className="text-xs">({getDifficultyLabel(captureDC || 15)})</span>
              </span>
            </div>
            <p className="text-xs font-mono text-[var(--fg-300)] mt-1">
              Roll d20 &gt;= {captureDC} to capture
            </p>
          </div>

          <div className="mb-3 text-xs font-mono text-[var(--fg-200)]">
            <p>Round wins: {playerWins} (-{playerWins * 3} DC)</p>
            <p className="text-[var(--fg-300)] mt-1">
              Failed capture = wild gets +1 round (25% flee)
            </p>
          </div>

          <button
            onClick={attemptCapture}
            disabled={isAttempting}
            className="btn-primary w-full py-2"
          >
            {isAttempting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="loading-spinner h-4 w-4"></div>
                Capturing...
              </span>
            ) : (
              'Throw Pokeball'
            )}
          </button>
        </>
      )}
    </div>
  );
}
