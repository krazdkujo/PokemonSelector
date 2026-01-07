'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrainerInfo } from '@/components/TrainerInfo';
import { StarterDisplay } from '@/components/StarterDisplay';
import { NicknameEditor } from '@/components/NicknameEditor';
import { getTrainerId, clearTrainerId } from '@/lib/session';
import type { TrainerWithStarter } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [trainer, setTrainer] = useState<TrainerWithStarter | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrainerData = async () => {
      const trainerId = getTrainerId();

      if (!trainerId) {
        router.replace('/');
        return;
      }

      try {
        const response = await fetch(`/api/trainer/${trainerId}`);

        if (response.status === 404) {
          // Trainer not found, clear session and redirect
          clearTrainerId();
          router.replace('/');
          return;
        }

        if (!response.ok) {
          setError('Failed to load trainer data');
          setIsLoading(false);
          return;
        }

        const data: TrainerWithStarter = await response.json();

        // If trainer doesn't have a starter, redirect to selection
        if (!data.starter_pokemon_id || !data.starter) {
          router.replace('/select');
          return;
        }

        setTrainer(data);
        setIsLoading(false);
      } catch {
        setError('An unexpected error occurred');
        setIsLoading(false);
      }
    };

    loadTrainerData();
  }, [router]);

  const handleLogout = () => {
    clearTrainerId();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={handleLogout} className="btn-primary">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const handleNicknameChange = (nickname: string | null) => {
    if (trainer) {
      setTrainer({
        ...trainer,
        starter_pokemon_nickname: nickname,
      });
    }
  };

  if (!trainer || !trainer.starter) {
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {trainer.name}!
          </h1>
          <button
            onClick={handleLogout}
            className="btn-secondary"
          >
            Logout
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <TrainerInfo trainer={trainer} />
          <div>
            <StarterDisplay
              pokemon={trainer.starter}
              nickname={trainer.starter_pokemon_nickname}
            />
            <NicknameEditor
              trainerId={trainer.id}
              currentNickname={trainer.starter_pokemon_nickname}
              onNicknameChange={handleNicknameChange}
            />
          </div>
        </div>

        {trainer.role === 'admin' && (
          <div className="mt-8 text-center">
            <a
              href="/admin"
              className="btn-primary inline-block"
            >
              View Admin Panel
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
