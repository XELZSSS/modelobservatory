import { cors } from "hono/cors";
import { etag } from "hono/etag";
import { timeout } from "hono/timeout";
import { timing } from "hono/timing";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { registerRoutes } from "./server/registerRoutes";

import { routeDefs } from "./server/routes";

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

registerRoutes(app, [routeDefs]);

app.notFound((c) => c.json({ error: { code: 404, message: "API route not found" } }, 404));

export default app;
