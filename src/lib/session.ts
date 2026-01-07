'use client';

const TRAINER_ID_KEY = 'trainerId';

/**
 * Get the current trainer ID from localStorage
 */
export function getTrainerId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TRAINER_ID_KEY);
}

/**
 * Set the trainer ID in localStorage
 */
export function setTrainerId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRAINER_ID_KEY, id);
}

/**
 * Clear the trainer ID from localStorage (logout)
 */
export function clearTrainerId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TRAINER_ID_KEY);
}

/**
 * Check if a trainer session exists
 */
export function hasSession(): boolean {
  return getTrainerId() !== null;
}
