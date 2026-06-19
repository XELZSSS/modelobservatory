import { USER_AGENT } from "../shared/config";

const TIMEOUT_MS = 10_000;

const BASE_HEADERS: Record<string, string> = {
  "user-agent": USER_AGENT,
  "accept-encoding": "gzip, deflate, br",
};

async function doFetch(url: string, init: RequestInit, accept: string): Promise<Response> {
  const headers = { ...BASE_HEADERS, accept, ...init.headers };
  const signal = init.signal ?? AbortSignal.timeout(TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers, signal });
    if (!res.ok) {
      const body = accept.includes("json") ? await res.text().catch(() => "") : "";
      throw new Error(`HTTP ${res.status} for ${url}${body ? `: ${body.slice(0, 200)}` : ""}`);
    }
    return res;
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(url, { headers, signal: init.signal ?? AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) {
      const body = accept.includes("json") ? await res.text().catch(() => "") : "";
      throw new Error(`HTTP ${res.status} for ${url}${body ? `: ${body.slice(0, 200)}` : ""}`);
    }
    return res;
  }
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
