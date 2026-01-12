'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NameEntryForm } from '@/components/NameEntryForm';
import { getTrainerId, setTrainerId, clearTrainerId } from '@/lib/session';
import type { ApiError } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const trainerId = getTrainerId();
      if (trainerId) {
        try {
          // Check if trainer still exists in database
          const trainerResponse = await fetch(`/api/trainer/${trainerId}`);
          if (!trainerResponse.ok) {
            // Trainer not found, clear invalid session
            clearTrainerId();
            setIsCheckingSession(false);
            return;
          }

          // Check dashboard to see if they have an active Pokemon
          const dashResponse = await fetch('/api/dashboard');
          if (dashResponse.ok) {
            const dashboard = await dashResponse.json();
            if (dashboard.active_pokemon) {
              router.replace('/dashboard');
              return;
            }
          }

          // Trainer exists but no active Pokemon, go to select
          router.replace('/select');
          return;
        } catch {
          // Error occurred, clear session
          clearTrainerId();
        }
      }
      setIsCheckingSession(false);
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (name: string) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/trainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = data as ApiError;
        throw new Error(error.message);
      }

      setTrainerId(data.id);

      // Check if returning user has an active Pokemon
      const dashResponse = await fetch('/api/dashboard');
      if (dashResponse.ok) {
        const dashboard = await dashResponse.json();
        if (dashboard.active_pokemon) {
          router.push('/dashboard');
          return;
        }
      }

      // New user or no Pokemon yet
      router.push('/select');
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Pokemon Starter Selector
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Begin your journey and choose your starter Pokemon!
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50 p-8 w-full max-w-md">
        <NameEntryForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        Enter your name to start or continue your journey.
      </p>
    </div>
  );
}
