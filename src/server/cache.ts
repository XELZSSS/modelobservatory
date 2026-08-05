import { ApiError } from "./errors";

// Bump when parsing/mapping changes so stale old-shape payloads in KV are
// never served after a deploy.
const CACHE_VERSION = "v2";

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
    for (const [k, v] of this.store) {
      if (v.expires <= now) this.store.delete(k);
    }
    if (this.store.size > MAX_ENTRIES) {
      const entries = [...this.store.entries()].sort((a, b) => a[1].expires - b[1].expires);
      const toDelete = this.store.size - MAX_ENTRIES;
      for (let i = 0; i < toDelete && i < entries.length; i++) {
        const key = entries[i]?.[0];
        if (key) this.store.delete(key);
      }
    }
  }
}

const memCache: CacheBackend = new MemoryCache();
export let globalCache: CacheBackend = memCache;
export function initCache(backend: CacheBackend) {
  globalCache = backend;
}

// KV reads are edge-cached so repeated fetches of large payloads (multi-MB
// leaderboards) don't hit the KV backend on every request.
const KV_READ_CACHE_TTL = 60;

export class KVCache implements CacheBackend {
  constructor(private kv: KVNamespace) {}
  async get<T>(key: string): Promise<T | null> {
    const raw = await this.kv.get(key, { type: "text", cacheTtl: KV_READ_CACHE_TTL });
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

function versionedKey(key: string): string {
  return `${CACHE_VERSION}:${key}`;
}

export async function withCacheTtl<T>(key: string, defaultTtl: number, fn: () => Promise<{ data: T; ttl: number }>): Promise<T> {
  const vKey = versionedKey(key);
  const cached = await globalCache.get<T>(vKey);
  if (cached !== null) return cached;
  if (isNegCached(vKey)) throw new ApiError("upstream temporarily unavailable", 503);
  return dedup(vKey, async () => {
    try {
      const { data, ttl } = await fn();
      await globalCache.set(vKey, data, ttl);
      return data;
    } catch (err) {
      addNegKey(vKey);
      throw err;
    }
  });
}
