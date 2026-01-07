'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PokemonGrid } from '@/components/PokemonGrid';
import { TypeFilter } from '@/components/TypeFilter';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { getTrainerId } from '@/lib/session';
import { getPokemon, getUniqueTypes } from '@/lib/pokemon';
import type { Pokemon, Trainer, ApiError } from '@/lib/types';

export default function SelectPage() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trainerId, setTrainerIdState] = useState<string | null>(null);

  const allPokemon = getPokemon();
  const types = getUniqueTypes();

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      const id = getTrainerId();
      if (!id) {
        router.replace('/');
        return;
      }

      // Check if trainer already has a starter
      try {
        const response = await fetch(`/api/trainer/${id}`);
        if (response.ok) {
          const trainer: Trainer = await response.json();
          if (trainer.starter_pokemon_id) {
            router.replace('/dashboard');
            return;
          }
        } else if (response.status === 404) {
          router.replace('/');
          return;
        }
      } catch {
        router.replace('/');
        return;
      }

      setTrainerIdState(id);
      setIsCheckingSession(false);
    };

    checkSession();
  }, [router]);

  const handlePokemonSelect = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
    setIsModalOpen(true);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedPokemon || !trainerId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/trainer/${trainerId}/starter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pokemon_id: selectedPokemon.number }),
      });

      const data = await response.json();

      if (!response.ok) {
        const apiError = data as ApiError;
        setError(apiError.message);
        setIsSubmitting(false);
        return;
      }

      // Success! Redirect to dashboard
      router.push('/dashboard');
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedPokemon(null);
    setError(null);
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Pokemon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Choose Your Starter Pokemon
        </h1>
        <p className="text-gray-600">
          Select wisely - this choice is final!
        </p>
        {error && (
          <p className="mt-4 text-red-600 bg-red-50 px-4 py-2 rounded-lg inline-block">
            {error}
          </p>
        )}
      </div>

      <TypeFilter
        types={types}
        selectedType={selectedType}
        onTypeSelect={setSelectedType}
      />

      <div className="mb-4 text-sm text-gray-500">
        Showing {selectedType ? `${allPokemon.filter(p => p.types.includes(selectedType)).length} ${selectedType}` : allPokemon.length} Pokemon
      </div>

      <PokemonGrid
        pokemon={allPokemon}
        selectedType={selectedType}
        onPokemonSelect={handlePokemonSelect}
      />

      {selectedPokemon && (
        <ConfirmationModal
          pokemon={selectedPokemon}
          isOpen={isModalOpen}
          isLoading={isSubmitting}
          error={error}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
