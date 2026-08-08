import { createApp } from "./app";
import { routeDefs } from "./routes";
import type { Env } from "./context";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const app = createApp(routeDefs);
    return app.fetch(request, env);
  },

  // Keep the shared cache warm so users never pay cold-start upstream latency;
  // runs via the cron trigger in wrangler.toml (every 4 minutes by default).
  async scheduled(env: Env): Promise<void> {
    const app = createApp(routeDefs);
    for (const route of routeDefs) {
      const url = new URL(`https://modelobservatory.internal${route.path}`);
      await Promise.resolve(app.request(url, {}, env)).catch(() => undefined);
    }
  },
};