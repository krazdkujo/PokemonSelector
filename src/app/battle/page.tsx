'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BattleArena } from '@/components/BattleArena';
import { CaptureAttempt } from '@/components/CaptureAttempt';
import { PostBattleScreen } from '@/components/PostBattleScreen';
import { ZoneSelector } from '@/components/ZoneSelector';
import { PokemonSearch } from '@/components/PokemonSearch';
import { EvolutionModal } from '@/components/EvolutionModal';
import { getTrainerId } from '@/lib/session';
import { getAvailableMoves } from '@/lib/moves';
import { getZoneById, getDifficultyDescription } from '@/lib/zones';
import type { Battle, Move, RoundResult, ZoneDifficulty, Zone, MovePreview, ExperienceGainedWithEvolution } from '@/lib/types';
import { calculateRoundWinChance, getPokemonById } from '@/lib/battle';

type EnrichedBattle = Battle & {
  zone?: string | null;
  wild_pokemon_owned?: boolean;
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
  // DC Preview state (for showing DC before roll)
  const [pendingMove, setPendingMove] = useState<MovePreview | null>(null);
  // Experience tracking for post-battle screen
  const [experienceGained, setExperienceGained] = useState<ExperienceGainedWithEvolution | null>(null);
  // Evolution modal state
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [isEvolving, setIsEvolving] = useState(false);
  const [ownedPokemonId, setOwnedPokemonId] = useState<string | null>(null);

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
        // Track player Pokemon ID for evolution
        if (data.player_pokemon_id) {
          setOwnedPokemonId(data.player_pokemon_id);
        }
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
      // Track player Pokemon ID for evolution
      if (data.player_pokemon_id) {
        setOwnedPokemonId(data.player_pokemon_id);
      }
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

  // Calculate DC preview for a move (client-side calculation)
  function calculateMovePreview(moveId: string): MovePreview | null {
    if (!battle || !battle.player_pokemon) return null;

    const move = availableMoves.find(m => m.id === moveId);
    if (!move) return null;

    // Get player Pokemon data for SR
    const playerPokemonData = getPokemonById(battle.player_pokemon.pokemon_id);
    if (!playerPokemonData) return null;

    // Calculate round win chance
    const calculation = calculateRoundWinChance({
      playerLevel: battle.player_pokemon.level,
      playerSR: playerPokemonData.sr,
      playerTypes: battle.player_pokemon.types,
      wildLevel: battle.wild_pokemon.level,
      wildSR: battle.wild_pokemon.sr,
      wildTypes: battle.wild_pokemon.types,
      moveType: move.type,
    });

    // Convert win chance to DC
    const dc = Math.round(21 - (calculation.totalChance * 20));

    return {
      move_id: moveId,
      move_name: move.name,
      move_type: move.type,
      dc,
      win_chance: calculation.totalChance,
      factors: {
        base: calculation.baseChance,
        level_bonus: calculation.levelBonus,
        sr_bonus: calculation.srBonus,
        type_bonus: calculation.typeEffectiveness - 1,
        stab_bonus: calculation.stabBonus,
      },
      effectiveness: calculation.effectivenessLabel,
      has_stab: calculation.hasStab,
    };
  }

  // Handle move preview (show DC before roll)
  function handleMovePreview(moveId: string) {
    const preview = calculateMovePreview(moveId);
    setPendingMove(preview);
    setLastRound(null); // Clear last round when previewing new move
  }

  // Cancel move preview
  function handleCancelPreview() {
    setPendingMove(null);
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
      setPendingMove(null); // Clear pending move after execution
      setBattle(prev => prev ? { ...prev, ...data.battle } : null);

      // Track experience gained if battle ended
      if (data.experience_gained) {
        setExperienceGained(data.experience_gained);
        // Show evolution modal if evolution is available
        if (data.experience_gained.evolution_available && data.experience_gained.evolution_details) {
          setShowEvolutionModal(true);
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsExecuting(false);
    }
  }

  // Handle evolve button click
  async function handleEvolve() {
    if (!ownedPokemonId) return;

    try {
      setIsEvolving(true);
      const response = await fetch('/api/pokecenter/evolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pokemon_id: ownedPokemonId }),
      });

      if (response.ok) {
        // Evolution successful - update the UI
        const result = await response.json();
        console.log('Evolution successful:', result);
      }
    } catch (err) {
      console.error('Evolution failed:', err);
    } finally {
      setIsEvolving(false);
      setShowEvolutionModal(false);
    }
  }

  // Handle "Maybe Later" button click
  function handleEvolveLater() {
    setShowEvolutionModal(false);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading battle...</p>
        </div>
      </div>
    );
  }

  // No active battle - show zone or difficulty selection
  if (!battle) {
    // Step 1: Zone selection
    if (!selectedZone) {
      return (
        <div className="min-h-screen py-8 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Battle</h1>
              <Link href="/dashboard" className="btn-secondary">
                Back to Dashboard
              </Link>
            </div>

            {error && (
              <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <PokemonSearch />

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <ZoneSelector onSelect={handleZoneSelect} disabled={isStarting} />
            </div>
          </div>
        </div>
      );
    }

    // Step 2: Difficulty selection (after zone is selected)
    return (
      <div className="min-h-screen py-8 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Battle</h1>
            <Link href="/dashboard" className="btn-secondary">
              Back to Dashboard
            </Link>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {/* Show selected zone */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Selected Zone:</span>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{selectedZoneData?.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedZoneData?.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedZoneData?.types.map(type => (
                      <span
                        key={type}
                        className="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleBackToZones}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                >
                  Change Zone
                </button>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Select Difficulty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Choose the difficulty for your encounter. Higher difficulty means stronger opponents!
            </p>

            <div className="grid gap-4">
              <button
                onClick={() => startBattle('easy')}
                disabled={isStarting}
                className="p-4 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 border-2 border-green-300 dark:border-green-600 rounded-lg text-left transition disabled:opacity-50"
              >
                <div className="font-bold text-green-800 dark:text-green-300">Easy</div>
                <div className="text-sm text-green-700 dark:text-green-400">
                  {getDifficultyDescription('easy')}
                </div>
              </button>

              <button
                onClick={() => startBattle('medium')}
                disabled={isStarting}
                className="p-4 bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 border-2 border-yellow-300 dark:border-yellow-600 rounded-lg text-left transition disabled:opacity-50"
              >
                <div className="font-bold text-yellow-800 dark:text-yellow-300">Medium</div>
                <div className="text-sm text-yellow-700 dark:text-yellow-400">
                  {getDifficultyDescription('medium')}
                </div>
              </button>

              <button
                onClick={() => startBattle('hard')}
                disabled={isStarting}
                className="p-4 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 border-2 border-red-300 dark:border-red-600 rounded-lg text-left transition disabled:opacity-50"
              >
                <div className="font-bold text-red-800 dark:text-red-300">Hard</div>
                <div className="text-sm text-red-700 dark:text-red-400">
                  {getDifficultyDescription('hard')}
                </div>
              </button>
            </div>

            {isStarting && (
              <div className="mt-4 text-center text-gray-600 dark:text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-2"></div>
                Starting battle...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Battle ended - show PostBattleScreen with XP and level-up info
  if (battle.status !== 'active') {
    // Map battle status to outcome
    const outcomeMap: Record<string, 'victory' | 'defeat' | 'capture' | 'fled'> = {
      player_won: 'victory',
      wild_won: 'defeat',
      captured: 'capture',
      fled: 'fled',
    };
    const outcome = outcomeMap[battle.status] || 'defeat';

    // Build post-battle summary
    const summary = {
      outcome,
      wild_pokemon: {
        name: battle.wild_pokemon.name,
        level: battle.wild_pokemon.level,
        sprite_url: battle.wild_pokemon.sprite_url,
      },
      experience: experienceGained || {
        xp_awarded: 0,
        previous_level: battle.player_pokemon?.level || 1,
        new_level: battle.player_pokemon?.level || 1,
        previous_experience: 0,
        new_experience: 0,
        levels_gained: 0,
      },
      score: {
        player_wins: battle.player_wins,
        wild_wins: battle.wild_wins,
      },
    };

    const handleNewBattle = () => {
      setBattle(null);
      setLastRound(null);
      setSelectedZone(null);
      setSelectedZoneData(null);
      setPendingMove(null);
      setExperienceGained(null);
    };

    return (
      <div className="min-h-screen py-8 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-4">
          <PostBattleScreen summary={summary} onNewBattle={handleNewBattle} />
        </div>
      </div>
    );
  }

  // Active battle - show arena
  return (
    <div className="min-h-screen py-8 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Battle!</h1>
          <div className="text-sm text-gray-600 dark:text-gray-400 text-right">
            {battle.zone && (
              <div className="font-medium">{getZoneById(battle.zone)?.name || 'Unknown Zone'}</div>
            )}
            <div>{battle.difficulty.charAt(0).toUpperCase() + battle.difficulty.slice(1)} Mode</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <BattleArena
          battle={battle}
          availableMoves={availableMoves}
          lastRound={lastRound}
          onMoveSelect={executeRound}
          onMovePreview={handleMovePreview}
          onCancelPreview={handleCancelPreview}
          isExecuting={isExecuting}
          pendingMove={pendingMove}
        />

        {/* Capture option if player has wins */}
        {battle.player_wins >= 1 && (
          <div className="mt-6">
            {showCapture ? (
              <CaptureAttempt
                battleId={battle.id}
                wildPokemonName={battle.wild_pokemon.name}
                playerWins={battle.player_wins}
                alreadyOwned={battle.wild_pokemon_owned}
                ownershipMessage={battle.wild_pokemon_owned ? 'Already caught - can only knock out' : undefined}
                onCapture={(result) => {
                  // Update battle status based on result
                  if (result.fled) {
                    setBattle(prev => prev ? { ...prev, status: 'fled' } : null);
                  } else if (result.success) {
                    setBattle(prev => prev ? { ...prev, status: 'captured' } : null);
                    // Track experience gained from capture
                    if (result.experience_gained) {
                      setExperienceGained(result.experience_gained);
                    }
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
          <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
            Forfeit and return to dashboard
          </Link>
        </div>

        {/* Evolution Modal */}
        {experienceGained?.evolution_details && (
          <EvolutionModal
            isOpen={showEvolutionModal}
            isLoading={isEvolving}
            fromPokemon={{
              id: experienceGained.evolution_details.from_id,
              name: experienceGained.evolution_details.from_name,
              sprite_url: experienceGained.evolution_details.from_sprite,
            }}
            toPokemon={{
              id: experienceGained.evolution_details.to_id,
              name: experienceGained.evolution_details.to_name,
              sprite_url: experienceGained.evolution_details.to_sprite,
            }}
            onEvolve={handleEvolve}
            onLater={handleEvolveLater}
          />
        )}
      </div>
    </div>
  );
}
