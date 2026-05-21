import type { RouteDef } from "../../schema";
import { getPredictions } from "../../upstream/polymarket";

export const predictionsRoutes: RouteDef[] = [
  {
    path: "/api/predictions",
    params: [],
    handler: () => getPredictions(),
  },
];
