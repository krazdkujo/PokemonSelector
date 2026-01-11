/**
 * Capture Logic Library
 *
 * Handles capture mechanics including DC calculation, capture attempts, and flee chances.
 */

import seedrandom from 'seedrandom';
import { rollD20 } from './battle';

/**
 * Context for capture DC calculation
 */
export interface CaptureContext {
  playerLevel: number;
  playerSR: number;
  wildLevel: number;
  wildSR: number;
  playerRoundWins: number;
  captureAttempts: number;
}

/**
 * Result of a capture attempt
 */
export interface CaptureAttemptResult {
  success: boolean;
  roll: number;
  dc: number;
  fled: boolean;
}

/**
 * Calculate the capture DC (Difficulty Class)
 *
 * Base DC: 15
 * Adjustments:
 * - +1 per level difference (wild higher = harder)
 * - +1 per SR point difference (wild higher = harder)
 * - -3 per round win by player (more wins = easier)
 * - Minimum DC: 5
 * - Maximum DC: 25
 *
 * @param ctx Capture context
 * @returns The difficulty class for capture
 */
export function calculateCaptureDC(ctx: CaptureContext): number {
  let dc = 15; // Base DC

  // Level difference adjustment
  const levelDiff = ctx.wildLevel - ctx.playerLevel;
  dc += Math.ceil(levelDiff);

  // SR difference adjustment
  const srDiff = ctx.wildSR - ctx.playerSR;
  dc += Math.ceil(srDiff);

  // Round win bonus (each win makes capture easier)
  dc -= ctx.playerRoundWins * 3;

  // Clamp DC between 5 and 25
  return Math.max(5, Math.min(25, dc));
}

/**
 * Attempt to capture a wild Pokemon
 *
 * @param ctx Capture context for DC calculation
 * @param battleId Battle ID for seeded RNG
 * @param attemptNumber Current capture attempt number
 * @returns Capture attempt result
 */
export function attemptCapture(
  ctx: CaptureContext,
  battleId: string,
  attemptNumber: number
): CaptureAttemptResult {
  // Create RNG seeded with battle ID and attempt number
  const rng = seedrandom(`${battleId}:capture:${attemptNumber}`);

  const dc = calculateCaptureDC(ctx);
  const roll = rollD20(rng);
  const success = roll >= dc;

  // If capture failed, check for flee
  let fled = false;
  if (!success) {
    fled = checkFlee(rng);
  }

  return {
    success,
    roll,
    dc,
    fled,
  };
}

/**
 * Check if the wild Pokemon flees after a failed capture attempt
 *
 * 25% chance to flee after each failed capture
 *
 * @param rng The seeded PRNG
 * @returns true if the Pokemon flees
 */
export function checkFlee(rng: seedrandom.PRNG): boolean {
  return rng() < 0.25; // 25% flee chance
}

/**
 * Calculate capture success message
 *
 * @param dc The difficulty class
 * @returns A description of the capture difficulty
 */
export function getCaptureDifficultyDescription(dc: number): string {
  if (dc <= 7) {
    return 'Very Easy';
  } else if (dc <= 10) {
    return 'Easy';
  } else if (dc <= 13) {
    return 'Moderate';
  } else if (dc <= 16) {
    return 'Difficult';
  } else if (dc <= 19) {
    return 'Very Difficult';
  } else {
    return 'Extremely Difficult';
  }
}
