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
        card-interactive p-4 text-center w-full
        ${selected ? 'ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-0)]' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="relative w-24 h-24 mx-auto mb-3">
        <Image
          src={pokemon.sprites.main}
          alt={pokemon.name}
          fill
          className="object-contain"
          sizes="96px"
        />
      </div>

      <h3 className="font-semibold text-[var(--fg-0)] mb-1">
        <span className="font-mono text-[var(--fg-200)] text-sm">#{pokemon.number.toString().padStart(3, '0')}</span>{' '}
        {pokemon.name}
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
