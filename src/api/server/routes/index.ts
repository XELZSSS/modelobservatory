import type { RouteDef } from "../../schema";
import { getLeaderboard as getArenaLeaderboard } from "../../upstream/arena";
import { getIntelligenceIndex } from "../../upstream/artificial";
import { getModels, getReleases } from "../../upstream/huggingface";
import { getNews } from "../../upstream/news";
import { getOpenRouterRankings } from "../../upstream/openrouter";
import { getPredictions } from "../../upstream/polymarket";
import { checkAllUpstreams } from "../../upstream/status";
import { getSystemStats } from "../../upstream/system";
import { getTtsLeaderboard } from "../../upstream/tts";
function settled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

export const routeDefs: RouteDef[] = [
  {
    path: "/api/arena-leaderboard",
    params: ["category"],
    defaults: { category: "text" },
    handler: (category) => getArenaLeaderboard(category),
  },
  {
    path: "/api/artificial-analysis-index",
    params: [],
    handler: () => getIntelligenceIndex(),
  },
  {
    path: "/api/open-source-models",
    params: ["sort", "direction", "limit"],
    defaults: { sort: "trendingScore", direction: "-1", limit: "500" },
    handler: (sort, direction, limit) => {
      const n = Number(limit);
      return getModels(sort, direction, n > 0 ? n : 200);
    },
  },
  {
    path: "/api/open-source-releases",
    params: [],
    handler: () => getReleases(),
  },
  {
    path: "/api/news",
    params: ["category"],
    defaults: { category: "industry" },
    handler: (category) => getNews(category),
  },
  {
    path: "/api/openrouter-rankings",
    params: [],
    handler: () => getOpenRouterRankings(),
  },
  {
    path: "/api/predictions",
    params: [],
    handler: () => getPredictions(),
  },
  {
    path: "/api/tts-leaderboard",
    params: [],
    handler: () => getTtsLeaderboard(),
  },
  {
    path: "/api/health",
    params: [],
    handler: () => checkAllUpstreams(),
  },
  {
    path: "/api/system-stats",
    params: [],
    handler: () => getSystemStats(),
  },
  {
    path: "/api/home-dashboard",
    params: [],
    handler: async () => {
      const [aaIndex, orRankings, arena, opensource, tts, predictions] = await Promise.allSettled([
        getIntelligenceIndex(),
        getOpenRouterRankings(),
        getArenaLeaderboard("text-to-image"),
        getModels("trendingScore", "-1", 12),
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
