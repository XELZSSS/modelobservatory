import type { Hono } from "hono";
import { startTime, endTime } from "hono/timing";
import type { RouteDef } from "./schema";

export function registerRoutes(app: Hono, routeArrays: RouteDef[][]): void {
  for (const routes of routeArrays) {
    for (const entry of routes) {
      app.get(entry.path, async (c) => {
        const args: string[] = [];
        for (const p of entry.params) {
          args.push(c.req.query(p) || entry.defaults?.[p] || "");
        }
        startTime(c, "upstream");
        const data = await entry.handler(...args);
        endTime(c, "upstream");
        return c.json({ data });
      });
    }
  }
}
