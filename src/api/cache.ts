const MAX_ENTRIES = 500;
const NEG_TTL_MS = 5_000;

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

  delete(key: string): void { this.store.delete(key); }

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
  async delete(key: string): Promise<void> { await this.kv.delete(key); }
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
const negKeys = new Set<string>();

export async function withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const cached = await globalCache.get<T>(key);
  if (cached !== null) return cached;
  if (negKeys.has(key)) throw new Error("upstream temporarily unavailable");
  return dedup(key, async () => {
    try {
      const data = await fn();
      await globalCache.set(key, data, ttlMs);
      return data;
    } catch (err) {
      negKeys.add(key);
      setTimeout(() => negKeys.delete(key), NEG_TTL_MS);
      throw err;
    }
  });
}

export async function withCacheTtl<T>(key: string, defaultTtl: number, fn: () => Promise<{ data: T; ttl: number }>): Promise<T> {
  const cached = await globalCache.get<T>(key);
  if (cached !== null) return cached;
  if (negKeys.has(key)) throw new Error("upstream temporarily unavailable");
  return dedup(key, async () => {
    try {
      const { data, ttl } = await fn();
      await globalCache.set(key, data, ttl);
      return data;
    } catch (err) {
      negKeys.add(key);
      setTimeout(() => negKeys.delete(key), NEG_TTL_MS);
      throw err;
    }
  });
}

export function settled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === "fulfilled" ? result.value : fallback;
}
