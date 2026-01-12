'use client';

import { useState, useEffect } from 'react';
import type { Move } from '@/lib/types';

interface MoveSelectorProps {
  pokemonId?: string;
}

export function MoveSelector({ pokemonId }: MoveSelectorProps) {
  const [availableMoves, setAvailableMoves] = useState<Move[]>([]);
  const [selectedMoves, setSelectedMoves] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadMoves();
  }, [pokemonId]);

  async function loadMoves() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/moves');

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Failed to load moves');
        return;
      }

      const data = await response.json();
      setAvailableMoves(data.available_moves || []);
      setSelectedMoves(data.selected_moves || []);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  function toggleMove(moveId: string) {
    setSelectedMoves(prev => {
      if (prev.includes(moveId)) {
        // Remove move
        return prev.filter(id => id !== moveId);
      } else if (prev.length < 4) {
        // Add move if not at max
        return [...prev, moveId];
      }
      return prev;
    });
    setError(null);
    setSuccessMessage(null);
  }

  async function saveMoves() {
    if (selectedMoves.length !== 4) {
      setError('You must select exactly 4 moves');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch('/api/moves', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moves: selectedMoves }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to save moves');
        return;
      }

      setSuccessMessage('Moves saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Move Selection</h2>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading moves...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Move Selection</h2>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-3 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 px-3 py-2 rounded mb-4 text-sm">
          {successMessage}
        </div>
      )}

      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Select 4 moves for your active Pokemon. Selected: {selectedMoves.length}/4
      </p>

      {/* Selected Moves Preview */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Selected Moves</h3>
        <div className="flex flex-wrap gap-2">
          {selectedMoves.length > 0 ? (
            selectedMoves.map(moveId => {
              const move = availableMoves.find(m => m.id === moveId);
              return (
                <span
                  key={moveId}
                  className={`px-3 py-1 rounded text-sm font-medium bg-white dark:bg-gray-700 border dark:border-gray-600 type-${move?.type.toLowerCase() || 'normal'}`}
                >
                  {move?.name || moveId}
                </span>
              );
            })
          ) : (
            <span className="text-blue-600 dark:text-blue-400 text-sm">No moves selected</span>
          )}
        </div>
      </div>

      {/* Available Moves Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
        {availableMoves.map(move => {
          const isSelected = selectedMoves.includes(move.id);

          return (
            <button
              key={move.id}
              onClick={() => toggleMove(move.id)}
              disabled={!isSelected && selectedMoves.length >= 4}
              className={`
                p-3 rounded-lg border-2 text-left transition
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : selectedMoves.length >= 4
                    ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 cursor-pointer'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800 dark:text-gray-100">{move.name}</span>
                <span className={`type-badge type-${move.type.toLowerCase()} text-xs`}>
                  {move.type}
                </span>
              </div>
              {move.description && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {move.description}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={saveMoves}
          disabled={isSaving || selectedMoves.length !== 4}
          className={`
            px-6 py-2 rounded font-medium transition
            ${isSaving || selectedMoves.length !== 4
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          {isSaving ? 'Saving...' : 'Save Moves'}
        </button>
      </div>
    </div>
  );
}
