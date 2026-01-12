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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl dark:shadow-gray-900/50 max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">
          Evolution Ready!
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Your {fromPokemon.name} can evolve into {toPokemon.name}!
        </p>

        <div className="flex items-center justify-center gap-4 mb-6">
          {/* From Pokemon */}
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Image
                src={fromPokemon.sprite_url}
                alt={fromPokemon.name}
                fill
                className="object-contain p-2"
                sizes="96px"
              />
            </div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">{fromPokemon.name}</p>
          </div>

          {/* Arrow */}
          <div className="text-4xl text-blue-500 dark:text-blue-400 font-bold">
            &rarr;
          </div>

          {/* To Pokemon */}
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg border-2 border-blue-300 dark:border-blue-600">
              <Image
                src={toPokemon.sprite_url}
                alt={toPokemon.name}
                fill
                className="object-contain p-2"
                sizes="96px"
              />
            </div>
            <p className="font-semibold text-blue-700 dark:text-blue-400">{toPokemon.name}</p>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          Evolution will transform your Pokemon permanently. Your moves will be preserved.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onLater}
            disabled={isLoading}
            className="flex-1 btn-secondary py-3 disabled:opacity-50"
          >
            Maybe Later
          </button>
          <button
            onClick={onEvolve}
            disabled={isLoading}
            className="flex-1 btn-primary py-3 disabled:opacity-50"
          >
            {isLoading ? 'Evolving...' : 'Evolve Now!'}
          </button>
        </div>
      </div>
    </div>
  );
}
