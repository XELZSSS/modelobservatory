export interface HallucinationRankingEntry {
  id: string;
  slug: string;
  model: string;
  hallucinationRate: number;
  accuracy: number;
  attemptRate: number;
  omniscienceIndex: number;
}

export interface ArenaModel {
  rank: number;
  rankUpper?: number | null;
  rankLower?: number | null;
  model: string;
  modelKey?: string | null;
  vendor: string | null;
  license: string | null;
  score: number | null;
  ci: number | null;
  votes: number | null;
  category?: string | null;
  rating?: number | null;
  ratingUpper?: number | null;
  ratingLower?: number | null;
  modelOrganization?: string | null;
  modelUrl?: string | null;
  pricePerImage?: number | null;
  pricePerSecond?: number | null;
  releaseType?: string | null;
}
