import { USER_AGENT } from "../shared/config";

const TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 500;

const BASE_HEADERS: Record<string, string> = {
  "user-agent": USER_AGENT,
  "accept-encoding": "gzip, deflate, br",
};

export interface FetchOptions extends RequestInit {
  retries?: number;
  timeoutMs?: number;
}

async function doFetch(url: string, init: FetchOptions, accept: string): Promise<Response> {
  const { retries = MAX_RETRIES, timeoutMs = TIMEOUT_MS, ...rest } = init;
  const headers = { ...BASE_HEADERS, accept, ...rest.headers };
  const externalSignal = rest.signal;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const timeoutSignal = AbortSignal.timeout(timeoutMs);
      const signal = externalSignal ? AbortSignal.any([externalSignal, timeoutSignal]) : timeoutSignal;
      const res = await fetch(url, { headers, signal });
      if (!res.ok) {
        // Only transient statuses are worth retrying; 4xx is permanent and
        // retrying just wastes time and upstream requests.
        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          const body = accept.includes("json") ? await res.text().catch(() => "") : "";
          throw new Error(`HTTP ${res.status} for ${url}${body ? `: ${body.slice(0, 200)}` : ""}`);
        }
        throw new RetryableHttpError(res.status, url);
      }
      return res;
    } catch (e) {
      lastErr = e;
      if (!(e instanceof RetryableHttpError)) throw e;
      if (attempt < retries) {
        const delay = BASE_DELAY_MS * (1 << attempt) + Math.random() * BASE_DELAY_MS;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

class RetryableHttpError extends Error {
  constructor(status: number, url: string) {
    super(`HTTP ${status} for ${url}`);
    this.name = "RetryableHttpError";
  }
}

export async function fetchJSON<T>(url: string, init?: FetchOptions): Promise<T> {
  return (await doFetch(url, init ?? {}, "application/json")).json() as Promise<T>;
}

export async function fetchText(url: string, init?: FetchOptions): Promise<string> {
  return (await doFetch(url, init ?? {}, "text/html,application/xhtml+xml,*/*")).text();
}

/**
 * Single-attempt liveness probe for health checks. Returns timing + status code
 * or throws on failure. No retries: a slow/flaky upstream should be reported as
 * degraded rather than masked by backoff.
 */
export async function probeUrl(
  url: string,
  timeoutMs: number,
  headers?: Record<string, string>,
): Promise<{ responseTime: number; statusCode: number }> {
  const start = Date.now();
  const res = await fetch(url, {
    method: "GET",
    headers: { "user-agent": USER_AGENT, ...headers },
    signal: AbortSignal.timeout(timeoutMs),
  });
  const responseTime = Date.now() - start;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { responseTime, statusCode: res.status };
}
