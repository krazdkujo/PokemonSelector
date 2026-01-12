/**
 * PIN Authentication Utilities
 *
 * Functions for hashing, verifying, and validating 4-digit PINs.
 * Uses bcryptjs (same library as API key hashing).
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
const PIN_REGEX = /^[0-9]{4}$/;

/**
 * Validate PIN format (exactly 4 numeric digits)
 * @param pin The PIN to validate
 * @returns true if PIN is exactly 4 digits
 */
export function validatePinFormat(pin: string): boolean {
  return PIN_REGEX.test(pin);
}

/**
 * Hash a PIN for secure storage
 * @param pin The plaintext 4-digit PIN
 * @returns The bcrypt hash of the PIN
 */
export async function hashPin(pin: string): Promise<string> {
  if (!validatePinFormat(pin)) {
    throw new Error('Invalid PIN format: must be exactly 4 numeric digits');
  }
  return bcrypt.hash(pin, SALT_ROUNDS);
}

/**
 * Verify a PIN against its stored hash
 * @param pin The plaintext PIN to verify
 * @param hash The bcrypt hash to compare against
 * @returns true if the PIN matches the hash
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  if (!validatePinFormat(pin)) {
    return false;
  }
  return bcrypt.compare(pin, hash);
}
