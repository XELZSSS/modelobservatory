import app from "./router";
import { initCache, KVCache, globalCache } from "./cache";
import { setCloudflareRuntime } from "./data-sources/system";
import { routeDefs } from "./routes";

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

    setCloudflareRuntime(true);

    return app.fetch(request, env);
  },

  // Keep the shared cache warm so users never pay cold-start upstream latency;
  // runs via the cron trigger in wrangler.toml (every 4 minutes by default).
  async scheduled(env: Env): Promise<void> {
    await ensureCacheInit(env);
    setCloudflareRuntime(true);
    await Promise.allSettled(
      routeDefs.map((route) => {
        const args = route.params.map((p) => route.defaults?.[p] ?? "");
        return route.handler(...args);
      }),
    );
  },
};
