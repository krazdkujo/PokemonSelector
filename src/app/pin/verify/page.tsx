'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getTrainerId, clearTrainerId, setPinVerified } from '@/lib/session';
import { PinInput } from '@/components/PinInput';
import type { PinStatus, PinVerifyResult } from '@/lib/types';

export default function PinVerifyPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [mustChangePin, setMustChangePin] = useState(false);
  const [tempPinMessage, setTempPinMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const trainerId = getTrainerId();

      if (!trainerId) {
        router.replace('/');
        return;
      }

      try {
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

        // If user has no PIN, redirect to create
        if (!status.has_pin) {
          router.replace('/pin/create');
          return;
        }

        // Check if locked
        if (status.is_locked) {
          setIsLocked(true);
          setLockoutSeconds(status.lockout_remaining_seconds || 0);
        }

        setIsLoading(false);
      } catch {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [router]);

  // Countdown timer for lockout
  useEffect(() => {
    if (!isLocked || lockoutSeconds <= 0) return;

    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, lockoutSeconds]);

  const formatLockoutTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/pin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data: PinVerifyResult = await response.json();

      if (response.status === 423) {
        // Account locked
        setIsLocked(true);
        setLockoutSeconds(data.lockout_remaining_seconds || 0);
        setError(data.message || 'Account locked. Please try again later.');
        setPin('');
        setIsSubmitting(false);
        return;
      }

      if (!response.ok || !data.valid) {
        setError(data.message || 'Incorrect PIN');
        setPin('');
        setIsSubmitting(false);
        return;
      }

      // Check if temporary PIN requires change
      if (data.must_change) {
        setMustChangePin(true);
        setTempPinMessage(data.message || 'Your PIN was reset. Please create a new PIN.');
        setPinVerified(true);
        // Small delay to show message before redirect
        setTimeout(() => {
          router.push('/pin/create');
        }, 2000);
        return;
      }

      // Success - set verified and redirect
      setPinVerified(true);
      router.push('/dashboard');
    } catch {
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearTrainerId();
    router.push('/');
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

  if (mustChangePin) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-8 text-center">
          <div className="text-yellow-600 dark:text-yellow-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">PIN Change Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{tempPinMessage}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Redirecting to PIN setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Enter Your PIN</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Please enter your 4-digit PIN to continue.
          </p>
        </div>

        {isLocked ? (
          <div className="text-center py-8">
            <div className="text-red-600 dark:text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Account Locked</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Too many failed attempts. Please try again in:
            </p>
            <div className="text-3xl font-bold text-red-600 dark:text-red-500 mb-6">
              {formatLockoutTime(lockoutSeconds)}
            </div>
            <button
              onClick={handleLogout}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <PinInput
              value={pin}
              onChange={(v) => {
                setPin(v);
                setError(null);
              }}
              disabled={isSubmitting}
              error={!!error}
              label="PIN"
            />

            {error && (
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || pin.length !== 4}
              className={`
                w-full py-3 px-4 rounded-lg font-medium text-white
                transition-colors
                ${isSubmitting || pin.length !== 4
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                }
              `}
            >
              {isSubmitting ? 'Verifying...' : 'Verify PIN'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Sign in with a different account
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
