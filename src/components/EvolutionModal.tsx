'use client';

import Image from 'next/image';

interface EvolutionModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  fromPokemon: {
    id: number;
    name: string;
    sprite_url: string;
  };
  toPokemon: {
    id: number;
    name: string;
    sprite_url: string;
  };
  onEvolve: () => void;
  onLater: () => void;
}

export function EvolutionModal({
  isOpen,
  isLoading = false,
  fromPokemon,
  toPokemon,
  onEvolve,
  onLater,
}: EvolutionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-bold text-center text-[var(--fg-0)] mb-2">
          Evolution Ready!
        </h2>
        <p className="text-center text-[var(--fg-100)] mb-6">
          Your {fromPokemon.name} can evolve into {toPokemon.name}!
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
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-2 bg-[var(--accent-primary)]/10 rounded-lg border-2 border-[var(--accent-primary)]/50">
              <Image
                src={toPokemon.sprite_url}
                alt={toPokemon.name}
                fill
                className="object-contain p-2"
                sizes="96px"
              />
            </div>
            <p className="font-semibold text-[var(--accent-primary)]">{toPokemon.name}</p>
          </div>
        </div>

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
            onClick={onEvolve}
            disabled={isLoading}
            className="flex-1 btn-primary py-3"
          >
            {isLoading ? 'Evolving...' : 'Evolve Now!'}
          </button>
        </div>
      </div>
    </div>
  );
}
