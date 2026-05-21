import type { ArtificialAnalysisModel, HallucinationRankingEntry } from "../types";
import { normalizePercent } from "./math";

export function buildHallucinationRankings(models: ArtificialAnalysisModel[]): HallucinationRankingEntry[] {
  return models
    .flatMap((model) => {
      const total = model.omniscience_breakdown?.total;
      const rate = normalizePercent(total?.hallucination_rate);
      const acc = normalizePercent(total?.accuracy);
      const attempt = normalizePercent(total?.attempt_rate);
      const idx = normalizePercent(total?.omniscience);
      if (rate == null || acc == null || attempt == null || idx == null) return [];
      return [{ id: model.id, slug: model.slug, model: model.name, hallucinationRate: rate, accuracy: acc, attemptRate: attempt, omniscienceIndex: idx }];
    })
    .sort((a, b) => a.hallucinationRate - b.hallucinationRate);
}
