import { HEALTH_TIMEOUT_MS, upstreamConfig, HEALTH_TTL_MS } from "../../shared/config";
import type { HealthEntry } from "../../shared/types";
import { createSource } from "./types";
import type { AppContext } from "../context";

async function probe(ctx: AppContext, name: string, url: string, apiPath?: string): Promise<HealthEntry> {
  try {
    const { responseTime, statusCode } = await ctx.http.probe(url, HEALTH_TIMEOUT_MS);
    return { name, status: "ok", detail: "reachable", responseTime, statusCode, url: apiPath || url };
  } catch (e: unknown) {
    return {
      name,
      status: "error",
      detail: e instanceof Error ? e.message : "unknown error",
      responseTime: 0,
      statusCode: null,
      url: apiPath || url,
    };
  }
}

export const checkAllUpstreams = createSource<Record<string, never>, HealthEntry[]>({
  cacheKey: () => "health",
  defaultTtl: HEALTH_TTL_MS,
  fetch: (ctx: AppContext) =>
    Promise.all([
      probe(ctx, "HuggingFace Models", `${upstreamConfig.huggingface}?limit=1`, "/api/open-source-models"),
      probe(ctx, "HuggingFace Releases", `${upstreamConfig.huggingface}?sort=createdAt&direction=-1&limit=1`, "/api/open-source-releases"),
      probe(ctx, "Artificial Analysis", upstreamConfig.artificialAnalysis, "/api/artificial-analysis-index"),
      probe(ctx, "OpenRouter Rankings", `${upstreamConfig.openrouter}/api/v1/models`, "/api/openrouter-rankings"),
      probe(ctx, "Arena.ai Leaderboard", "https://arena.ai/", "/api/arena-leaderboard"),
      probe(ctx, "Polymarket Predictions", "https://gamma-api.polymarket.com/markets?limit=1", "/api/predictions"),
    ]).then((data) => ({ data })),
});