'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PokemonCollection } from '@/components/PokemonCollection';
import { MoveSelector } from '@/components/MoveSelector';
import { EvolutionModal } from '@/components/EvolutionModal';
import { getTrainerId } from '@/lib/session';
import { getPokemonSpriteUrl } from '@/lib/evolution';
import type { PokemonOwnedWithDetails, EvolutionInfo } from '@/lib/types';

type SortOption = 'level' | 'sr' | 'name' | 'captured_at' | 'type';
type SortDirection = 'asc' | 'desc';

type PokemonWithEvolution = PokemonOwnedWithDetails & { evolution_info?: EvolutionInfo };

export default function PokecenterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [pokemon, setPokemon] = useState<PokemonWithEvolution[]>([]);
  const [activePokemonId, setActivePokemonId] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Evolution modal state
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolvingPokemonId, setEvolvingPokemonId] = useState<string | null>(null);
  const [evolutionTarget, setEvolutionTarget] = useState<{ from: PokemonWithEvolution; to: EvolutionInfo } | null>(null);

  // Sorting and filtering state
  const [sortBy, setSortBy] = useState<SortOption>('captured_at');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [levelMin, setLevelMin] = useState<number>(1);
  const [levelMax, setLevelMax] = useState<number>(10);

  // Extract all unique types from Pokemon collection
  const allTypes = useMemo(() => {
    return Array.from(new Set(pokemon.flatMap(p => p.types))).sort();
  }, [pokemon]);

  // Apply filtering and sorting
  const displayedPokemon = useMemo(() => {
    // Filter
    const filtered = pokemon.filter(p => {
      if (typeFilter !== 'all' && !p.types.includes(typeFilter)) return false;
      if (p.level < levelMin || p.level > levelMax) return false;
      return true;
    });

    // Sort
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'level':
          comparison = a.level - b.level;
          break;
        case 'sr':
          comparison = a.sr - b.sr;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'captured_at':
          comparison = new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime();
          break;
        case 'type':
          comparison = a.types[0].localeCompare(b.types[0]);
          break;
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [pokemon, sortBy, sortDir, typeFilter, levelMin, levelMax]);

  const clearFilters = () => {
    setTypeFilter('all');
    setLevelMin(1);
    setLevelMax(10);
  };

  const hasActiveFilters = typeFilter !== 'all' || levelMin !== 1 || levelMax !== 10;

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

  // Handle evolution button click - show modal
  function handleEvolveClick(pokemonId: string, evolutionInfo: EvolutionInfo) {
    const targetPokemon = pokemon.find(p => p.id === pokemonId);
    if (!targetPokemon || !evolutionInfo.nextEvolutionId || !evolutionInfo.nextEvolutionName) return;

    setEvolvingPokemonId(pokemonId);
    setEvolutionTarget({ from: targetPokemon, to: evolutionInfo });
    setShowEvolutionModal(true);
  }

  // Handle confirm evolution
  async function handleEvolve(targetEvolutionId?: number) {
    if (!evolvingPokemonId) return;

    try {
      setIsEvolving(true);
      setError(null);

      const requestBody: { pokemon_id: string; target_evolution_id?: number } = {
        pokemon_id: evolvingPokemonId,
      };
      if (targetEvolutionId) {
        requestBody.target_evolution_id = targetEvolutionId;
      }

      const response = await fetch('/api/pokecenter/evolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to evolve Pokemon');
        return;
      }

      // Refresh the Pokemon list to show evolved form
      await loadPokemon();

      setSuccessMessage(`${data.evolved_from.name} evolved into ${data.evolved_to.name}!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch {
      setError('An unexpected error occurred during evolution');
    } finally {
      setIsEvolving(false);
      setShowEvolutionModal(false);
      setEvolvingPokemonId(null);
      setEvolutionTarget(null);
    }
  }

  // Handle cancel evolution
  function handleEvolveLater() {
    setShowEvolutionModal(false);
    setEvolvingPokemonId(null);
    setEvolutionTarget(null);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-primary)] mx-auto"></div>
          <p className="mt-4 text-[var(--fg-100)]">Loading your Pokemon collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--fg-0)]">Pokecenter</h1>
            <p className="text-[var(--fg-100)]">Manage your Pokemon collection</p>
          </div>
          <Link href="/dashboard" className="btn-secondary">
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="error-message mb-6">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="success-message mb-6">
            {successMessage}
          </div>
        )}

        {/* Sort and Filter Controls */}
        <div className="card p-4 mb-6">
          {/* Sort Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <label className="text-sm font-medium text-[var(--fg-100)]">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="input text-sm py-1.5 w-auto"
            >
              <option value="captured_at">Captured Date</option>
              <option value="level">Level</option>
              <option value="sr">Rarity (SR)</option>
              <option value="name">Name</option>
              <option value="type">Type</option>
            </select>
            <button
              onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
              className="btn-ghost text-sm"
            >
              {sortDir === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-[var(--fg-100)]">Filter:</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--fg-200)]">Type</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input text-sm py-1.5 w-auto"
              >
                <option value="all">All Types</option>
                {allTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--fg-200)]">Level</span>
              <input
                type="number"
                min={1}
                max={10}
                value={levelMin}
                onChange={(e) => setLevelMin(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                className="input text-sm py-1.5 w-16"
              />
              <span className="text-sm text-[var(--fg-200)]">to</span>
              <input
                type="number"
                min={1}
                max={10}
                value={levelMax}
                onChange={(e) => setLevelMax(Math.max(1, Math.min(10, parseInt(e.target.value) || 10)))}
                className="input text-sm py-1.5 w-16"
              />
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-sm text-[var(--accent-error)] hover:text-[var(--accent-error)]/80 hover:bg-[var(--accent-error)]/10 rounded-md transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="mb-4 text-[var(--fg-100)] font-mono text-sm">
          Showing {displayedPokemon.length} of {pokemon.length} Pokemon
        </div>

        <PokemonCollection
          pokemon={displayedPokemon}
          activePokemonId={activePokemonId}
          onSetActive={handleSetActive}
          onEvolve={handleEvolveClick}
          isSwapping={isSwapping}
          isEvolving={isEvolving}
        />

        {activePokemonId && (
          <div className="mt-8">
            <MoveSelector pokemonId={activePokemonId} />
          </div>
        )}

        {pokemon.length > 0 && (
          <div className="mt-8 card p-4">
            <h2 className="font-semibold text-[var(--fg-0)] mb-2">Tips</h2>
            <ul className="text-sm text-[var(--fg-100)] space-y-1 list-disc list-inside">
              <li>Your active Pokemon is used in battles</li>
              <li>You cannot swap Pokemon during an active battle</li>
              <li>Each Pokemon can have up to 4 moves selected</li>
              <li>Visit the Move Selector to configure your Pokemon&apos;s moveset</li>
              <li>Pokemon with a purple &quot;Evolve&quot; button can evolve to a stronger form</li>
            </ul>
          </div>
        )}

        {/* Evolution Modal */}
        {evolutionTarget && (
          <EvolutionModal
            isOpen={showEvolutionModal}
            isLoading={isEvolving}
            fromPokemon={{
              id: evolutionTarget.from.pokemon_id,
              name: evolutionTarget.from.name,
              sprite_url: evolutionTarget.from.sprite_url,
            }}
            toPokemon={evolutionTarget.to.hasMultipleEvolutions ? undefined : {
              id: evolutionTarget.to.nextEvolutionId!,
              name: evolutionTarget.to.nextEvolutionName!,
              sprite_url: getPokemonSpriteUrl(evolutionTarget.to.nextEvolutionId!),
            }}
            evolutionOptions={evolutionTarget.to.evolutionOptions}
            onEvolve={handleEvolve}
            onLater={handleEvolveLater}
          />
        )}
      </div>
    </div>
  );
}
