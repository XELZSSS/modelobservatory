import { upstreamConfig } from "../../shared/config";
import type { AppContext } from "../context";
import { parseRscPayload } from "../parser/rsc";

export interface SourceResult<Data> {
  data: Data;
  ttl?: number;
}

export type SourceFn<Params, Data> = (ctx: AppContext, params: Params) => Promise<Data>;

/**
 * Wrap a producer into a cached/validated source function. Caching uses the
 * current AppContext (version-prefixed), and the producer may return a shorter
 * TTL on partial failure so degraded data is not pinned for the full window.
 */
export function createSource<Params, Data>(opts: {
  cacheKey: (params: Params) => string;
  defaultTtl: number;
  fetch: (ctx: AppContext, params: Params) => Promise<SourceResult<Data>>;
}): SourceFn<Params, Data> {
  return (ctx, params) => ctx.cache.withTtl(opts.cacheKey(params), opts.defaultTtl, () => opts.fetch(ctx, params));
}

export function settled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

export function settledValues<T>(results: readonly PromiseSettledResult<T>[]): T[] {
  return results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
}

export function deduplicateBy<T>(arr: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  return arr.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function formatSettleErrors(results: readonly PromiseSettledResult<unknown>[], labels: readonly string[]): string {
  return results
    .map((r, i) => (r.status === "rejected" ? `${labels[i] ?? i}: ${r.reason instanceof Error ? r.reason.message : String(r.reason)}` : null))
    .filter(Boolean)
    .join("; ");
}

const RSC_HEADERS = { RSC: "1", "Next-Router-State-Tree": "%5B%5D" } as const;
const RSC_TIMEOUT_MS = 30_000;

export async function fetchAaRsc(ctx: AppContext, path: string): Promise<string> {
  return ctx.http.text(`${upstreamConfig.artificialAnalysis}${path}`, {
    headers: { ...RSC_HEADERS },
    retries: 0,
    timeoutMs: RSC_TIMEOUT_MS,
  });
}

export function parseAaPayload<T>(body: string, marker: string, extract: (tree: unknown) => T[] | null): T[] {
  return parseRscPayload(body, marker, extract);
}