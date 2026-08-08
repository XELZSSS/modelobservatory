import type { AppContext } from "../context";
import type { QuerySpec } from "../core/validate";

export interface RouteDef<P extends Record<string, string> = Record<string, string>> {
  path: string;
  query?: { [K in keyof P]: QuerySpec };
  handler(ctx: AppContext, params: P): Promise<unknown>;
}