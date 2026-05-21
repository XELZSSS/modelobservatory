import type { RouteDef } from "../../schema";
import { getLeaderboard } from "../../upstream/arena";

export const arenaRoutes: RouteDef[] = [
  {
    path: "/api/arena-leaderboard",
    params: ["category"],
    defaults: { category: "text" },
    handler: (category) => getLeaderboard(category),
  },
];
