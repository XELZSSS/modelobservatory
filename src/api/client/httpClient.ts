import { apiBase } from "../../shared/config";

/**
 * Simple frontend API fetch. Timeout and cancellation are handled by the
 * caller's AbortSignal (React Query provides one). Retries are handled by
 * React Query globally — not here.
 */
const FETCH_TIMEOUT_MS = 30_000;

export async function apiFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  const url = apiBase && path.startsWith("/") ? apiBase + path : path;
  const timeout = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  const merged = signal ? AbortSignal.any([signal, timeout]) : timeout;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { accept: "application/json" },
    signal: merged,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message || `HTTP ${res.status}: ${res.statusText}`);
  }
  return (await res.json() as { data: T }).data;
}

export const api = {
  artificialIndex: "/api/artificial-analysis-index",
  arenaLeaderboard: (category: string) => `/api/arena-leaderboard?category=${encodeURIComponent(category)}`,
  openSourceModels: (sort = "trendingScore", direction = "-1", limit = 500) =>
    `/api/open-source-models?sort=${sort}&direction=${direction}&limit=${limit}`,
  openSourceReleases: "/api/open-source-releases",
  openRouterRankings: "/api/openrouter-rankings",
  ttsLeaderboard: "/api/tts-leaderboard",
  health: "/api/health",
  systemStats: "/api/system-stats",
  predictions: "/api/predictions",
  news: (category: string) => `/api/news?category=${encodeURIComponent(category)}`,
  homeDashboard: "/api/home-dashboard",
} as const;
