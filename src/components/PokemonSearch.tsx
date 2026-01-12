'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getAllPokemonForSearch, findPokemonZones } from '@/lib/battle';

interface PokemonSearchResult {
  number: number;
  name: string;
  types: string[];
  sr: number;
  sprite: string;
}

interface ZoneMatch {
  zoneId: string;
  zoneName: string;
  zoneTypes: string[];
}

export function PokemonSearch() {
  const [query, setQuery] = useState('');
  const [allPokemon, setAllPokemon] = useState<PokemonSearchResult[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<PokemonSearchResult[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonSearchResult | null>(null);
  const [matchingZones, setMatchingZones] = useState<ZoneMatch[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load all Pokemon on mount
  useEffect(() => {
    const pokemon = getAllPokemonForSearch();
    setAllPokemon(pokemon);
  }, []);

  // Filter Pokemon based on query
  useEffect(() => {
    if (query.trim() === '') {
      setFilteredPokemon([]);
      setIsOpen(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = allPokemon.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.number.toString() === query
    ).slice(0, 10);

    setFilteredPokemon(filtered);
    setIsOpen(filtered.length > 0);
  }, [query, allPokemon]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(pokemon: PokemonSearchResult) {
    setSelectedPokemon(pokemon);
    setQuery('');
    setIsOpen(false);

    // Find zones where this Pokemon can appear
    const zones = findPokemonZones(pokemon.number);
    setMatchingZones(zones);
  }

  function handleClear() {
    setSelectedPokemon(null);
    setMatchingZones([]);
    setQuery('');
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Find a Pokemon</h3>

      {/* Search Input */}
      <div className="relative" ref={dropdownRef}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or number..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Dropdown Results */}
        {isOpen && filteredPokemon.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {filteredPokemon.map(pokemon => (
              <button
                key={pokemon.number}
                onClick={() => handleSelect(pokemon)}
                className="w-full px-4 py-2 flex items-center gap-3 hover:bg-blue-50 transition text-left"
              >
                <div className="relative w-10 h-10 flex-shrink-0">
                  <Image
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    fill
                    className="object-contain"
                    sizes="40px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800">
                    #{pokemon.number} {pokemon.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">SR: {pokemon.sr}</span>
                    <div className="flex gap-1">
                      {pokemon.types.map(type => (
                        <span
                          key={type}
                          className={`px-1.5 py-0.5 text-xs rounded type-badge type-${type.toLowerCase()}`}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Pokemon Info */}
      {selectedPokemon && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16">
                <Image
                  src={selectedPokemon.sprite}
                  alt={selectedPokemon.name}
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">
                  #{selectedPokemon.number} {selectedPokemon.name}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">SR: {selectedPokemon.sr}</span>
                  <div className="flex gap-1">
                    {selectedPokemon.types.map(type => (
                      <span
                        key={type}
                        className={`px-2 py-0.5 text-xs rounded type-badge type-${type.toLowerCase()}`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              x
            </button>
          </div>

          {/* Encounter Locations */}
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Can be found in:</h5>
            {matchingZones.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {matchingZones.map(zone => (
                  <div
                    key={zone.zoneId}
                    className="p-2 bg-white rounded border border-gray-200 text-center"
                  >
                    <div className="font-medium text-gray-800 text-sm">{zone.zoneName}</div>
                    <div className="flex flex-wrap justify-center gap-1 mt-1">
                      {zone.zoneTypes
                        .filter(t => selectedPokemon.types.map(pt => pt.toLowerCase()).includes(t))
                        .map(type => (
                          <span
                            key={type}
                            className="px-1 py-0.5 text-xs rounded bg-green-100 text-green-700"
                          >
                            {type}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">This Pokemon cannot be encountered in any zone.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
