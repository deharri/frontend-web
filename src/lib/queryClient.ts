import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchInterval: 30_000, // belt-and-braces fallback when SSE isn't connected
      refetchOnWindowFocus: true,
      retry: 1,
    },
    mutations: { retry: 0 },
  },
});
