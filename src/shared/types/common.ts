import type { ArenaPayload } from "./arena";
import type { TtsModel, OpenSourceModelEntry } from "./model";
import type { OpenRouterRankingsPayload } from "./openrouter";
import type { PredictionsPayload } from "./predictions";

export interface HomeDashboardData {
  orRankings: OpenRouterRankingsPayload | null;
  arena: ArenaPayload | null;
  opensource: OpenSourceModelEntry[] | null;
  tts: TtsModel[] | null;
  predictions: PredictionsPayload | null;
}

export interface SearchResult {
  id: string;
  name: string;
  source: string;
  score: number | null;
  provider: string | null;
  link: string;
}