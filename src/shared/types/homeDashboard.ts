import type { ArtificialAnalysisModel, TtsModel } from "./model";
import type { ArenaModel } from "./leaderboard";
import type { OpenRouterRankingsPayload } from "./openrouter";
import type { PredictionsPayload } from "./predictions";
import type { OpenSourceModelEntry } from "./model";

export interface HomeDashboardData {
  aaIndex: ArtificialAnalysisModel[] | null;
  orRankings: OpenRouterRankingsPayload | null;
  arena: { category: string; fetched_at: unknown; models: ArenaModel[] } | null;
  opensource: OpenSourceModelEntry[] | null;
  tts: TtsModel[] | null;
  predictions: PredictionsPayload | null;
}
