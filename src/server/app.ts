import { cors } from "hono/cors";
import { timeout } from "hono/timeout";
import { timing } from "hono/timing";
import { Hono } from "hono";
import { logger } from "hono/logger";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { AppContext, Env } from "./context";
import { buildContext } from "./context";
import { registerRoutes } from "./routes/register";
import type { RouteDef } from "./routes/schema";
import { ApiError } from "./core/errors";

export function createApp(routeDefs: RouteDef[]): Hono {
  const app = new Hono();

  app.use("*", logger());
  app.use("*", timing());
  app.use("/api/*", timeout(45_000));

  app.use(
    "/api/*",
    cors({
      origin: "*",
      allowMethods: ["GET", "HEAD", "POST", "OPTIONS"],
      allowHeaders: ["content-type", "authorization"],
      maxAge: 86400,
    }),
  );

  // Data changes at most once per cache TTL (5 min). Allow shared caches (CDN /
  // edge) to serve it for that window; the upstream TTLs are the source of truth.
  app.use("/api/*", async (c, next) => {
    await next();
    if (c.req.method === "GET" && c.res.status === 200) {
      c.header("Cache-Control", "public, max-age=60, s-maxage=300");
    }
  });

  registerRoutes(app, routeDefs);

  app.onError((err, c) => {
    if (err instanceof ApiError) {
      const status = (err.status >= 100 && err.status < 600 ? err.status : 500) as ContentfulStatusCode;
      return c.json({ error: { code: status, message: err.message } }, status);
    }
    console.error("[unhandled]", err);
    return c.json({ error: { code: 500, message: "Internal server error" } }, 500);
  });

  app.notFound((c) => c.json({ error: { code: 404, message: "API route not found" } }, 404));

  return app;
}

export function makeContext(env: Env): AppContext {
  return buildContext(env);
}