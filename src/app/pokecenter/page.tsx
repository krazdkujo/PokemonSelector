'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PokemonCollection } from '@/components/PokemonCollection';
import { MoveSelector } from '@/components/MoveSelector';
import { getTrainerId } from '@/lib/session';
import type { PokemonOwnedWithDetails } from '@/lib/types';

export default function PokecenterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [pokemon, setPokemon] = useState<PokemonOwnedWithDetails[]>([]);
  const [activePokemonId, setActivePokemonId] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function loadPokemon() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/pokecenter');

      if (!response.ok) {
        if (response.status === 401) {
          router.replace('/');
          return;
        }
        setError('Failed to load Pokemon collection');
        return;
      }

      const data = await response.json();
      setPokemon(data.pokemon || []);
      setActivePokemonId(data.active_pokemon_id);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const trainerId = getTrainerId();
    if (!trainerId) {
      router.replace('/');
      return;
    }
    loadPokemon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function handleSetActive(pokemonId: string) {
    try {
      setIsSwapping(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch('/api/pokecenter/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pokemon_id: pokemonId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to swap Pokemon');
        return;
      }

      // Update local state
      setActivePokemonId(pokemonId);
      setPokemon(prev =>
        prev.map(p => ({
          ...p,
          is_active: p.id === pokemonId,
        }))
      );

      setSuccessMessage(`${data.active_pokemon.name} is now your active Pokemon!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSwapping(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your Pokemon collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Pokecenter</h1>
            <p className="text-gray-600">Manage your Pokemon collection</p>
          </div>
          <Link href="/dashboard" className="btn-secondary">
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}

        <div className="mb-4 text-gray-600">
          Total Pokemon: {pokemon.length}
        </div>

        <PokemonCollection
          pokemon={pokemon}
          activePokemonId={activePokemonId}
          onSetActive={handleSetActive}
          isSwapping={isSwapping}
        />

        {activePokemonId && (
          <div className="mt-8">
            <MoveSelector pokemonId={activePokemonId} />
          </div>
        )}

        {pokemon.length > 0 && (
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h2 className="font-semibold text-gray-800 mb-2">Tips</h2>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Your active Pokemon is used in battles</li>
              <li>You cannot swap Pokemon during an active battle</li>
              <li>Each Pokemon can have up to 4 moves selected</li>
              <li>Visit the Move Selector to configure your Pokemon&apos;s moveset</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
