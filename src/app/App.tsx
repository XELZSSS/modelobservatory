import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "./i18n";
import { AppShell } from "./components/layout/AppShell";
import { Spinner } from "./components/feedback/SuspenseQuery";
import { AppRoutes } from "./routes";
import { useAppStartup } from "./startup";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, refetchOnWindowFocus: false, staleTime: 5 * 60_000 } },
});

export function App() {
  useAppStartup();

  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppShell>
            <Suspense fallback={<Spinner />}>
              <AppRoutes />
            </Suspense>
          </AppShell>
        </BrowserRouter>
      </QueryClientProvider>
    </I18nProvider>
  );
}