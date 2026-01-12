'use client';

const TRAINER_ID_KEY = 'trainerId';
const COOKIE_NAME = 'trainer_id';
const PIN_VERIFIED_KEY = 'pin_verified';

/**
 * Get the current trainer ID from localStorage or cookie
 */
export function getTrainerId(): string | null {
  if (typeof window === 'undefined') return null;
  // Check localStorage first, then cookie
  const fromStorage = localStorage.getItem(TRAINER_ID_KEY);
  if (fromStorage) return fromStorage;

  // Check cookie as fallback
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === COOKIE_NAME) return value;
  }
  return null;
}

/**
 * Set the trainer ID in localStorage (cookie is set by API)
 */
export function setTrainerId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRAINER_ID_KEY, id);
}

/**
 * Clear the trainer ID from localStorage and cookie (logout)
 * Also clears PIN verification state
 */
export function clearTrainerId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TRAINER_ID_KEY);
  // Clear PIN verification state
  sessionStorage.removeItem(PIN_VERIFIED_KEY);
  // Clear cookie by setting it to expire in the past
  document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Check if a trainer session exists
 */
export function hasSession(): boolean {
  return getTrainerId() !== null;
}

// ============================================
// PIN Verification State (013-pin-auth)
// ============================================

/**
 * Check if PIN has been verified for this session
 * Uses sessionStorage so verification is required each browser session
 */
export function getPinVerified(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(PIN_VERIFIED_KEY) === 'true';
}

/**
 * Set PIN verification state for this session
 */
export function setPinVerified(verified: boolean): void {
  if (typeof window === 'undefined') return;
  if (verified) {
    sessionStorage.setItem(PIN_VERIFIED_KEY, 'true');
  } else {
    sessionStorage.removeItem(PIN_VERIFIED_KEY);
  }
}

/**
 * Clear PIN verification state (used on logout or PIN change)
 */
export function clearPinVerified(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(PIN_VERIFIED_KEY);
}
