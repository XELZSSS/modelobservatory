import type { ArtificialAnalysisModel } from "../types";
import { PRICING_BLENDS } from "../config";

export function normalizePercent(value: number | null | undefined): number | null {
  if (value == null) return null;
  if (value === 0) return 0;
  if (value >= -1 && value <= 1) return value * 100;
  return value;
}

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