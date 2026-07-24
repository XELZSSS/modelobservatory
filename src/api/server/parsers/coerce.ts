/**
 * Shared type-coercion helpers for upstream parsing.
 *
 * Upstream payloads are loosely typed JSON (and sometimes scraped HTML/JSON
 * hybrids), so every field must be defensively normalized before it reaches
 * the typed domain models.
 */

/** Strict finite number, else null. Used for benchmark/score fields. */
export const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

/**
 * Coerce to a finite number with a fallback. Accepts numeric strings (mirrors
 * the original openrouter `num`), because some upstreams send counts/volumes
 * as strings. Returns the fallback for non-finite or non-coercible input.
 */
export const numOr = (v: unknown, fallback = 0): number => {
  const n = typeof v === "number" ? v : Number(v ?? fallback);
  return Number.isFinite(n) ? n : fallback;
};

/** Always a string; empty string for non-strings (never null/undefined). */
export const str = (v: unknown): string => (typeof v === "string" ? v : "");

/** Pass through null/undefined untouched; otherwise a string or undefined. */
export const strOr = (v: unknown): string | null | undefined => {
  if (v == null) return v;
  return typeof v === "string" ? v : undefined;
};

/** Boolean or undefined (null/undefined stay undefined, not null). */
export const bool = (v: unknown): boolean | undefined =>
  typeof v === "boolean" ? v : undefined;

/** A plain object (not an array, not null) or undefined. */
export const obj = (v: unknown): Record<string, unknown> | undefined =>
  typeof v === "object" && v !== null && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : undefined;
