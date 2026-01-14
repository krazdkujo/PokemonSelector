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
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-6">
        <label
          htmlFor="trainer-name"
          className="block text-xs font-mono uppercase tracking-wider text-[var(--fg-200)] mb-3"
        >
          Trainer Name
        </label>
        <input
          id="trainer-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Enter name"
          maxLength={20}
          className="input py-3"
          disabled={isLoading}
          autoFocus
        />
        <div className="flex justify-between mt-2 text-xs">
          <span>{error && <span className="text-[var(--accent-error)]">{error}</span>}</span>
          <span className="font-mono text-[var(--fg-300)]">{name.trim().length}/20</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || name.trim().length === 0}
        className="w-full btn-primary py-2.5"
      >
        {isLoading ? 'Loading...' : 'Continue'}
      </button>
    </form>
  );
}
