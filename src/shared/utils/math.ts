import type { ArtificialAnalysisModel } from "../types";
import { PRICING_BLENDS } from "../config";

/**
 * Normalize a value that may be a fraction (0-1) or a percentage (0-100).
 * Heuristic: values strictly between 0 and 1 (exclusive) are treated as fractions
 * and multiplied by 100. Values >= 2 are assumed to already be percentages.
 * 0 is returned as-is (0%). 1 is treated as a fraction (100%) because upstream
 * omniscience/accuracy fields use 0-1 fractions where 1 means 100%.
 */
export function normalizePercent(value: number | null | undefined): number | null {
  if (value == null) return null;
  if (value === 0) return 0;
  if (value >= -1 && value <= 1) return value * 100;
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

export function clampPercent(value: number | null | undefined): number | null {
  const norm = normalizePercent(value);
  if (norm == null) return null;
  return Math.max(0, Math.min(100, norm));
}

export function calcModelCost(model: ArtificialAnalysisModel, promptTokens: number, completionTokens: number): number | null {
  if (!Number.isFinite(promptTokens) || !Number.isFinite(completionTokens)) return null;
  const pt = Math.max(0, promptTokens);
  const ct = Math.max(0, completionTokens);

  const pricing = model.pricing;
  if (!pricing) return null;

  if (Number.isFinite(pricing.input) && Number.isFinite(pricing.output)) {
    return (pt / 1_000_000) * pricing.input! + (ct / 1_000_000) * pricing.output!;
  }

  const blended = pricing.blended?.[PRICING_BLENDS.INPUT_7_OUTPUT_2_1];
  if (Number.isFinite(blended)) {
    return ((pt + ct) / 1_000_000) * blended!;
  }

  return null;
}
