import { ApiError } from "./errors";

export interface CacheBackend {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlMs: number): Promise<void>;
}

class MemoryBackend implements CacheBackend {
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

const MAX_ENTRIES = 500;

class KvBackend implements CacheBackend {
  constructor(private kv: KVNamespace) {}
  async get<T>(key: string): Promise<T | null> {
    const raw = await this.kv.get(key, { type: "text", cacheTtl: 60 });
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

const NEG_TTL_MS = 5_000;
const MAX_NEG_KEYS = 100;

export class CacheService {
  private backend: CacheBackend;
  private version: string;
  private inflight = new Map<string, Promise<unknown>>();
  private negCache = new Map<string, number>();

  constructor(opts: { kv?: KVNamespace | null; version?: string }) {
    this.backend = opts.kv ? new KvBackend(opts.kv) : new MemoryBackend();
    this.version = opts.version ?? "v1";
  }

  private versionedKey(key: string): string {
    return `${this.version}:${key}`;
  }

  private isNegCached(key: string): boolean {
    const ts = this.negCache.get(key);
    if (ts === undefined) return false;
    if (Date.now() - ts > NEG_TTL_MS) {
      this.negCache.delete(key);
      return false;
    }
    return true;
  }

  private addNegKey(key: string) {
    if (this.negCache.size >= MAX_NEG_KEYS) this.negCache.clear();
    this.negCache.set(key, Date.now());
  }

  async get<T>(key: string): Promise<T | null> {
    return this.backend.get<T>(this.versionedKey(key));
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    return this.backend.set(this.versionedKey(key), value, ttlMs);
  }

  async withTtl<T>(key: string, defaultTtl: number, fn: () => Promise<{ data: T; ttl?: number }>): Promise<T> {
    const vKey = this.versionedKey(key);
    const cached = await this.backend.get<T>(vKey);
    if (cached !== null) return cached;

    const existing = this.inflight.get(vKey) as Promise<T> | undefined;
    if (existing) return existing;

    const promise = (async () => {
      try {
        const { data, ttl } = await fn();
        await this.backend.set(vKey, data, ttl ?? defaultTtl);
        return data;
      } catch (err) {
        this.addNegKey(vKey);
        throw err;
      }
    })().finally(() => this.inflight.delete(vKey));

    this.inflight.set(vKey, promise);
    return promise;
  }
}
