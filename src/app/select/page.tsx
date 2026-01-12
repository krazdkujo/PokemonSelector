'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PokemonGrid } from '@/components/PokemonGrid';
import { TypeFilter } from '@/components/TypeFilter';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { getTrainerId } from '@/lib/session';
import { getStarterPokemon, getStarterTypes } from '@/lib/pokemon';
import type { Pokemon, ApiError } from '@/lib/types';

export default function SelectPage() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trainerId, setTrainerIdState] = useState<string | null>(null);

  // Only show starter-eligible Pokemon (SR <= 0.5)
  const starterPokemon = getStarterPokemon();
  const types = getStarterTypes();

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      const id = getTrainerId();
      if (!id) {
        router.replace('/');
        return;
      }

      // Check if trainer exists and already has a starter
      try {
        // First check if trainer exists
        const trainerResponse = await fetch(`/api/trainer/${id}`);
        if (trainerResponse.status === 404) {
          router.replace('/');
          return;
        }
        if (!trainerResponse.ok) {
          router.replace('/');
          return;
        }

        // Check dashboard to see if they have an active Pokemon (more reliable than starter_pokemon_id)
        const dashResponse = await fetch('/api/dashboard');
        if (dashResponse.ok) {
          const dashboard = await dashResponse.json();
          if (dashboard.active_pokemon) {
            router.replace('/dashboard');
            return;
          }
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Pokemon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Choose Your Starter Pokemon
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select wisely - this choice is final!
        </p>
        {error && (
          <p className="mt-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-4 py-2 rounded-lg inline-block">
            {error}
          </p>
        )}
      </div>

      <TypeFilter
        types={types}
        selectedType={selectedType}
        onTypeSelect={setSelectedType}
      />

      <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Showing {selectedType ? `${starterPokemon.filter(p => p.types.some(t => t.toLowerCase() === selectedType.toLowerCase())).length} ${selectedType}` : starterPokemon.length} starter-eligible Pokemon (SR 0.5 or less)
      </div>

      <PokemonGrid
        pokemon={starterPokemon}
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
