import type { RouteDef } from "../../schema";
import { settled } from "../../cache";
import { getIntelligenceIndex } from "../../upstream/artificial";
import { getLeaderboard as getArenaLeaderboard } from "../../upstream/arena";
import { getOpenRouterRankings } from "../../upstream/openrouter";
import { getModels as getOpenSourceModels } from "../../upstream/huggingface";
import { getTtsLeaderboard } from "../../upstream/tts";
import { getPredictions } from "../../upstream/polymarket";

export const homeRoutes: RouteDef[] = [
  {
    path: "/api/home-dashboard",
    params: [],
    handler: async () => {
      const [aaIndex, orRankings, arena, opensource, tts, predictions] = await Promise.allSettled([
        getIntelligenceIndex(),
        getOpenRouterRankings(),
        getArenaLeaderboard("text-to-image"),
        getOpenSourceModels("trendingScore", "-1", 12),
        getTtsLeaderboard(),
        getPredictions(),
      ]);
      return {
        aaIndex: settled(aaIndex, null),
        orRankings: settled(orRankings, null),
        arena: settled(arena, null),
        opensource: settled(opensource, null),
        tts: settled(tts, null),
        predictions: settled(predictions, null),
      };
    },
  },
];
