'use client';

import { useMemo } from 'react';
import { PokemonCard } from './PokemonCard';
import type { Pokemon } from '@/lib/types';

interface PokemonGridProps {
  pokemon: Pokemon[];
  selectedType: string | null;
  onPokemonSelect: (pokemon: Pokemon) => void;
  claimedPokemonIds?: number[];
}

export function PokemonGrid({
  pokemon,
  selectedType,
  onPokemonSelect,
  claimedPokemonIds = [],
}: PokemonGridProps) {
  const filteredPokemon = useMemo(() => {
    if (!selectedType) return pokemon;
    return pokemon.filter((p) =>
      p.types.some((t) => t.toLowerCase() === selectedType.toLowerCase())
    );
  }, [pokemon, selectedType]);

  if (filteredPokemon.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          No Pokemon found for this type.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {filteredPokemon.map((p) => {
        const isClaimed = claimedPokemonIds.includes(p.number);
        return (
          <PokemonCard
            key={p.number}
            pokemon={p}
            onClick={() => !isClaimed && onPokemonSelect(p)}
            disabled={isClaimed}
          />
        );
      })}
    </div>
  );
}
