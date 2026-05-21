const MAX_ENTRIES = 500;

class MemoryCache {
  private store = new Map<string, { data: unknown; expires: number }>();
  private writes = 0;

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expires <= Date.now()) { this.store.delete(key); return null; }
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.data as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.delete(key);
    this.store.set(key, { data: value, expires: Date.now() + ttlMs });
    if (++this.writes >= 100) { this.writes = 0; this.evict(); }
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  private evict() {
    const now = Date.now();
    for (const [k, v] of this.store) { if (v.expires <= now) this.store.delete(k); }
    while (this.store.size > MAX_ENTRIES) {
      const firstKey = this.store.keys().next().value;
      if (firstKey !== undefined) this.store.delete(firstKey);
      else break;
    }
  }
}

export const cache = new MemoryCache();

export let globalCache: MemoryCache | KVCache = cache;

export function initCache(backend: MemoryCache | KVCache) { globalCache = backend; }

export class KVCache {
  constructor(private kv: KVNamespace) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.kv.get(key, "text");
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    await this.kv.put(key, JSON.stringify(value), { expirationTtl: Math.max(60, Math.ceil(ttlMs / 1000)) });
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }
}

const pending = new Map<string, Promise<unknown>>();

function dedup<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = pending.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const promise = fn().finally(() => pending.delete(key));
  pending.set(key, promise);
  return promise;
}

// Short TTL applied to failed fetches so a flapping upstream doesn't get hammered on every
// request. We mark the failure with a sentinel and serve it (re-throwing) for a few seconds;
// once it expires the next request retries the real fetch. Without this, a transient upstream
// outage causes a full upstream call on every single request until recovery.
// Plain object (not Symbol) so it survives JSON.stringify in the KV backend.
const NEG_TTL_MS = 5_000;
const NEG_KEY = (key: string) => `${key}__neg`;
const NEG_MARKER = { __negativeCache: true } as const;
const isNegMarker = (v: unknown): boolean =>
  typeof v === "object" && v !== null && (v as { __negativeCache?: unknown }).__negativeCache === true;

const SENTINEL = { __nullSentinel: true } as const;
const isSentinel = (v: unknown): boolean =>
  typeof v === "object" && v !== null && (v as { __nullSentinel?: unknown }).__nullSentinel === true;

async function checkCache<T>(key: string): Promise<{ hit: true; value: T } | { hit: false; negKey: string }> {
  const cached = await globalCache.get<unknown>(key);
  if (isSentinel(cached)) return { hit: true, value: null as T };
  if (cached !== null) return { hit: true, value: cached as T };
  const negKey = NEG_KEY(key);
  if (isNegMarker(await globalCache.get<unknown>(negKey))) {
    throw new Error("upstream temporarily unavailable (negative cache)");
  }
  return { hit: false, negKey };
}

function cacheNeg(negKey: string): void {
  globalCache.set(negKey, NEG_MARKER, NEG_TTL_MS);
}

export async function withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const check = await checkCache<T>(key);
  if (check.hit) return check.value;
  return dedup(key, async () => {
    try {
      const data = await fn();
      globalCache.set(key, data === null ? SENTINEL : data, ttlMs);
      return data;
    } catch (err) { cacheNeg(check.negKey); throw err; }
  });
}

export async function withCacheTtl<T>(key: string, defaultTtl: number, fn: () => Promise<{ data: T; ttl: number }>): Promise<T> {
  const check = await checkCache<T>(key);
  if (check.hit) return check.value;
  return dedup(key, async () => {
    try {
      const { data, ttl } = await fn();
      globalCache.set(key, data, ttl);
      return data;
    } catch (err) { cacheNeg(check.negKey); throw err; }
  });
}

export function settled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === "fulfilled" ? result.value : fallback;
}
