'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TrainerList } from '@/components/TrainerList';
import { getTrainerId, clearTrainerId } from '@/lib/session';
import type { TrainerWithStats } from '@/lib/types';

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [trainers, setTrainers] = useState<TrainerWithStats[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    trainerId: string;
    trainerName: string;
    newRole: 'trainer' | 'admin';
  } | null>(null);
  const [roleChangeError, setRoleChangeError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const trainerId = getTrainerId();

    if (!trainerId) {
      router.replace('/');
      return;
    }

    setCurrentUserId(trainerId);

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

      const trainerData = await trainerResponse.json();

      if (trainerData.role !== 'admin') {
        router.replace('/dashboard');
        return;
      }

      // Fetch all trainers with statistics
      const trainersResponse = await fetch(`/api/trainers?requester_id=${trainerId}`);

      if (!trainersResponse.ok) {
        const errorData = await trainersResponse.json();
        setError(errorData.message || 'Failed to load trainers');
        setIsLoading(false);
        return;
      }

      const trainersData: TrainerWithStats[] = await trainersResponse.json();
      setTrainers(trainersData);
      setIsLoading(false);
    } catch {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = () => {
    clearTrainerId();
    router.push('/');
  };

  const handleRoleChangeRequest = (trainerId: string, newRole: 'trainer' | 'admin') => {
    const trainer = trainers.find((t) => t.id === trainerId);
    if (!trainer) return;

    setPendingRoleChange({
      trainerId,
      trainerName: trainer.name,
      newRole,
    });
    setRoleChangeError(null);
    setShowConfirmDialog(true);
  };

  const handleRoleChangeConfirm = async () => {
    if (!pendingRoleChange) return;

    try {
      const response = await fetch(`/api/trainers/${pendingRoleChange.trainerId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: pendingRoleChange.newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'CANNOT_REMOVE_LAST_ADMIN') {
          setRoleChangeError(
            'Cannot demote the last admin. Assign another admin first.'
          );
          return;
        }
        setRoleChangeError(errorData.message || 'Failed to update role');
        return;
      }

      // Success - refresh the trainer list
      setShowConfirmDialog(false);
      setPendingRoleChange(null);
      setRoleChangeError(null);
      await loadData();
    } catch {
      setRoleChangeError('An unexpected error occurred');
    }
  };

  const handleRoleChangeCancel = () => {
    setShowConfirmDialog(false);
    setPendingRoleChange(null);
    setRoleChangeError(null);
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
      <div className="max-w-7xl mx-auto px-4">
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

        <TrainerList
          trainers={trainers}
          currentUserId={currentUserId ?? undefined}
          onRoleChange={handleRoleChangeRequest}
        />
      </div>

      {/* Role Change Confirmation Dialog */}
      {showConfirmDialog && pendingRoleChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Role Change
            </h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to{' '}
              {pendingRoleChange.newRole === 'admin' ? 'promote' : 'demote'}{' '}
              <span className="font-semibold">{pendingRoleChange.trainerName}</span>{' '}
              to <span className="font-semibold">{pendingRoleChange.newRole}</span>?
            </p>

            {roleChangeError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {roleChangeError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={handleRoleChangeCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChangeConfirm}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  pendingRoleChange.newRole === 'admin'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
              >
                {pendingRoleChange.newRole === 'admin' ? 'Promote' : 'Demote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
