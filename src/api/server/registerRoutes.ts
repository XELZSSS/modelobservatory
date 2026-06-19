import type { Hono } from "hono";
import { startTime, endTime } from "hono/timing";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { RouteDef } from "../schema";
import { ApiError, ValidationError } from "../errors";

export function registerRoutes(app: Hono, routeArrays: RouteDef[][]): void {
  for (const routes of routeArrays) {
    for (const entry of routes) {
      if (entry.method === "POST") {
        const post = entry;
        app.post(post.path, async (c) => {
          let body: unknown;
          try {
            body = await c.req.json();
          } catch {
            throw new ValidationError("Invalid JSON body");
          }
          const data = await post.handler(body);
          return c.json({ data });
        });
      } else {
        const get = entry;
        app.get(get.path, async (c) => {
          const args: string[] = [];
          for (const p of get.params) {
            args.push(c.req.query(p) ?? get.defaults?.[p] ?? "");
          }
          startTime(c, "upstream");
          const data = await get.handler(...args);
          endTime(c, "upstream");
          return c.json({ data });
        });
      }
    }
  }

  app.onError((err, c) => {
    if (err instanceof ApiError) {
      const status = (err.status >= 100 && err.status < 600 ? err.status : 500) as ContentfulStatusCode;
      return c.json({ error: { code: status, message: err.message } }, status);
    }
    console.error("[unhandled]", err);
    return c.json({ error: { code: 500, message: "Internal server error" } }, 500);
  });
}
