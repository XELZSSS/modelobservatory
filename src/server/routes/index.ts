import type { RouteDef } from "../schema";
import { getLeaderboard as getArenaLeaderboard } from "../data-sources/arena";
import { getIntelligenceIndex } from "../data-sources/artificial";
import { getModels, getReleases } from "../data-sources/huggingface";
import { getNews } from "../data-sources/news";
import { getOpenRouterRankings } from "../data-sources/openrouter";
import { getPredictions } from "../data-sources/polymarket";
import { checkAllUpstreams } from "../data-sources/status";
import { getSystemStats } from "../data-sources/system";
import { getTtsLeaderboard } from "../data-sources/tts";
import { settled } from "../utils";

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
      // NOTE: the artificial-analysis index is intentionally NOT included here;
      // the home view fetches it separately via /api/artificial-analysis-index.
      const [orRankings, arena, opensource, tts, predictions] = await Promise.allSettled([
        getOpenRouterRankings(),
        getArenaLeaderboard("text-to-image"),
        getModels("trendingScore", "-1", 12),
        getTtsLeaderboard(),
        getPredictions(),
      ]);
      return {
        orRankings: settled(orRankings, null),
        arena: settled(arena, null),
        opensource: settled(opensource, null),
        tts: settled(tts, null),
        predictions: settled(predictions, null),
      };
    },
  },
];
