'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NameEntryForm } from '@/components/NameEntryForm';
import { getTrainerId, setTrainerId } from '@/lib/session';
import type { Trainer, ApiError } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const trainerId = getTrainerId();
      if (trainerId) {
        // Check if trainer has a starter
        try {
          const response = await fetch(`/api/trainer/${trainerId}`);
          if (response.ok) {
            const trainer: Trainer = await response.json();
            if (trainer.starter_pokemon_id) {
              router.replace('/dashboard');
            } else {
              router.replace('/select');
            }
            return;
          }
        } catch {
          // Session invalid, continue to login
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

      const trainer = data as Trainer;
      setTrainerId(trainer.id);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Pokemon Starter Selector
        </h1>
        <p className="text-lg text-gray-600">
          Begin your journey and choose your starter Pokemon!
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <NameEntryForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Your trainer ID will be displayed after you select your starter.
      </p>
    </div>
  );
}
