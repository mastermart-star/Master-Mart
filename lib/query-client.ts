import { environmentManager, QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, keep this above 0 or the client refetches everything
        // immediately after hydration.
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  // environmentManager.isServer() — replaces the old `typeof window` check.
  if (environmentManager.isServer()) return makeQueryClient(); // fresh per request
  return (browserQueryClient ??= makeQueryClient()); // singleton in the browser
}
