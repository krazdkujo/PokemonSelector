'use client';

import Image from 'next/image';
import type { Pokemon } from '@/lib/types';

interface ConfirmationModalProps {
  pokemon: Pokemon;
  isOpen: boolean;
  isLoading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  pokemon,
  isOpen,
  isLoading = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Confirm Your Starter
        </h2>

        <div className="text-center mb-6">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <Image
              src={pokemon.sprites.main}
              alt={pokemon.name}
              fill
              className="object-contain"
              sizes="128px"
            />
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {pokemon.name}
          </h3>

          <div className="flex gap-2 justify-center mb-4">
            {pokemon.types.map((type) => (
              <span
                key={type}
                className={`type-badge type-${type.toLowerCase()}`}
              >
                {type}
              </span>
            ))}
          </div>

          <p className="text-gray-600">
            Are you sure you want to choose <strong>{pokemon.name}</strong> as your starter Pokemon?
          </p>
          <p className="text-sm text-amber-600 mt-2">
            This choice is final and cannot be changed!
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 btn-secondary py-3 disabled:opacity-50"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 btn-primary py-3 disabled:opacity-50"
          >
            {isLoading ? 'Selecting...' : 'Confirm Selection'}
          </button>
        </div>
      </div>
    </div>
  );
}
