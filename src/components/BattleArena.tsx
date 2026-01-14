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

  // Render win indicators - sharp squares instead of circles
  const renderWinIndicators = (wins: number, color: string) => {
    return (
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-3 h-3 ${
              i < wins ? color : 'bg-[var(--bg-300)]'
            }`}
            style={{ borderRadius: '2px' }}
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
    <div className="card p-6">
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
          <h3 className="font-semibold text-[var(--fg-0)]">{player_pokemon?.name || 'Your Pokemon'}</h3>
          <p className="text-xs font-mono text-[var(--fg-200)]">LVL {player_pokemon?.level || 1}</p>
          {player_pokemon?.types && (
            <div className="flex gap-1 justify-center mt-1">
              {player_pokemon.types.map((type) => (
                <span
                  key={type}
                  className={`type-badge type-${type.toLowerCase()}`}
                >
                  {type}
                </span>
              ))}
            </div>
          )}
          <div className="mt-2 flex justify-center">
            {renderWinIndicators(player_wins, 'bg-[var(--accent-success)]')}
          </div>
        </div>

        {/* VS / DC Display */}
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-[var(--fg-300)]">VS</div>

          {/* Pending Move DC Preview - Show BEFORE roll */}
          {pendingMove && !lastRound && (
            <div className="mt-3 p-3 bg-[var(--bg-200)] border border-[var(--accent-primary)]" style={{ borderRadius: '4px' }}>
              <div className="text-xs font-mono uppercase text-[var(--accent-primary)] mb-1">
                {pendingMove.move_name}
              </div>
              <div className="relative group">
                <div className="text-2xl font-mono font-bold text-[var(--fg-0)] cursor-help">
                  DC {pendingMove.dc}
                </div>
                {/* DC Calculation Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-10">
                  <div className="bg-[var(--bg-0)] border border-[var(--border)] text-[var(--fg-0)] text-xs p-3 whitespace-nowrap shadow-lg" style={{ borderRadius: '4px' }}>
                    <div className="font-mono uppercase text-[var(--fg-200)] mb-2 text-center border-b border-[var(--border)] pb-1">DC Calculation</div>
                    <div className="space-y-1 font-mono">
                      <div className="flex justify-between gap-4">
                        <span className="text-[var(--fg-200)]">Base:</span>
                        <span>{Math.round(pendingMove.factors.base * 100)}%</span>
                      </div>
                      {pendingMove.factors.level_bonus !== 0 && (
                        <div className="flex justify-between gap-4">
                          <span className="text-[var(--fg-200)]">Level:</span>
                          <span className={pendingMove.factors.level_bonus > 0 ? 'text-[var(--accent-success)]' : 'text-[var(--accent-error)]'}>
                            {pendingMove.factors.level_bonus > 0 ? '+' : ''}{Math.round(pendingMove.factors.level_bonus * 100)}%
                          </span>
                        </div>
                      )}
                      {pendingMove.factors.sr_bonus !== 0 && (
                        <div className="flex justify-between gap-4">
                          <span className="text-[var(--fg-200)]">SR:</span>
                          <span className={pendingMove.factors.sr_bonus > 0 ? 'text-[var(--accent-success)]' : 'text-[var(--accent-error)]'}>
                            {pendingMove.factors.sr_bonus > 0 ? '+' : ''}{Math.round(pendingMove.factors.sr_bonus * 100)}%
                          </span>
                        </div>
                      )}
                      {pendingMove.factors.type_bonus !== 0 && (
                        <div className="flex justify-between gap-4">
                          <span className="text-[var(--fg-200)]">Type:</span>
                          <span className={pendingMove.factors.type_bonus > 0 ? 'text-[var(--accent-success)]' : 'text-[var(--accent-error)]'}>
                            {pendingMove.factors.type_bonus > 0 ? '+' : ''}{Math.round(pendingMove.factors.type_bonus * 100)}%
                          </span>
                        </div>
                      )}
                      {pendingMove.factors.stab_bonus !== 0 && (
                        <div className="flex justify-between gap-4">
                          <span className="text-[var(--fg-200)]">STAB:</span>
                          <span className="text-[var(--accent-success)]">+{Math.round(pendingMove.factors.stab_bonus * 100)}%</span>
                        </div>
                      )}
                      <div className="border-t border-[var(--border)] pt-1 mt-1 flex justify-between gap-4 font-semibold">
                        <span>Total:</span>
                        <span>{Math.round(pendingMove.win_chance * 100)}%</span>
                      </div>
                      <div className="text-[var(--fg-300)] text-center mt-1">
                        DC = 21 - ({Math.round(pendingMove.win_chance * 100)}% x 20) = {pendingMove.dc}
                      </div>
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-[var(--bg-0)]"></div>
                  </div>
                </div>
              </div>
              <div className="text-xs font-mono text-[var(--fg-200)] mt-1">
                Roll {pendingMove.dc}+ to win
              </div>
              <div className="text-xs font-mono text-[var(--fg-300)] mt-1">
                {Math.round(pendingMove.win_chance * 100)}% chance
              </div>
              {pendingMove.effectiveness !== 'neutral' && (
                <div className={`text-xs font-mono uppercase mt-1 ${
                  pendingMove.effectiveness === 'super_effective' ? 'text-[var(--accent-success)]' : 'text-[var(--accent-warning)]'
                }`}>
                  {pendingMove.effectiveness.replace('_', ' ')}
                </div>
              )}
              {pendingMove.has_stab && (
                <div className="text-xs font-mono uppercase text-[var(--accent-primary)] mt-1">STAB</div>
              )}
            </div>
          )}

          {/* Last Round Result - Show AFTER roll */}
          {lastRound && (
            <>
              <div className="mt-2 text-lg font-mono font-bold text-[var(--fg-100)]">
                DC {lastRound.dc}
              </div>
              <div className="text-xs font-mono text-[var(--fg-300)]">
                Roll {lastRound.dc}+ to win
              </div>
              <div className={`mt-1 text-sm font-mono font-medium ${
                lastRound.winner === 'player' ? 'text-[var(--accent-success)]' : 'text-[var(--accent-error)]'
              }`}>
                [{lastRound.roll}] {lastRound.winner === 'player' ? 'HIT' : 'MISS'}
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
              <div className="w-full h-full bg-[var(--bg-200)] flex items-center justify-center" style={{ borderRadius: '4px' }}>
                <span className="text-4xl font-mono text-[var(--fg-300)]">?</span>
              </div>
            )}
          </div>
          <h3 className="font-semibold text-[var(--fg-0)]">{wild_pokemon.name}</h3>
          <p className="text-xs font-mono text-[var(--fg-200)]">LVL {wild_pokemon.level}</p>
          <div className="flex gap-1 justify-center mt-1">
            {wild_pokemon.types.map((type) => (
              <span
                key={type}
                className={`type-badge type-${type.toLowerCase()}`}
              >
                {type}
              </span>
            ))}
          </div>
          <div className="mt-2 flex justify-center">
            {renderWinIndicators(wild_wins, 'bg-[var(--accent-error)]')}
          </div>
        </div>
      </div>

      {/* Last Round Details */}
      {lastRound && (
        <div className="bg-[var(--bg-200)] p-4 mb-6" style={{ borderRadius: '4px' }}>
          <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--fg-200)] mb-3">Round {lastRound.round_number}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm font-mono">
            <div>
              <span className="text-[var(--fg-300)] text-xs">MOVE</span>
              <div className="text-[var(--fg-0)]">{lastRound.player_move}</div>
            </div>
            <div>
              <span className="text-[var(--fg-300)] text-xs">DC</span>
              <div className="text-[var(--fg-0)]">{lastRound.dc}</div>
            </div>
            <div>
              <span className="text-[var(--fg-300)] text-xs">ROLL</span>
              <div className={`${
                lastRound.roll >= lastRound.dc ? 'text-[var(--accent-success)]' : 'text-[var(--accent-error)]'
              }`}>
                {lastRound.roll} {lastRound.roll >= lastRound.dc ? '>=' : '<'} {lastRound.dc}
              </div>
            </div>
            <div>
              <span className="text-[var(--fg-300)] text-xs">RESULT</span>
              <div className={`uppercase ${
                lastRound.winner === 'player' ? 'text-[var(--accent-success)]' : 'text-[var(--accent-error)]'
              }`}>
                {lastRound.winner === 'player' ? 'HIT' : 'MISS'}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm font-mono mt-3 pt-3 border-t border-[var(--border)]">
            <div>
              <span className="text-[var(--fg-300)] text-xs">TYPE</span>
              <div className={`uppercase ${
                lastRound.type_effectiveness === 'super_effective' ? 'text-[var(--accent-success)]' :
                lastRound.type_effectiveness === 'not_very_effective' ? 'text-[var(--accent-warning)]' :
                'text-[var(--fg-200)]'
              }`}>
                {lastRound.type_effectiveness.replace('_', ' ')}
              </div>
            </div>
            <div>
              <span className="text-[var(--fg-300)] text-xs">STAB</span>
              <div className="text-[var(--fg-100)]">{lastRound.had_stab ? 'YES' : 'NO'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Move Confirmation */}
      {pendingMove && (
        <div className="bg-[var(--bg-200)] p-4 mb-6 border border-[var(--accent-primary)]" style={{ borderRadius: '4px' }}>
          <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--accent-primary)] mb-3">Confirm Attack</h4>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-[var(--fg-0)]">{pendingMove.move_name}</div>
              <div className="text-sm font-mono text-[var(--fg-200)]">
                Roll {pendingMove.dc}+ on d20 to hit
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onCancelPreview}
                disabled={isExecuting}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => onMoveSelect(pendingMove.move_id)}
                disabled={isExecuting}
                className="btn-primary"
              >
                {isExecuting ? 'Rolling...' : 'Roll'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Selection - Hidden when there's a pending move */}
      {!pendingMove && (
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--fg-200)] mb-3">Select Move</h4>
          <div className="grid grid-cols-2 gap-3">
            {availableMoves.map((move) => (
              <button
                key={move.id}
                onClick={() => handleMoveClick(move.id)}
                disabled={isExecuting}
                className={`
                  p-3 border text-left transition-all duration-100
                  bg-[var(--bg-100)] border-[var(--border)]
                  ${isExecuting ? 'opacity-50 cursor-not-allowed' : 'hover:border-[var(--fg-200)] hover:bg-[var(--bg-200)] cursor-pointer'}
                `}
                style={{ borderRadius: '4px' }}
              >
                <div className="font-medium text-[var(--fg-0)]">{move.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`type-badge type-${move.type.toLowerCase()}`}>
                    {move.type}
                  </span>
                </div>
                {move.description && (
                  <div className="text-xs text-[var(--fg-300)] mt-1 line-clamp-2">
                    {move.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {isExecuting && (
        <div className="mt-4 text-center text-[var(--fg-200)]">
          <div className="loading-spinner h-5 w-5 mx-auto mb-2"></div>
          <span className="text-xs font-mono uppercase">Rolling...</span>
        </div>
      )}
    </div>
  );
}
