import app from "./api/router";
import { initCache, KVCache, globalCache } from "./api/cache";
import { setCloudflareInfo } from "./api/upstream/system";

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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cacheBackend = env.METRICS ? new KVCache(env.METRICS) : globalCache;
    initCache(cacheBackend);

    const cf = (request as Request & { cf?: CfProperties }).cf;
    if (cf && typeof cf === "object") setCloudflareInfo(cf as Record<string, unknown>);

    return app.fetch(request, env);
  },
};
