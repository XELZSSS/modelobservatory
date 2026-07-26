const MAX_ENTRIES = 500;
const NEG_TTL_MS = 5_000;
const MAX_NEG_KEYS = 100;

export interface CacheBackend {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlMs: number): Promise<void>;
}

class MemoryCache implements CacheBackend {
  private store = new Map<string, { data: unknown; expires: number }>();
  private writes = 0;

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expires <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    this.store.set(key, { data: value, expires: Date.now() + ttlMs });
    if (++this.writes >= 200) {
      this.writes = 0;
      this.evict();
    }
  }

  private evict() {
    const now = Date.now();
    let staleCount = 0;
    for (const [k, v] of this.store) {
      if (v.expires <= now) { this.store.delete(k); staleCount++; }
    }
    if (this.store.size > MAX_ENTRIES) {
      const toDelete = this.store.size - MAX_ENTRIES;
      let deleted = 0;
      for (const k of this.store.keys()) {
        if (deleted >= toDelete) break;
        this.store.delete(k);
        deleted++;
      }
    }
  }
}

const memCache: CacheBackend = new MemoryCache();
export let globalCache: CacheBackend = memCache;
export function initCache(backend: CacheBackend) {
  globalCache = backend;
}

export class KVCache implements CacheBackend {
  constructor(private kv: KVNamespace) {}
  async get<T>(key: string): Promise<T | null> {
    const raw = await this.kv.get(key, "text");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    await this.kv.put(key, JSON.stringify(value), { expirationTtl: Math.max(60, Math.ceil(ttlMs / 1000)) });
  }
}

// Dedup concurrent requests for the same key
const inflight = new Map<string, Promise<unknown>>();
function dedup<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const promise = fn().finally(() => inflight.delete(key));
  inflight.set(key, promise);
  return promise;
}

// Negative cache: prevent hammering a failing upstream
const negCache = new Map<string, number>();

function addNegKey(key: string) {
  if (negCache.size >= MAX_NEG_KEYS) negCache.clear();
  negCache.set(key, Date.now());
}

function isNegCached(key: string): boolean {
  const ts = negCache.get(key);
  if (ts === undefined) return false;
  if (Date.now() - ts > NEG_TTL_MS) {
    negCache.delete(key);
    return false;
  }
  return true;
}

export async function withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  return withCacheTtl(key, ttlMs, async () => ({ data: await fn(), ttl: ttlMs }));
}

export async function withCacheTtl<T>(key: string, defaultTtl: number, fn: () => Promise<{ data: T; ttl: number }>): Promise<T> {
  const cached = await globalCache.get<T>(key);
  if (cached !== null) return cached;
  if (isNegCached(key)) throw new Error("upstream temporarily unavailable");
  return dedup(key, async () => {
    try {
      const { data, ttl } = await fn();
      await globalCache.set(key, data, ttl);
      return data;
    } catch (err) {
      addNegKey(key);
      throw err;
    }
  });
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

export function formatSettleErrors(results: PromiseSettledResult<unknown>[], labels: string[]): string {
  return results
    .map((r, i) => (r.status === "rejected" ? `${labels[i] ?? i}: ${r.reason instanceof Error ? r.reason.message : r.reason}` : null))
    .filter(Boolean)
    .join("; ");
}
