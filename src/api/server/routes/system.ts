import type { RouteDef } from "../../schema";
import { checkAllUpstreams } from "../../upstream/status";
import { getSystemStats } from "../../upstream/system";

export const systemRoutes: RouteDef[] = [
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
];
