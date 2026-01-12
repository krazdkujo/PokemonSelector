'use client';

import Image from 'next/image';
import type { Pokemon } from '@/lib/types';

interface StarterDisplayProps {
  pokemon: Pokemon;
  nickname?: string | null;
}

export function StarterDisplay({ pokemon, nickname }: StarterDisplayProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50 p-6 text-center">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Your Starter Pokemon</h2>

      <div className="relative w-48 h-48 mx-auto mb-4">
        <Image
          src={pokemon.sprites.main}
          alt={nickname || pokemon.name}
          fill
          className="object-contain"
          sizes="192px"
          priority
        />
      </div>

      {nickname ? (
        <>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
            {nickname}
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            ({pokemon.name})
          </p>
        </>
      ) : (
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {pokemon.name}
        </h3>
      )}

      <p className="text-gray-500 dark:text-gray-400 mb-3">#{pokemon.number.toString().padStart(3, '0')}</p>

      <div className="flex gap-2 justify-center">
        {pokemon.types.map((type) => (
          <span
            key={type}
            className={`type-badge type-${type.toLowerCase()}`}
          >
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}
