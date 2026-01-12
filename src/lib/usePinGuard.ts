'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTrainerId, getPinVerified, clearTrainerId } from './session';
import type { PinStatus } from './types';

interface UsePinGuardOptions {
  skipCheck?: boolean;
}

interface UsePinGuardResult {
  isChecking: boolean;
  isAuthorized: boolean;
  pinStatus: PinStatus | null;
}

/**
 * Hook that checks PIN status and redirects if necessary
 * Use this in protected pages to enforce PIN verification
 */
export function usePinGuard(options: UsePinGuardOptions = {}): UsePinGuardResult {
  const { skipCheck = false } = options;
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(!skipCheck);
  const [isAuthorized, setIsAuthorized] = useState(skipCheck);
  const [pinStatus, setPinStatus] = useState<PinStatus | null>(null);

  useEffect(() => {
    if (skipCheck) {
      setIsAuthorized(true);
      setIsChecking(false);
      return;
    }

    const checkPinStatus = async () => {
      const trainerId = getTrainerId();

      // No session - redirect to login
      if (!trainerId) {
        router.replace('/');
        return;
      }

      // Check if PIN is already verified this session
      if (getPinVerified()) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      try {
        // Fetch PIN status from server
        const response = await fetch('/api/pin/status');

        if (response.status === 401 || response.status === 404) {
          clearTrainerId();
          router.replace('/');
          return;
        }

        if (!response.ok) {
          // On error, allow access but PIN may not be enforced
          setIsAuthorized(true);
          setIsChecking(false);
          return;
        }

        const status: PinStatus = await response.json();
        setPinStatus(status);

        // If user has no PIN, redirect to create
        if (!status.has_pin) {
          router.replace('/pin/create');
          return;
        }

        // If user has PIN but hasn't verified this session
        if (status.has_pin && !getPinVerified()) {
          router.replace('/pin/verify');
          return;
        }

        // All checks passed
        setIsAuthorized(true);
        setIsChecking(false);
      } catch {
        // On network error, allow access
        setIsAuthorized(true);
        setIsChecking(false);
      }
    };

    checkPinStatus();
  }, [skipCheck, router]);

  return { isChecking, isAuthorized, pinStatus };
}
