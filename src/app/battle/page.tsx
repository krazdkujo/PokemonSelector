'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BattleArena } from '@/components/BattleArena';
import { CaptureAttempt } from '@/components/CaptureAttempt';
import { ZoneSelector } from '@/components/ZoneSelector';
import { getTrainerId } from '@/lib/session';
import { getAvailableMoves } from '@/lib/moves';
import { getZoneById, getDifficultyDescription } from '@/lib/zones';
import type { Battle, Move, RoundResult, ZoneDifficulty, Zone } from '@/lib/types';

type EnrichedBattle = Battle & {
  zone?: string | null;
  player_pokemon?: {
    pokemon_id: number;
    name: string;
    types: string[];
    sprite_url: string;
    level: number;
    selected_moves: string[];
  };
};

export default function BattlePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [battle, setBattle] = useState<EnrichedBattle | null>(null);
  const [availableMoves, setAvailableMoves] = useState<Move[]>([]);
  const [lastRound, setLastRound] = useState<RoundResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showCapture, setShowCapture] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Zone selection state
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedZoneData, setSelectedZoneData] = useState<Zone | null>(null);

  async function loadBattle() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/battle');

      if (!response.ok) {
        if (response.status === 401) {
          router.replace('/');
          return;
        }
        setError('Failed to load battle');
        return;
      }

      const data = await response.json();

      if (data) {
        setBattle(data);
        // Load moves for the player's Pokemon
        if (data.player_pokemon) {
          const moves = getAvailableMoves(
            data.player_pokemon.pokemon_id,
            data.player_pokemon.level
          );
          // Filter to selected moves if available
          const selectedMoveIds = data.player_pokemon.selected_moves || [];
          const filteredMoves = selectedMoveIds.length > 0
            ? moves.filter(m => selectedMoveIds.includes(m.id))
            : moves.slice(0, 4);
          setAvailableMoves(filteredMoves);
        }
      } else {
        setBattle(null);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const trainerId = getTrainerId();
    if (!trainerId) {
      router.replace('/');
      return;
    }
    loadBattle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Handle zone selection
  function handleZoneSelect(zoneId: string) {
    setSelectedZone(zoneId);
    setSelectedZoneData(getZoneById(zoneId) || null);
  }

  // Handle back to zone selection
  function handleBackToZones() {
    setSelectedZone(null);
    setSelectedZoneData(null);
  }

  async function startBattle(difficulty: ZoneDifficulty) {
    if (!selectedZone) return;

    try {
      setIsStarting(true);
      setError(null);

      const response = await fetch('/api/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone_id: selectedZone, difficulty }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to start battle');
        return;
      }

      setBattle(data);
      // Load moves for the player's Pokemon
      if (data.player_pokemon) {
        const moves = getAvailableMoves(
          data.player_pokemon.pokemon_id,
          data.player_pokemon.level
        );
        const selectedMoveIds = data.player_pokemon.selected_moves || [];
        const filteredMoves = selectedMoveIds.length > 0
          ? moves.filter(m => selectedMoveIds.includes(m.id))
          : moves.slice(0, 4);
        setAvailableMoves(filteredMoves);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsStarting(false);
    }
  }

  async function executeRound(moveId: string) {
    if (!battle) return;

    try {
      setIsExecuting(true);
      setError(null);

      const response = await fetch('/api/battle/round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ move_id: moveId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to execute round');
        return;
      }

      setLastRound(data.round);
      setBattle(prev => prev ? { ...prev, ...data.battle } : null);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsExecuting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading battle...</p>
        </div>
      </div>
    );
  }

  // No active battle - show zone or difficulty selection
  if (!battle) {
    // Step 1: Zone selection
    if (!selectedZone) {
      return (
        <div className="min-h-screen py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Battle</h1>
              <Link href="/dashboard" className="btn-secondary">
                Back to Dashboard
              </Link>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-lg p-6">
              <ZoneSelector onSelect={handleZoneSelect} disabled={isStarting} />
            </div>
          </div>
        </div>
      );
    }

    // Step 2: Difficulty selection (after zone is selected)
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Battle</h1>
            <Link href="/dashboard" className="btn-secondary">
              Back to Dashboard
            </Link>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Show selected zone */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-500">Selected Zone:</span>
                  <h3 className="text-lg font-semibold text-gray-800">{selectedZoneData?.name}</h3>
                  <p className="text-sm text-gray-600">{selectedZoneData?.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedZoneData?.types.map(type => (
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
                  onClick={handleBackToZones}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Change Zone
                </button>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Difficulty</h2>
            <p className="text-gray-600 mb-6">
              Choose the difficulty for your encounter. Higher difficulty means stronger opponents!
            </p>

            <div className="grid gap-4">
              <button
                onClick={() => startBattle('easy')}
                disabled={isStarting}
                className="p-4 bg-green-100 hover:bg-green-200 border-2 border-green-300 rounded-lg text-left transition disabled:opacity-50"
              >
                <div className="font-bold text-green-800">Easy</div>
                <div className="text-sm text-green-700">
                  {getDifficultyDescription('easy')}
                </div>
              </button>

              <button
                onClick={() => startBattle('medium')}
                disabled={isStarting}
                className="p-4 bg-yellow-100 hover:bg-yellow-200 border-2 border-yellow-300 rounded-lg text-left transition disabled:opacity-50"
              >
                <div className="font-bold text-yellow-800">Medium</div>
                <div className="text-sm text-yellow-700">
                  {getDifficultyDescription('medium')}
                </div>
              </button>

              <button
                onClick={() => startBattle('hard')}
                disabled={isStarting}
                className="p-4 bg-red-100 hover:bg-red-200 border-2 border-red-300 rounded-lg text-left transition disabled:opacity-50"
              >
                <div className="font-bold text-red-800">Hard</div>
                <div className="text-sm text-red-700">
                  {getDifficultyDescription('hard')}
                </div>
              </button>
            </div>

            {isStarting && (
              <div className="mt-4 text-center text-gray-600">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                Starting battle...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Battle ended - show results
  if (battle.status !== 'active') {
    const isVictory = battle.status === 'player_won' || battle.status === 'captured';

    return (
      <div className="min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className={`text-6xl mb-4 ${isVictory ? 'text-green-500' : 'text-red-500'}`}>
              {isVictory ? 'Victory!' : 'Defeat'}
            </div>

            <h2 className={`text-2xl font-bold mb-4 ${isVictory ? 'text-green-700' : 'text-red-700'}`}>
              {battle.status === 'player_won' && 'You defeated the wild Pokemon!'}
              {battle.status === 'captured' && `You captured ${battle.wild_pokemon.name}!`}
              {battle.status === 'wild_won' && 'The wild Pokemon won...'}
              {battle.status === 'fled' && 'The wild Pokemon fled!'}
            </h2>

            <div className="mb-6">
              <p className="text-gray-600">
                Final Score: {battle.player_wins} - {battle.wild_wins}
              </p>
              <p className="text-gray-600">
                Opponent: {battle.wild_pokemon.name} (Level {battle.wild_pokemon.level})
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Return to Dashboard
              </Link>
              <button
                onClick={() => {
                  setBattle(null);
                  setLastRound(null);
                  setSelectedZone(null);
                  setSelectedZoneData(null);
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                New Battle
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active battle - show arena
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Battle!</h1>
          <div className="text-sm text-gray-600 text-right">
            {battle.zone && (
              <div className="font-medium">{getZoneById(battle.zone)?.name || 'Unknown Zone'}</div>
            )}
            <div>{battle.difficulty.charAt(0).toUpperCase() + battle.difficulty.slice(1)} Mode</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <BattleArena
          battle={battle}
          availableMoves={availableMoves}
          lastRound={lastRound}
          onMoveSelect={executeRound}
          isExecuting={isExecuting}
        />

        {/* Capture option if player has wins */}
        {battle.player_wins >= 1 && (
          <div className="mt-6">
            {showCapture ? (
              <CaptureAttempt
                battleId={battle.id}
                wildPokemonName={battle.wild_pokemon.name}
                playerWins={battle.player_wins}
                onCapture={(result) => {
                  // Update battle status based on result
                  if (result.fled) {
                    setBattle(prev => prev ? { ...prev, status: 'fled' } : null);
                  } else if (result.success) {
                    setBattle(prev => prev ? { ...prev, status: 'captured' } : null);
                  } else {
                    // Failed capture - update wild wins
                    setBattle(prev => {
                      if (!prev) return null;
                      const newWildWins = prev.wild_wins + 1;
                      return {
                        ...prev,
                        wild_wins: newWildWins,
                        status: newWildWins >= 3 ? 'wild_won' : 'active',
                      };
                    });
                    setShowCapture(false); // Hide capture UI to continue battle
                  }
                }}
              />
            ) : (
              <div className="text-center">
                <button
                  onClick={() => setShowCapture(true)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Attempt Capture (DC varies based on round wins)
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-800">
            Forfeit and return to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
