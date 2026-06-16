import { QueryClient } from "@tanstack/react-query";

const DEFAULT_STALE_TIME = 5 * 60_000;

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, refetchOnWindowFocus: false, staleTime: DEFAULT_STALE_TIME } },
});
