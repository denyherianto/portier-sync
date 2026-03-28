import { jaroWinkler } from '@skyra/jaro-winkler'

/**
 * Two different values are a conflict when they are similar enough that a
 * human should decide which is correct. Completely unrelated values (e.g.
 * "guest" → "admin") are treated as unambiguous updates and auto-applied.
 *
 * Threshold 0.7 correctly classifies the example payload:
 *   CONFLICT     "Sam T." → "Samuel Turner"            (~0.82)
 *   CONFLICT     "mark.old@startup.io" → "mark@…"      (~0.87)
 *   CONFLICT     "+44 20 1234 5678" → "+44 20 9876…"   (~0.80)
 *   CONFLICT     "2026-04-01…" → "2026-07-01…"         (~0.95)
 *   NO_CONFLICT  "guest" → "user"                      (~0.63)
 *   NO_CONFLICT  "active" → "suspended"                (~0.43)
 *   NO_CONFLICT  "active" → "revoked"                  (~0.54)
 */

export const CONFLICT_THRESHOLD = 0.7

export function isSimilarEnoughToConflict(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  if (a === b) return false
  if (!a || !b) return false
  return jaroWinkler(a.toLowerCase(), b.toLowerCase()) >= CONFLICT_THRESHOLD
}
