import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "./shared/i18n";
import { AppShell } from "./shared/components/layout/AppShell";
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
            <AppRoutes />
          </AppShell>
        </BrowserRouter>
      </QueryClientProvider>
    </I18nProvider>
  );
}
