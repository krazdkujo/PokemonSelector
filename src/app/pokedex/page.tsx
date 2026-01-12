'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTrainerId } from '@/lib/session';

interface PokemonEntry {
  number: number;
  name: string;
  types: string[];
  sprite_url: string;
  status: 'unknown' | 'seen' | 'caught';
}

interface PokedexStats {
  total: number;
  caught: number;
  seen: number;
}

export default function PokedexPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [pokedex, setPokedex] = useState<PokemonEntry[]>([]);
  const [stats, setStats] = useState<PokedexStats | null>(null);
  const [filter, setFilter] = useState<'all' | 'caught' | 'seen' | 'unknown'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPokedex() {
      try {
        setIsLoading(true);
        setError(null);

        const trainerId = getTrainerId();
        if (!trainerId) {
          router.replace('/');
          return;
        }

        const response = await fetch('/api/pokedex');

        if (!response.ok) {
          if (response.status === 401) {
            router.replace('/');
            return;
          }
          setError('Failed to load Pokedex');
          return;
        }

        const data = await response.json();
        setPokedex(data.pokedex || []);
        setStats(data.stats || null);
      } catch {
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    loadPokedex();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPokedex = pokedex.filter(pokemon => {
    if (filter === 'all') return true;
    if (filter === 'caught') return pokemon.status === 'caught';
    if (filter === 'seen') return pokemon.status === 'seen' || pokemon.status === 'caught';
    if (filter === 'unknown') return pokemon.status === 'unknown';
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-red-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Pokedex...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Pokedex</h1>
            {stats && (
              <p className="text-gray-600 dark:text-gray-400">
                Caught: {stats.caught}/{stats.total} | Seen: {stats.seen}/{stats.total}
              </p>
            )}
          </div>
          <Link href="/dashboard" className="btn-secondary">
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'caught', 'seen', 'unknown'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? 'bg-red-600 dark:bg-red-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {f === 'all' && `All (${pokedex.length})`}
              {f === 'caught' && `Caught (${stats?.caught || 0})`}
              {f === 'seen' && `Seen (${stats?.seen || 0})`}
              {f === 'unknown' && `Unknown (${(stats?.total || 0) - (stats?.seen || 0)})`}
            </button>
          ))}
        </div>

        {/* Pokemon Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filteredPokedex.map((pokemon) => (
            <div
              key={pokemon.number}
              className={`
                bg-white dark:bg-gray-800 rounded-lg p-3 text-center shadow-sm relative
                ${pokemon.status === 'unknown' ? 'opacity-60' : ''}
              `}
            >
              {/* Pokemon Number */}
              <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                #{pokemon.number.toString().padStart(3, '0')}
              </div>

              {/* Pokemon Image or Question Mark */}
              <div className="relative w-16 h-16 mx-auto mb-2">
                {pokemon.status === 'unknown' ? (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-3xl text-gray-400 dark:text-gray-500">?</span>
                  </div>
                ) : (
                  <Image
                    src={pokemon.sprite_url}
                    alt={pokemon.name}
                    fill
                    className="object-contain"
                    sizes="64px"
                  />
                )}
              </div>

              {/* Pokemon Name */}
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                {pokemon.status === 'unknown' ? '???' : pokemon.name}
              </div>

              {/* Types (only show if seen or caught) */}
              {pokemon.status !== 'unknown' && (
                <div className="flex justify-center gap-1 mt-1 flex-wrap">
                  {pokemon.types.map((type) => (
                    <span
                      key={type}
                      className={`type-badge type-${type.toLowerCase()} text-xs`}
                      style={{ fontSize: '0.6rem', padding: '1px 4px' }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              )}

              {/* Caught Indicator */}
              {pokemon.status === 'caught' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow"></div>
                </div>
              )}

              {/* Seen but not caught indicator */}
              {pokemon.status === 'seen' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-white dark:border-gray-800 shadow"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredPokedex.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No Pokemon found matching this filter.
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-3">Legend</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Caught</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Seen (not caught)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">?</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Unknown</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
