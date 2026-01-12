'use client';

import Image from 'next/image';
import type { Battle, Move, RoundResult, MovePreview } from '@/lib/types';

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
  onMovePreview?: (moveId: string) => void;
  onCancelPreview?: () => void;
  isExecuting: boolean;
  pendingMove?: MovePreview | null;
}

export function BattleArena({
  battle,
  availableMoves,
  lastRound,
  onMoveSelect,
  onMovePreview,
  onCancelPreview,
  isExecuting,
  pendingMove,
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
              i < wins ? color : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  // Handle move button click - preview if handler exists, otherwise execute directly
  const handleMoveClick = (moveId: string) => {
    if (onMovePreview) {
      onMovePreview(moveId);
    } else {
      onMoveSelect(moveId);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6">
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
          <h3 className="font-bold text-gray-800 dark:text-gray-100">{player_pokemon?.name || 'Your Pokemon'}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Level {player_pokemon?.level || 1}</p>
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

        {/* VS / DC Display */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-400 dark:text-gray-500">VS</div>

          {/* Pending Move DC Preview - Show BEFORE roll */}
          {pendingMove && !lastRound && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-2 border-blue-200 dark:border-blue-700">
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                {pendingMove.move_name}
              </div>
              <div className="relative group">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 cursor-help">
                  DC: {pendingMove.dc}
                </div>
                {/* DC Calculation Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 text-white text-xs rounded-lg p-3 whitespace-nowrap shadow-lg">
                    <div className="font-semibold mb-2 text-center border-b border-gray-700 pb-1">DC Calculation</div>
                    <div className="space-y-1">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-300">Base chance:</span>
                        <span>{Math.round(pendingMove.factors.base * 100)}%</span>
                      </div>
                      {pendingMove.factors.level_bonus !== 0 && (
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-300">Level bonus:</span>
                          <span className={pendingMove.factors.level_bonus > 0 ? 'text-green-400' : 'text-red-400'}>
                            {pendingMove.factors.level_bonus > 0 ? '+' : ''}{Math.round(pendingMove.factors.level_bonus * 100)}%
                          </span>
                        </div>
                      )}
                      {pendingMove.factors.sr_bonus !== 0 && (
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-300">SR bonus:</span>
                          <span className={pendingMove.factors.sr_bonus > 0 ? 'text-green-400' : 'text-red-400'}>
                            {pendingMove.factors.sr_bonus > 0 ? '+' : ''}{Math.round(pendingMove.factors.sr_bonus * 100)}%
                          </span>
                        </div>
                      )}
                      {pendingMove.factors.type_bonus !== 0 && (
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-300">Type bonus:</span>
                          <span className={pendingMove.factors.type_bonus > 0 ? 'text-green-400' : 'text-red-400'}>
                            {pendingMove.factors.type_bonus > 0 ? '+' : ''}{Math.round(pendingMove.factors.type_bonus * 100)}%
                          </span>
                        </div>
                      )}
                      {pendingMove.factors.stab_bonus !== 0 && (
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-300">STAB bonus:</span>
                          <span className="text-green-400">+{Math.round(pendingMove.factors.stab_bonus * 100)}%</span>
                        </div>
                      )}
                      <div className="border-t border-gray-700 pt-1 mt-1 flex justify-between gap-4 font-semibold">
                        <span>Total:</span>
                        <span>{Math.round(pendingMove.win_chance * 100)}%</span>
                      </div>
                      <div className="text-gray-400 text-center mt-1">
                        DC = 21 - ({Math.round(pendingMove.win_chance * 100)}% x 20) = {pendingMove.dc}
                      </div>
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                Roll {pendingMove.dc}+ to win
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {Math.round(pendingMove.win_chance * 100)}% chance
              </div>
              {pendingMove.effectiveness !== 'neutral' && (
                <div className={`text-xs mt-1 ${
                  pendingMove.effectiveness === 'super_effective' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                }`}>
                  {pendingMove.effectiveness.replace('_', ' ')}
                </div>
              )}
              {pendingMove.has_stab && (
                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">STAB bonus</div>
              )}
            </div>
          )}

          {/* Last Round Result - Show AFTER roll */}
          {lastRound && (
            <>
              <div className="mt-2 text-lg font-bold text-gray-700 dark:text-gray-300">
                DC: {lastRound.dc}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Roll {lastRound.dc}+ to win
              </div>
              <div className={`mt-1 text-sm font-medium ${
                lastRound.winner === 'player' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
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
              <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-4xl">?</span>
              </div>
            )}
          </div>
          <h3 className="font-bold text-gray-800 dark:text-gray-100">{wild_pokemon.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Level {wild_pokemon.level}</p>
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
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Round {lastRound.round_number} Result</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Move:</span>
              <span className="ml-1 font-medium">{lastRound.player_move}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">DC:</span>
              <span className="ml-1 font-medium">{lastRound.dc}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Roll:</span>
              <span className={`ml-1 font-medium ${
                lastRound.roll >= lastRound.dc ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {lastRound.roll} {lastRound.roll >= lastRound.dc ? '>=' : '<'} {lastRound.dc}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Result:</span>
              <span className={`ml-1 font-medium ${
                lastRound.winner === 'player' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {lastRound.winner === 'player' ? 'Success' : 'Failed'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm mt-2">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Effectiveness:</span>
              <span className={`ml-1 font-medium ${
                lastRound.type_effectiveness === 'super_effective' ? 'text-green-600 dark:text-green-400' :
                lastRound.type_effectiveness === 'not_very_effective' ? 'text-orange-600 dark:text-orange-400' :
                'text-gray-600 dark:text-gray-400'
              }`}>
                {lastRound.type_effectiveness.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">STAB:</span>
              <span className="ml-1 font-medium">{lastRound.had_stab ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Pending Move Confirmation */}
      {pendingMove && (
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6 border-2 border-blue-200 dark:border-blue-700">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3">Confirm Your Attack</h4>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{pendingMove.move_name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                You need to roll {pendingMove.dc}+ on a d20 to hit
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onCancelPreview}
                disabled={isExecuting}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onMoveSelect(pendingMove.move_id)}
                disabled={isExecuting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isExecuting ? 'Rolling...' : 'Roll Attack!'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Selection - Hidden when there's a pending move */}
      {!pendingMove && (
        <div>
          <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">Choose Your Move</h4>
          <div className="grid grid-cols-2 gap-3">
            {availableMoves.map((move) => (
              <button
                key={move.id}
                onClick={() => handleMoveClick(move.id)}
                disabled={isExecuting}
                className={`
                  p-3 rounded-lg border-2 text-left transition
                  ${isExecuting ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500 cursor-pointer'}
                  border-gray-200 dark:border-gray-700
                `}
              >
                <div className="font-medium text-gray-800 dark:text-gray-100">{move.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`type-badge type-${move.type.toLowerCase()} text-xs`}>
                    {move.type}
                  </span>
                </div>
                {move.description && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {move.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {isExecuting && (
        <div className="mt-4 text-center text-gray-600 dark:text-gray-400">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-2"></div>
          Rolling the dice...
        </div>
      )}
    </div>
  );
}
