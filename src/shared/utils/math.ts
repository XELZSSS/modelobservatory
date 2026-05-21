/**
 * Normalize a value that may be a fraction (0-1) or a percentage (0-100).
 * Heuristic: values strictly between 0 and 1 (exclusive) are treated as fractions.
 * Values 0, 1, or >= 2 are assumed to already be percentages.
 */
export function normalizePercent(value: number | null | undefined): number | null {
  if (value == null) return null;
  if (value === 0 || value === 1) return value;
  if (value > 0 && value < 1) return value * 100;
  return value;
}

/**
 * Compare two numbers with relative tolerance. IEEE-754 arithmetic (e.g. `a/b`,
 * `0.1 + 0.2`) frequently produces results that differ by a few ULPs, so strict
 * `===` comparisons on computed values miss legitimate ties. Used for "best value"
 * highlighting where multiple computed values may be mathematically equal.
 */
export function approxEq(a: number, b: number, eps = 1e-9): boolean {
  if (a === b) return true;
  return Math.abs(a - b) < eps * Math.max(1, Math.abs(a), Math.abs(b));
}
