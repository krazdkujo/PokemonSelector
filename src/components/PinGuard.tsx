'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getTrainerId, getPinVerified, clearTrainerId } from '@/lib/session';
import type { PinStatus } from '@/lib/types';

interface PinGuardProps {
  children: ReactNode;
}

// Routes that don't require PIN verification
const PIN_EXEMPT_ROUTES = [
  '/',
  '/pin/create',
  '/pin/verify',
];

/**
 * Component that guards routes requiring PIN verification
 * Redirects to PIN create/verify pages based on user's PIN status
 */
export function PinGuard({ children }: PinGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkPinStatus = async () => {
      // Skip check for exempt routes
      if (PIN_EXEMPT_ROUTES.includes(pathname)) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

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
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
