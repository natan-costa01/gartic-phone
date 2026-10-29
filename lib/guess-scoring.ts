export const GUESS_DURATION_MS = 90_000;
export const MAX_GUESS_POINTS = 1_000;

/** Linear score based on server time, capped at 1,000 and zero at the deadline. */
export function guessPoints(remainingMs: number): number {
  return Math.max(0, Math.min(MAX_GUESS_POINTS,
    Math.ceil(MAX_GUESS_POINTS * remainingMs / GUESS_DURATION_MS)));
}
