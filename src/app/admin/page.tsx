'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrainerList } from '@/components/TrainerList';
import { getTrainerId, clearTrainerId } from '@/lib/session';
import type { TrainerWithStarter } from '@/lib/types';

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [trainers, setTrainers] = useState<TrainerWithStarter[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const trainerId = getTrainerId();

      if (!trainerId) {
        router.replace('/');
        return;
      }

      try {
        // First check if user is an admin
        const trainerResponse = await fetch(`/api/trainer/${trainerId}`);

        if (!trainerResponse.ok) {
          if (trainerResponse.status === 404) {
            clearTrainerId();
            router.replace('/');
            return;
          }
          setError('Failed to verify access');
          setIsLoading(false);
          return;
        }

        const trainerData: TrainerWithStarter = await trainerResponse.json();

        if (trainerData.role !== 'admin') {
          router.replace('/dashboard');
          return;
        }

        // Fetch all trainers
        const trainersResponse = await fetch(`/api/trainers?requester_id=${trainerId}`);

        if (!trainersResponse.ok) {
          const errorData = await trainersResponse.json();
          setError(errorData.message || 'Failed to load trainers');
          setIsLoading(false);
          return;
        }

        const trainersData: TrainerWithStarter[] = await trainersResponse.json();
        setTrainers(trainersData);
        setIsLoading(false);
      } catch {
        setError('An unexpected error occurred');
        setIsLoading(false);
      }
    };

    loadData();
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
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
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

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-gray-600 mt-1">
              Viewing all {trainers.length} registered trainers
            </p>
          </div>
          <div className="flex gap-3">
            <a href="/dashboard" className="btn-secondary">
              My Dashboard
            </a>
            <button onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          </div>
        </div>

        <TrainerList trainers={trainers} />
      </div>
    </div>
  );
}
