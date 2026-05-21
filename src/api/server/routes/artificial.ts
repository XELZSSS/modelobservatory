import type { RouteDef } from "../../schema";
import { getIntelligenceIndex } from "../../upstream/artificial";

export const artificialRoutes: RouteDef[] = [
  {
    path: "/api/artificial-analysis-index",
    params: [],
    handler: () => getIntelligenceIndex(),
  },
];
