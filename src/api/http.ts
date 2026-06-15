import { USER_AGENT, DEFAULT_TTL_MS } from "../shared/config";

export const CACHE_TTL_MS = DEFAULT_TTL_MS;

const TIMEOUT_MS = 10_000;
const MAX_RETRIES = 1;

const BASE_HEADERS: Record<string, string> = {
  "user-agent": USER_AGENT,
  "accept-encoding": "gzip, deflate, br",
};

async function doFetch(url: string, init: RequestInit, accept: string): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 2000));
    try {
      const response = await fetch(url, {
        headers: { ...BASE_HEADERS, accept, ...init.headers },
        signal: init.signal ?? AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!response.ok) {
        const body = accept.includes("json") ? await response.text().catch(() => "") : "";
        throw new Error(`HTTP ${response.status} for ${url}${body ? `: ${body.slice(0, 200)}` : ""}`);
      }
      return response;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt === MAX_RETRIES) throw lastError;
    }
  }
  throw lastError ?? new Error("Request failed");
}

export async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  return (await doFetch(url, init ?? {}, "application/json")).json() as Promise<T>;
}

export async function fetchText(url: string, init?: RequestInit): Promise<string> {
  return (await doFetch(url, init ?? {}, "text/html,application/xhtml+xml,*/*")).text();
}

export async function fetchRsc(url: string, init?: RequestInit): Promise<string> {
  return (await doFetch(url, init ?? {}, "text/x-component, text/html;q=0.1")).text();
}
