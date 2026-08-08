import { CacheService } from "./core/cache";
import { HttpClient } from "./core/http";

export interface Env {
  METRICS?: KVNamespace;
  CACHE_VERSION?: string;
}

export interface AppContext {
  env: Env;
  cache: CacheService;
  http: HttpClient;
  version: string;
  now(): number;
  log(level: "info" | "warn" | "error", msg: string, meta?: Record<string, unknown>): void;
}

export function buildContext(env: Env): AppContext {
  const version = env.CACHE_VERSION ?? "v1";
  return {
    env,
    cache: new CacheService({ kv: env.METRICS ?? null, version }),
    http: new HttpClient(),
    version,
    now: () => Date.now(),
    log: (level, msg, meta) => {
      const line = meta ? `${msg} ${JSON.stringify(meta)}` : msg;
      if (level === "error") console.error(`[${level}] ${line}`);
      else if (level === "warn") console.warn(`[${level}] ${line}`);
      else console.log(`[${level}] ${line}`);
    },
  };
}