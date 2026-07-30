export interface GetRouteDef {
  path: string;
  params: readonly string[];
  defaults?: Record<string, string>;
  handler: (...args: string[]) => Promise<unknown>;
  method?: "GET";
}

export interface PostRouteDef {
  path: string;
  handler: (body: unknown) => Promise<unknown>;
  method: "POST";
}

export type RouteDef = GetRouteDef | PostRouteDef;
