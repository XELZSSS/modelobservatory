export interface GetRouteDef {
  path: string;
  params: readonly string[];
  defaults?: Record<string, string>;
  handler: (...args: string[]) => Promise<unknown>;
}

export type RouteDef = GetRouteDef;
