'use client';

import { useState } from 'react';

interface NameEntryFormProps {
  onSubmit: (name: string) => Promise<void>;
  isLoading?: boolean;
}

export function NameEntryForm({ onSubmit, isLoading = false }: NameEntryFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateName = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return 'Please enter your name';
    }
    if (trimmed.length > 20) {
      return 'Name must be 20 characters or less';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    try {
      await onSubmit(name.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="mb-4">
        <label
          htmlFor="trainer-name"
          className="block text-lg font-semibold text-gray-700 mb-2"
        >
          What is your name, trainer?
        </label>
        <input
          id="trainer-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Enter your name"
          maxLength={20}
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          disabled={isLoading}
          autoFocus
        />
        <div className="flex justify-between mt-1 text-sm text-gray-500">
          <span>{error && <span className="text-red-500">{error}</span>}</span>
          <span>{name.trim().length}/20</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || name.trim().length === 0}
        className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Starting your journey...' : 'Start Your Journey!'}
      </button>
    </form>
  );
}
