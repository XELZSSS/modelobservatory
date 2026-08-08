import type { Hono } from "hono";
import type { Context } from "hono";
import { startTime, endTime } from "hono/timing";
import type { AppContext } from "../context";
import { buildContext } from "../context";
import { validateQuery } from "../core/validate";
import type { RouteDef } from "./schema";

function ctx(c: Context): AppContext {
  return buildContext(c.env as AppContext["env"]);
}

export function registerRoutes(app: Hono, routes: RouteDef[]): void {
  for (const route of routes) {
    app.get(route.path, async (c) => {
      const context = ctx(c);
      startTime(c, "upstream");
      const params = validateQuery(c.req.query(), route.query ?? {});
      const data = await route.handler(context, params as Record<string, string>);
      endTime(c, "upstream");
      return c.json({ data });
    });
  }
}