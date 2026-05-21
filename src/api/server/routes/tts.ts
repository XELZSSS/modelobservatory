import type { RouteDef } from "../../schema";
import { getTtsLeaderboard } from "../../upstream/tts";

export const ttsRoutes: RouteDef[] = [
  {
    path: "/api/tts-leaderboard",
    params: [],
    handler: () => getTtsLeaderboard(),
  },
];
