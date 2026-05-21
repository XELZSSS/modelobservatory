import type { ArtificialAnalysisModel } from "../types";

/**
 * Calculate monthly cost for a model given prompt and completion token counts.
 * Tokens are in raw count (not millions).
 *
 * Guards against NaN/Infinity inputs and non-finite price fields: previously a NaN price
 * passed the `!= null` check and produced a NaN cost that downstream formatters rendered
 * as "$NaN". Negative token counts (e.g. user typing "-") also produced negative costs.
 */
export function calcModelCost(model: ArtificialAnalysisModel, promptTokens: number, completionTokens: number): number | null {
  if (!Number.isFinite(promptTokens) || !Number.isFinite(completionTokens)) return null;
  const pt = Math.max(0, promptTokens);
  const ct = Math.max(0, completionTokens);

  const pricing = model.pricing;
  if (!pricing) return null;

  const inputPrice = pricing.input;
  const outputPrice = pricing.output;

  if (typeof inputPrice === "number" && Number.isFinite(inputPrice) && typeof outputPrice === "number" && Number.isFinite(outputPrice)) {
    return (pt / 1_000_000) * inputPrice + (ct / 1_000_000) * outputPrice;
  }

  const blended = pricing.blended?.["7_2_1"];
  if (typeof blended === "number" && Number.isFinite(blended)) {
    return ((pt + ct) / 1_000_000) * blended;
  }

  return null;
}
