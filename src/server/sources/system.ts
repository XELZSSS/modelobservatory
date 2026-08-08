import { START_TTL_MS } from "../../shared/config";
import type { SystemStats } from "../../shared/types";
import { createSource } from "./types";
import type { AppContext } from "../context";

const START_KEY = "metrics:start";

export const getSystemStats = createSource<Record<string, never>, SystemStats>({
  cacheKey: () => START_KEY,
  defaultTtl: START_TTL_MS,
  fetch: async (ctx: AppContext) => {
    let startTime = await ctx.cache.get<number>(START_KEY);
    if (startTime === null) {
      startTime = ctx.now();
      await ctx.cache.set(START_KEY, startTime, START_TTL_MS);
    }
    return {
      data: {
        runtime: ctx.env.CACHE_VERSION ? "cloudflare" : "standard",
        cloudflare: null,
        uptime: Math.floor((ctx.now() - startTime) / 1000),
      },
      ttl: START_TTL_MS,
    };
  },
});