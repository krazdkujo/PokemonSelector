'use client';

import { useState, useEffect } from 'react';

interface NicknameEditorProps {
  trainerId: string;
  currentNickname: string | null;
  onNicknameChange: (nickname: string | null) => void;
}

export function NicknameEditor({ trainerId, currentNickname, onNicknameChange }: NicknameEditorProps) {
  const [nickname, setNickname] = useState(currentNickname || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Update local state when prop changes
  useEffect(() => {
    setNickname(currentNickname || '');
  }, [currentNickname]);

  const handleSave = async () => {
    const trimmedNickname = nickname.trim();

    // Validate
    if (trimmedNickname.length > 20) {
      setError('Nickname must be 20 characters or less');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/trainer/${trainerId}/nickname`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: trimmedNickname || null }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to save nickname');
        return;
      }

      onNicknameChange(data.starter_pokemon_nickname);
      setSuccess('Nickname saved!');
      setTimeout(() => setSuccess(null), 2000);
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/trainer/${trainerId}/nickname`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to clear nickname');
        return;
      }

      setNickname('');
      onNicknameChange(null);
      setSuccess('Nickname cleared!');
      setTimeout(() => setSuccess(null), 2000);
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = nickname.trim() !== (currentNickname || '');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50 p-4 mt-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Nickname Your Pokemon</h3>

      <div className="flex gap-2">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Enter a nickname..."
          maxLength={20}
          disabled={isLoading}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
        />
        <button
          onClick={handleSave}
          disabled={isLoading || !hasChanges}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
        {currentNickname && (
          <button
            onClick={handleClear}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {nickname.length}/20 characters
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-2 text-sm text-green-600 dark:text-green-400">
          {success}
        </div>
      )}
    </div>
  );
}
