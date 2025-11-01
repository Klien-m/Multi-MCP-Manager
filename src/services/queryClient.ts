import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 404 errors or validation errors
        if (error instanceof Error) {
          const status = (error as any).status;
          if (status === 404 || status === 400) {
            return false;
          }
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry on validation errors
        if (error instanceof Error) {
          const status = (error as any).status;
          if (status === 400 || status === 401 || status === 403) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
  },
});