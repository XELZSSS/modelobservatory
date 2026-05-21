import app from "./api/router";
import { initCache, KVCache, cache } from "./api/cache";
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
  ASSETS?: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cacheBackend = env.METRICS ? new KVCache(env.METRICS) : cache;
    initCache(cacheBackend);

    const cf = (request as Request & { cf?: CfProperties }).cf;
    if (cf && typeof cf === "object") setCloudflareInfo(cf as Record<string, unknown>);

    const url = new URL(request.url);

    if (url.pathname.startsWith("/api")) {
      return app.fetch(request, env);
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not found", { status: 404 });
  },
};
