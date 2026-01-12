'use client';

import Image from 'next/image';
import type { PokemonOwnedWithDetails, EvolutionInfo } from '@/lib/types';

type PokemonWithEvolution = PokemonOwnedWithDetails & { evolution_info?: EvolutionInfo };

interface PokemonCollectionProps {
  pokemon: PokemonWithEvolution[];
  activePokemonId: string | null;
  onSetActive: (pokemonId: string) => void;
  onEvolve?: (pokemonId: string, evolutionInfo: EvolutionInfo) => void;
  isSwapping: boolean;
  isEvolving?: boolean;
}

export function PokemonCollection({
  pokemon,
  activePokemonId,
  onSetActive,
  onEvolve,
  isSwapping,
  isEvolving = false,
}: PokemonCollectionProps) {
  if (pokemon.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        You don&apos;t have any Pokemon yet. Go catch some!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pokemon.map((p) => {
        const isActive = p.id === activePokemonId;

        return (
          <div
            key={p.id}
            className={`
              bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-4 transition
              ${isActive ? 'ring-4 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : ''}
            `}
          >
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={p.sprite_url}
                  alt={p.name}
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 truncate">{p.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Level {p.level}</p>
                {/* XP Progress Display */}
                {p.level >= 10 ? (
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">MAX LEVEL</p>
                ) : (() => {
                  const currentXp = p.experience || 0;
                  const totalXp = currentXp + (p.experience_to_next || 0);
                  const progressPercent = totalXp > 0 ? (currentXp / totalXp) * 100 : 0;
                  return (
                    <div className="mt-1">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                        <span>XP</span>
                        <span>{currentXp} / {totalXp}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
                <div className="flex gap-1 mt-1">
                  {p.types.map((type) => (
                    <span
                      key={type}
                      className={`type-badge type-${type.toLowerCase()} text-xs`}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div>SR: {p.sr}</div>
                {p.is_starter && (
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Starter</span>
                )}
                {/* Evolution info display */}
                {p.evolution_info && (
                  <div className="text-purple-600 dark:text-purple-400">
                    {p.evolution_info.currentStage >= p.evolution_info.totalStages ? (
                      <span className="font-medium">Final evolution</span>
                    ) : p.evolution_info.evolvesAtLevel ? (
                      <span>
                        {p.can_evolve ? (
                          <span className="font-medium">Ready to evolve!</span>
                        ) : (
                          <>Evolves at Lv. {p.evolution_info.evolvesAtLevel}</>
                        )}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {/* Evolve button - show if can_evolve is true */}
                {p.can_evolve && p.evolution_info && onEvolve && (
                  <button
                    onClick={() => onEvolve(p.id, p.evolution_info!)}
                    disabled={isEvolving}
                    className={`
                      px-3 py-1 rounded text-sm font-medium transition
                      ${isEvolving
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                      }
                    `}
                  >
                    Evolve
                  </button>
                )}

                {isActive ? (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded text-sm font-medium">
                    Active
                  </span>
                ) : (
                  <button
                    onClick={() => onSetActive(p.id)}
                    disabled={isSwapping}
                    className={`
                      px-3 py-1 rounded text-sm font-medium transition
                      ${isSwapping
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                      }
                    `}
                  >
                    Set Active
                  </button>
                )}
              </div>
            </div>

            {p.selected_moves && p.selected_moves.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Moves:</div>
                <div className="flex flex-wrap gap-1">
                  {p.selected_moves.map((move, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300"
                    >
                      {move}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
