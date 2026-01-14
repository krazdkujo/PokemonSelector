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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-primary)] mx-auto"></div>
          <p className="mt-4 text-[var(--fg-100)]">Loading Pokedex...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--fg-0)]">Pokedex</h1>
            {stats && (
              <p className="text-[var(--fg-100)] font-mono">
                Caught: {stats.caught}/{stats.total} | Seen: {stats.seen}/{stats.total}
              </p>
            )}
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

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'caught', 'seen', 'unknown'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-150 ${
                filter === f
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-200)] text-[var(--fg-100)] border border-[var(--border)] hover:border-[var(--border-hover)] hover:text-[var(--fg-0)]'
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
                card p-3 text-center relative
                ${pokemon.status === 'unknown' ? 'opacity-60' : ''}
              `}
            >
              {/* Pokemon Number */}
              <div className="text-xs text-[var(--fg-200)] mb-1 font-mono">
                #{pokemon.number.toString().padStart(3, '0')}
              </div>

              {/* Pokemon Image or Question Mark */}
              <div className="relative w-16 h-16 mx-auto mb-2">
                {pokemon.status === 'unknown' ? (
                  <div className="w-full h-full bg-[var(--bg-200)] rounded-full flex items-center justify-center">
                    <span className="text-3xl text-[var(--fg-200)]">?</span>
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
              <div className="text-sm font-medium text-[var(--fg-0)] truncate">
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
                  <div className="w-4 h-4 bg-[var(--accent-success)] rounded-full border-2 border-[var(--bg-100)] shadow"></div>
                </div>
              )}

              {/* Seen but not caught indicator */}
              {pokemon.status === 'seen' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-4 h-4 bg-[var(--accent-warning)] rounded-full border-2 border-[var(--bg-100)] shadow"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredPokedex.length === 0 && (
          <div className="text-center py-12 text-[var(--fg-200)]">
            No Pokemon found matching this filter.
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 card p-4">
          <h3 className="font-medium text-[var(--fg-0)] mb-3">Legend</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[var(--accent-success)] rounded-full"></div>
              <span className="text-sm text-[var(--fg-100)]">Caught</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[var(--accent-warning)] rounded-full"></div>
              <span className="text-sm text-[var(--fg-100)]">Seen (not caught)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[var(--bg-300)] rounded-full flex items-center justify-center">
                <span className="text-xs text-[var(--fg-200)]">?</span>
              </div>
              <span className="text-sm text-[var(--fg-100)]">Unknown</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
