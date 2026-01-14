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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-bold text-center text-[var(--fg-0)] mb-4">
          Confirm Your Starter
        </h2>

        <div className="text-center mb-6">
          <div className="relative w-32 h-32 mx-auto mb-4 bg-[var(--bg-200)] rounded-lg">
            <Image
              src={pokemon.sprites.main}
              alt={pokemon.name}
              fill
              className="object-contain p-2"
              sizes="128px"
            />
          </div>

          <h3 className="text-xl font-semibold text-[var(--fg-0)] mb-2">
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

          <p className="text-[var(--fg-100)]">
            Are you sure you want to choose <strong className="text-[var(--fg-0)]">{pokemon.name}</strong> as your starter Pokemon?
          </p>
          <p className="text-sm text-[var(--accent-warning)] mt-2">
            This choice is final and cannot be changed!
          </p>
        </div>

        {error && (
          <div className="mb-4 error-message">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 btn-secondary py-3"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 btn-primary py-3"
          >
            {isLoading ? 'Selecting...' : 'Confirm Selection'}
          </button>
        </div>
      </div>
    </div>
  );
}
