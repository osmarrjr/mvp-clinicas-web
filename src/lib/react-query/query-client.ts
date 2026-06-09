import { QueryClient } from "@tanstack/react-query";

const IBGE_STALE_TIME = 1000 * 60 * 60 * 24;

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: IBGE_STALE_TIME,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}
