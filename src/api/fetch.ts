import { USER_AGENT } from "../shared/config";

const TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 500;

const BASE_HEADERS: Record<string, string> = {
  "user-agent": USER_AGENT,
  "accept-encoding": "gzip, deflate, br",
};

async function doFetch(url: string, init: RequestInit, accept: string): Promise<Response> {
  const headers = { ...BASE_HEADERS, accept, ...init.headers };
  const externalSignal = init.signal;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const timeoutSignal = AbortSignal.timeout(TIMEOUT_MS);
      const signal = externalSignal ? AbortSignal.any([externalSignal, timeoutSignal]) : timeoutSignal;
      const res = await fetch(url, { headers, signal });
      if (!res.ok) {
        const body = accept.includes("json") ? await res.text().catch(() => "") : "";
        throw new Error(`HTTP ${res.status} for ${url}${body ? `: ${body.slice(0, 200)}` : ""}`);
      }
      return res;
    } catch (e) {
      lastErr = e;
      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * (1 << attempt) + Math.random() * BASE_DELAY_MS;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

export async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  return (await doFetch(url, init ?? {}, "application/json")).json() as Promise<T>;
}

export async function fetchText(url: string, init?: RequestInit): Promise<string> {
  return (await doFetch(url, init ?? {}, "text/html,application/xhtml+xml,*/*")).text();
}
