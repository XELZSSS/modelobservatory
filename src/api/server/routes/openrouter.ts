import type { RouteDef } from "../../schema";
import { getOpenRouterRankings } from "../../upstream/openrouter";

export const openrouterRoutes: RouteDef[] = [
  {
    path: "/api/openrouter-rankings",
    params: [],
    handler: () => getOpenRouterRankings(),
  },
];
