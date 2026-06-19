import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,       // 5 min — avoid refetching on every mount
        gcTime: 10 * 60 * 1000,          // 10 min — keep unused cache before GC
        retry: 1,                         // 1 retry on failure (network resilience)
        refetchOnWindowFocus: false,      // Don't hammer API on tab switch
        refetchOnReconnect: true,         // Refetch when network comes back
        throwOnError: false,              // Don't throw — let components handle errors
      },
      mutations: {
        retry: 0,                         // Don't retry mutations (prevents double-writes)
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 5 * 60 * 1000,
  });

  return router;
};
