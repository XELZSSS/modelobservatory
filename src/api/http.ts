import { USER_AGENT } from "../shared/config/http";
import { DEFAULT_TTL_MS } from "../shared/config/cache";
import { withRetry } from "./client/retry";

const UA = USER_AGENT;
export const CACHE_TTL_MS = DEFAULT_TTL_MS;

const TIMEOUT_MS = 20_000;

async function doFetch(url: string, init: RequestInit, accept: string): Promise<Response> {
  const response = await fetch(url, {
    headers: { accept, "user-agent": UA, ...init.headers },
    signal: init.signal ?? AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    const body = accept.includes("json") ? await response.text().catch(() => "") : "";
    throw new Error(`Request failed (${response.status}) for ${url}${body ? `: ${body.slice(0, 200)}` : ""}`);
  }
  return response;
}

export async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  return withRetry(async () => (await doFetch(url, init ?? {}, "application/json")).json() as Promise<T>);
}

export async function fetchText(url: string, init?: RequestInit): Promise<string> {
  return withRetry(async () => (await doFetch(url, init ?? {}, "text/html,application/xhtml+xml,*/*")).text());
}
