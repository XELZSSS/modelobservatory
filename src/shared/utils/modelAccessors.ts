import type { ArtificialAnalysisModel } from "../types";

export function getOutputSpeed(model: ArtificialAnalysisModel): number | null {
  return model.speed?.median_output_speed ?? model.speed?.timescaleData?.median_output_speed ?? null;
}
