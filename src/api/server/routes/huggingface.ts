import type { RouteDef } from "../../schema";
import { getModels, getReleases } from "../../upstream/huggingface";

export const huggingfaceRoutes: RouteDef[] = [
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
];
