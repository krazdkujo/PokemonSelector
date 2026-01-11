'use client';

import Image from 'next/image';
import type { Battle, Move, RoundResult } from '@/lib/types';

interface BattleArenaProps {
  battle: Battle & {
    player_pokemon?: {
      name: string;
      types: string[];
      sprite_url: string;
      level: number;
      selected_moves: string[];
    };
  };
  availableMoves: Move[];
  lastRound: RoundResult | null;
  onMoveSelect: (moveId: string) => void;
  isExecuting: boolean;
}

export function BattleArena({
  battle,
  availableMoves,
  lastRound,
  onMoveSelect,
  isExecuting,
}: BattleArenaProps) {
  const { wild_pokemon, player_wins, wild_wins, player_pokemon } = battle;

  // Render win indicators
  const renderWinIndicators = (wins: number, color: string) => {
    return (
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full ${
              i < wins ? color : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Battle Arena */}
      <div className="grid grid-cols-3 gap-4 items-center mb-6">
        {/* Player Pokemon */}
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-2">
            {player_pokemon?.sprite_url && (
              <Image
                src={player_pokemon.sprite_url}
                alt={player_pokemon.name || 'Your Pokemon'}
                fill
                className="object-contain"
                sizes="96px"
              />
            )}
          </div>
          <h3 className="font-bold text-gray-800">{player_pokemon?.name || 'Your Pokemon'}</h3>
          <p className="text-sm text-gray-600">Level {player_pokemon?.level || 1}</p>
          {player_pokemon?.types && (
            <div className="flex gap-1 justify-center mt-1">
              {player_pokemon.types.map((type) => (
                <span
                  key={type}
                  className={`type-badge type-${type.toLowerCase()} text-xs`}
                >
                  {type}
                </span>
              ))}
            </div>
          )}
          <div className="mt-2">
            {renderWinIndicators(player_wins, 'bg-green-500')}
          </div>
        </div>

        {/* VS */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-400">VS</div>
          {lastRound && (
            <>
              <div className="mt-2 text-lg font-bold text-gray-700">
                DC: {lastRound.dc}
              </div>
              <div className="text-xs text-gray-500">
                Roll {lastRound.dc}+ to win
              </div>
              <div className={`mt-1 text-sm font-medium ${
                lastRound.winner === 'player' ? 'text-green-600' : 'text-red-600'
              }`}>
                Rolled {lastRound.roll}: {lastRound.winner === 'player' ? 'You won!' : 'Wild won!'}
              </div>
            </>
          )}
        </div>

        {/* Wild Pokemon */}
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-2">
            {wild_pokemon.sprite_url ? (
              <Image
                src={wild_pokemon.sprite_url}
                alt={wild_pokemon.name}
                fill
                className="object-contain"
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">?</span>
              </div>
            )}
          </div>
          <h3 className="font-bold text-gray-800">{wild_pokemon.name}</h3>
          <p className="text-sm text-gray-600">Level {wild_pokemon.level}</p>
          <div className="flex gap-1 justify-center mt-1">
            {wild_pokemon.types.map((type) => (
              <span
                key={type}
                className={`type-badge type-${type.toLowerCase()} text-xs`}
              >
                {type}
              </span>
            ))}
          </div>
          <div className="mt-2 flex justify-center">
            {renderWinIndicators(wild_wins, 'bg-red-500')}
          </div>
        </div>
      </div>

      {/* Last Round Details */}
      {lastRound && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-800 mb-2">Round {lastRound.round_number} Result</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Move:</span>
              <span className="ml-1 font-medium">{lastRound.player_move}</span>
            </div>
            <div>
              <span className="text-gray-500">Roll:</span>
              <span className="ml-1 font-medium">{lastRound.roll}</span>
            </div>
            <div>
              <span className="text-gray-500">Effectiveness:</span>
              <span className={`ml-1 font-medium ${
                lastRound.type_effectiveness === 'super_effective' ? 'text-green-600' :
                lastRound.type_effectiveness === 'not_very_effective' ? 'text-orange-600' :
                'text-gray-600'
              }`}>
                {lastRound.type_effectiveness.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-gray-500">STAB:</span>
              <span className="ml-1 font-medium">{lastRound.had_stab ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Move Selection */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3">Choose Your Move</h4>
        <div className="grid grid-cols-2 gap-3">
          {availableMoves.map((move) => (
            <button
              key={move.id}
              onClick={() => onMoveSelect(move.id)}
              disabled={isExecuting}
              className={`
                p-3 rounded-lg border-2 text-left transition
                ${isExecuting ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500 cursor-pointer'}
                border-gray-200
              `}
            >
              <div className="font-medium text-gray-800">{move.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`type-badge type-${move.type.toLowerCase()} text-xs`}>
                  {move.type}
                </span>
              </div>
              {move.description && (
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {move.description}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {isExecuting && (
        <div className="mt-4 text-center text-gray-600">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          Executing move...
        </div>
      )}
    </div>
  );
}
