/**
 * Secret Key Utilities
 *
 * Generates and validates API secret keys for user authentication.
 * Keys are generated using crypto.randomBytes and hashed with bcrypt.
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Generate a new secret key
 * @returns A base64url-encoded random string (32 bytes = 43 characters)
 */
export function generateSecretKey(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Hash a secret key for storage
 * @param key The plaintext secret key
 * @returns The bcrypt hash of the key
 */
export async function hashKey(key: string): Promise<string> {
  return bcrypt.hash(key, 10);
}

/**
 * Verify a secret key against its hash
 * @param key The plaintext secret key to verify
 * @param hash The bcrypt hash to compare against
 * @returns true if the key matches the hash
 */
export async function verifyKey(key: string, hash: string): Promise<boolean> {
  return bcrypt.compare(key, hash);
}

/**
 * Validate secret key format
 * @param key The key to validate
 * @returns true if the key appears to be a valid format
 */
export function isValidKeyFormat(key: string): boolean {
  // Base64url encoded 32 bytes = 43 characters
  // Allow some flexibility for different encodings
  return typeof key === 'string' && key.length >= 32 && key.length <= 64;
}
