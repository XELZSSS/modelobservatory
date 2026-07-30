import app from "./router";
import { initCache, KVCache, globalCache } from "./cache";
import { setCloudflareInfo } from "./data-sources/system";

interface CfProperties {
  country?: string;
  city?: string;
  continent?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
  [key: string]: unknown;
}

interface Env {
  METRICS?: KVNamespace;
}

let initPromise: Promise<void> | null = null;
let cacheInitialized = false;

async function ensureCacheInit(env: Env): Promise<void> {
  if (cacheInitialized) return;
  if (!initPromise) {
    initPromise = (async () => {
      const cacheBackend = env.METRICS ? new KVCache(env.METRICS) : globalCache;
      initCache(cacheBackend);
      cacheInitialized = true;
    })();
  }
  return initPromise;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    await ensureCacheInit(env);

    const cf = (request as Request & { cf?: CfProperties }).cf;
    if (cf && typeof cf === "object") setCloudflareInfo(cf as Record<string, unknown>);

    return app.fetch(request, env);
  },
};
