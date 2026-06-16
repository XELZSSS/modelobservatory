import { withCache } from "../cache";
import { HEALTH_TIMEOUT_MS, USER_AGENT, upstreamConfig, HEALTH_TTL_MS } from "../../shared/config";
import type { HealthEntry } from "../../shared/types";

const HEALTH_TIMEOUT = HEALTH_TIMEOUT_MS;
const UA = USER_AGENT;

async function ping(url: string): Promise<{ responseTime: number; statusCode: number }> {
  const start = Date.now();
  const res = await fetch(url, { method: "GET", headers: { "user-agent": UA }, signal: AbortSignal.timeout(HEALTH_TIMEOUT) });
  const responseTime = Date.now() - start;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { responseTime, statusCode: res.status };
}

async function probe(name: string, url: string, apiPath?: string): Promise<HealthEntry> {
  try {
    const { responseTime, statusCode } = await ping(url);
    return { name, status: "ok", detail: "reachable", responseTime, statusCode, url: apiPath || url };
  } catch (e: unknown) {
    return { name, status: "error", detail: e instanceof Error ? e.message : "unknown error", responseTime: 0, statusCode: null, url: apiPath || url };
  }
}

export async function checkAllUpstreams(): Promise<HealthEntry[]> {
  return withCache("health", HEALTH_TTL_MS, () =>
    Promise.all([
      probe("HuggingFace Models", `${upstreamConfig.huggingface}?limit=1`, "/api/open-source-models"),
      probe("HuggingFace Releases", `${upstreamConfig.huggingface}?sort=createdAt&direction=-1&limit=1`, "/api/open-source-releases"),
      probe("Artificial Analysis", upstreamConfig.artificialAnalysis, "/api/artificial-analysis-index"),
      probe("OpenRouter Rankings", `${upstreamConfig.openrouter}/api/v1/models`, "/api/openrouter-rankings"),
      probe("Arena.ai Leaderboard", "https://arena.ai/", "/api/arena-leaderboard"),
      probe("Polymarket Predictions", "https://gamma-api.polymarket.com/markets?limit=1", "/api/predictions"),
    ]),
  );
}
