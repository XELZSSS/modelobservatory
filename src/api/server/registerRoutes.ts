import type { Hono } from "hono";
import type { RouteDef } from "../schema";
import { ValidationError } from "../errors";

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
          const { startTime, endTime } = await import("hono/timing");
          startTime(c, "upstream");
          const data = await get.handler(...args);
          endTime(c, "upstream");
          return c.json({ data });
        });
      }
    }
  }
}
