'use client';

import Image from 'next/image';
import type { Pokemon } from '@/lib/types';

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

export function PokemonCard({ pokemon, onClick, selected, disabled }: PokemonCardProps) {
  const getTypeClass = (type: string): string => {
    return `type-${type.toLowerCase()}`;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        pokemon-card bg-white rounded-lg shadow-md p-4 text-center
        ${selected ? 'ring-4 ring-blue-500 ring-offset-2' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${!disabled && !selected ? 'hover:shadow-xl' : ''}
      `}
    >
      <div className="relative w-24 h-24 mx-auto mb-2">
        <Image
          src={pokemon.sprites.main}
          alt={pokemon.name}
          fill
          className="object-contain"
          sizes="96px"
        />
      </div>

      <h3 className="font-semibold text-gray-800 mb-1">
        #{pokemon.number.toString().padStart(3, '0')} {pokemon.name}
      </h3>

      <div className="flex gap-1 justify-center flex-wrap">
        {pokemon.types.map((type) => (
          <span
            key={type}
            className={`type-badge ${getTypeClass(type)}`}
          >
            {type}
          </span>
        ))}
      </div>
    </button>
  );
}
