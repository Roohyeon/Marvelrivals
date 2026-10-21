"use client";

import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: "static", retry: 1, refetchOnWindowFocus: false } },
  });
}

let browserQueryClient: QueryClient | undefined;

/** 서버에서는 요청마다 새로, 브라우저에서는 하나만 만들어 재사용 */
function getQueryClient() {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
