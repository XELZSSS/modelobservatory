import { cors } from "hono/cors";
import { etag } from "hono/etag";
import { timeout } from "hono/timeout";
import { timing } from "hono/timing";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { registerRoutes } from "./server/registerRoutes";
import { ApiError } from "./errors";

import { arenaRoutes } from "./server/routes/arena";
import { artificialRoutes } from "./server/routes/artificial";
import { huggingfaceRoutes } from "./server/routes/huggingface";
import { openrouterRoutes } from "./server/routes/openrouter";
import { newsRoutes } from "./server/routes/news";
import { predictionsRoutes } from "./server/routes/predictions";
import { ttsRoutes } from "./server/routes/tts";
import { homeRoutes } from "./server/routes/home";
import { systemRoutes } from "./server/routes/system";

export const app = new Hono();

app.use("*", logger());
app.use("*", timing());
app.use("*", etag());
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

app.onError((err, c) => {
  if (err instanceof ApiError) {
    const status = (err.status >= 100 && err.status < 600 ? err.status : 500) as ContentfulStatusCode;
    return c.json({ error: { code: status, message: err.message } }, status);
  }
  console.error("[unhandled]", err);
  return c.json({ error: { code: 500, message: "Internal server error" } }, 500);
});

registerRoutes(app, [
  arenaRoutes,
  artificialRoutes,
  huggingfaceRoutes,
  openrouterRoutes,
  newsRoutes,
  predictionsRoutes,
  ttsRoutes,
  homeRoutes,
  systemRoutes,
]);

app.notFound((c) => c.json({ error: { code: 404, message: "API route not found" } }, 404));

export default app;
