import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "./shared/i18n";
import { AppShell } from "./shared/components/layout/AppShell";
import { queryClient } from "./queryClient";
import { AppRoutes } from "./routes";
import { useAppStartup } from "./startup";

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
