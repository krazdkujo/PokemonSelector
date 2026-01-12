'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTrainerId, clearTrainerId, setPinVerified } from '@/lib/session';
import { PinCreateForm } from '@/components/PinCreateForm';
import type { PinStatus } from '@/lib/types';

export default function PinCreatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isExistingUser, setIsExistingUser] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const trainerId = getTrainerId();

      if (!trainerId) {
        router.replace('/');
        return;
      }

      try {
        // Check PIN status
        const response = await fetch('/api/pin/status');

        if (response.status === 401) {
          clearTrainerId();
          router.replace('/');
          return;
        }

        if (!response.ok) {
          setIsLoading(false);
          return;
        }

        const status: PinStatus = await response.json();

        // If user already has a PIN and it's not temporary, redirect to verify
        if (status.has_pin && !status.is_temporary) {
          router.replace('/pin/verify');
          return;
        }

        // User needs to create a PIN - check if they're existing (have trainer record)
        const trainerResponse = await fetch(`/api/trainer/${trainerId}`);
        if (trainerResponse.ok) {
          const trainer = await trainerResponse.json();
          // If trainer has started playing (has Pokemon), they're existing
          setIsExistingUser(!!trainer.starter_pokemon_id);
        }

        setIsLoading(false);
      } catch {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [router]);

  const handleSuccess = () => {
    // Set PIN as verified for this session
    setPinVerified(true);
    // Redirect to dashboard or select page
    router.push('/dashboard');
  };

  if (isLoading) {
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-8">
        <PinCreateForm onSuccess={handleSuccess} isExistingUser={isExistingUser} />
      </div>
    </div>
  );
}
