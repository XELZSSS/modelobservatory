import { apiBase } from "../../shared/config/apiBase";

const RETRY_STATUSES = new Set([502, 503, 504]);

export interface FetchOptions {
  retry?: number;
  timeout?: number;
  headers?: Record<string, string>;
  method?: string;
  body?: string;
  signal?: AbortSignal;
}

function isAbortError(e: unknown): boolean {
  return e instanceof DOMException && e.name === "AbortError";
}

function isTimeoutError(e: unknown): boolean {
  return e instanceof DOMException && e.name === "TimeoutError";
}

export async function apiFetch<T>(path: string, opts?: FetchOptions): Promise<T> {
  const url = apiBase && path.startsWith("/") ? apiBase + path : path;
  const retries = opts?.retry ?? 3;
  const timeout = opts?.timeout ?? 30_000;

  const signals: AbortSignal[] = [AbortSignal.timeout(timeout)];
  if (opts?.signal) signals.push(opts.signal);
  const combined =
    signals.length === 1
      ? signals[0]!
      : typeof AbortSignal.any === "function"
        ? AbortSignal.any(signals)
        : opts?.signal ?? signals[0]!;

  for (let attempt = 0; attempt < retries; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, Math.min(1000 * 2 ** attempt + Math.random() * 500, 10_000)));
    }
    try {
      const res = await fetch(url, {
        cache: "no-store",
        headers: { accept: "application/json", ...opts?.headers },
        signal: combined,
        method: opts?.method,
        body: opts?.body,
      });
      if (!res.ok) {
        if (RETRY_STATUSES.has(res.status)) continue;
        const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        throw new Error(body?.error?.message || `HTTP ${res.status}: ${res.statusText}`);
      }
      const json = (await res.json()) as { data?: T };
      return (json?.data ?? json) as T;
    } catch (e) {
      if (opts?.signal && isAbortError(e)) throw e;
      if (isTimeoutError(e)) throw e;
      if (attempt === retries - 1) throw e instanceof Error ? e : new Error("Request failed");
    }
  }
  throw new Error("Request failed");
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
