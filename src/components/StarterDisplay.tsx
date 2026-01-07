'use client';

import Image from 'next/image';
import type { Pokemon } from '@/lib/types';

interface StarterDisplayProps {
  pokemon: Pokemon;
}

export function StarterDisplay({ pokemon }: StarterDisplayProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Your Starter Pokemon</h2>

      <div className="relative w-48 h-48 mx-auto mb-4">
        <Image
          src={pokemon.sprites.main}
          alt={pokemon.name}
          fill
          className="object-contain"
          sizes="192px"
          priority
        />
      </div>

      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        {pokemon.name}
      </h3>

      <p className="text-gray-500 mb-3">#{pokemon.number.toString().padStart(3, '0')}</p>

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
