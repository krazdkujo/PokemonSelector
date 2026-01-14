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
        // Check if PIN is required - redirect to PIN verify page
        if (data.error === 'PIN_REQUIRED' && data.trainer_id) {
          setTrainerId(data.trainer_id);
          router.push('/pin/verify');
          return;
        }
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
          <div className="w-4 h-4 bg-white animate-pulse"></div>
          <p className="mt-4 text-[var(--fg-200)] text-sm font-mono">loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Technical header */}
      <div className="text-center mb-12">
        <p className="text-[var(--fg-200)] text-xs font-mono uppercase tracking-widest mb-4">
          trainer registration
        </p>
        <h1 className="text-5xl font-bold text-[var(--fg-0)] mb-3 tracking-tight">
          Pokemon Selector
        </h1>
        <p className="text-[var(--fg-100)] text-base max-w-md">
          Begin your journey. Choose wisely.
        </p>
      </div>

      {/* Sharp card */}
      <div className="card p-8 w-full max-w-sm">
        <NameEntryForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      {/* Footer hint */}
      <p className="mt-8 text-xs text-[var(--fg-300)] font-mono">
        v1.0 // enter name to continue
      </p>
    </div>
  );
}
