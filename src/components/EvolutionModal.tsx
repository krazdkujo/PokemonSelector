'use client';

import { useState } from 'react';
import Image from 'next/image';

interface EvolutionOption {
  id: number;
  name: string;
  sprite_url: string;
  type: string[];
}

interface EvolutionModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  fromPokemon: {
    id: number;
    name: string;
    sprite_url: string;
  };
  toPokemon?: {
    id: number;
    name: string;
    sprite_url: string;
  };
  evolutionOptions?: EvolutionOption[];
  onEvolve: (targetEvolutionId?: number) => void;
  onLater: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  water: '#6390F0',
  electric: '#F7D02C',
  fire: '#EE8130',
  normal: '#A8A77A',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

export function EvolutionModal({
  isOpen,
  isLoading = false,
  fromPokemon,
  toPokemon,
  evolutionOptions,
  onEvolve,
  onLater,
}: EvolutionModalProps) {
  const [selectedEvolution, setSelectedEvolution] = useState<number | null>(null);

  if (!isOpen) return null;

  const hasMultipleOptions = evolutionOptions && evolutionOptions.length > 1;
  const displayToPokemon = hasMultipleOptions
    ? evolutionOptions.find(e => e.id === selectedEvolution)
    : toPokemon;

  const handleEvolve = () => {
    if (hasMultipleOptions) {
      if (selectedEvolution) {
        onEvolve(selectedEvolution);
      }
    } else {
      onEvolve();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-bold text-center text-[var(--fg-0)] mb-2">
          Evolution Ready!
        </h2>

        {hasMultipleOptions ? (
          <>
            <p className="text-center text-[var(--fg-100)] mb-6">
              Your {fromPokemon.name} can evolve! Choose an evolution:
            </p>

            {/* From Pokemon */}
            <div className="flex justify-center mb-4">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2 bg-[var(--bg-200)] rounded-lg">
                  <Image
                    src={fromPokemon.sprite_url}
                    alt={fromPokemon.name}
                    fill
                    className="object-contain p-2"
                    sizes="80px"
                  />
                </div>
                <p className="font-semibold text-[var(--fg-100)]">{fromPokemon.name}</p>
              </div>
            </div>

            {/* Arrow down */}
            <div className="text-3xl text-[var(--accent-primary)] font-bold text-center mb-4">
              ↓
            </div>

            {/* Evolution Options Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {evolutionOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedEvolution(option.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedEvolution === option.id
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                      : 'border-[var(--bg-300)] hover:border-[var(--bg-400)]'
                  }`}
                >
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <Image
                      src={option.sprite_url}
                      alt={option.name}
                      fill
                      className="object-contain"
                      sizes="64px"
                    />
                  </div>
                  <p className="font-semibold text-sm text-[var(--fg-100)]">{option.name}</p>
                  <div className="flex justify-center gap-1 mt-1">
                    {option.type.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-1.5 py-0.5 rounded text-white capitalize"
                        style={{ backgroundColor: TYPE_COLORS[t] || '#777' }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-center text-[var(--fg-100)] mb-6">
              Your {fromPokemon.name} can evolve into {displayToPokemon?.name}!
            </p>

            <div className="flex items-center justify-center gap-4 mb-6">
              {/* From Pokemon */}
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-2 bg-[var(--bg-200)] rounded-lg">
                  <Image
                    src={fromPokemon.sprite_url}
                    alt={fromPokemon.name}
                    fill
                    className="object-contain p-2"
                    sizes="96px"
                  />
                </div>
                <p className="font-semibold text-[var(--fg-100)]">{fromPokemon.name}</p>
              </div>

              {/* Arrow */}
              <div className="text-4xl text-[var(--accent-primary)] font-bold">
                &rarr;
              </div>

              {/* To Pokemon */}
              {displayToPokemon && (
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-2 bg-[var(--accent-primary)]/10 rounded-lg border-2 border-[var(--accent-primary)]/50">
                    <Image
                      src={displayToPokemon.sprite_url}
                      alt={displayToPokemon.name}
                      fill
                      className="object-contain p-2"
                      sizes="96px"
                    />
                  </div>
                  <p className="font-semibold text-[var(--accent-primary)]">{displayToPokemon.name}</p>
                </div>
              )}
            </div>
          </>
        )}

        <p className="text-sm text-[var(--fg-200)] text-center mb-6">
          Evolution will transform your Pokemon permanently. Your moves will be preserved.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onLater}
            disabled={isLoading}
            className="flex-1 btn-secondary py-3"
          >
            Maybe Later
          </button>
          <button
            onClick={handleEvolve}
            disabled={isLoading || (hasMultipleOptions && !selectedEvolution)}
            className="flex-1 btn-primary py-3"
          >
            {isLoading ? 'Evolving...' : hasMultipleOptions && !selectedEvolution ? 'Select Evolution' : 'Evolve Now!'}
          </button>
        </div>
      </div>
    </div>
  );
}
