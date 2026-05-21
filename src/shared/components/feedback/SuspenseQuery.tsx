import { Suspense, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { ErrorBoundary } from "./ErrorBoundary";
import { useTranslation } from "../../i18n/useTranslation";

export function Spinner() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="size-6 animate-spin rounded-full border-2 border-border border-t-text-secondary" />
    </div>
  );
}

interface SuspenseQueryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function SuspenseQuery({ children, fallback }: SuspenseQueryProps) {
  const { t } = useTranslation();
  const location = useLocation();
  // Keying the ErrorBoundary on pathname forces a full remount when the route changes.
  // Otherwise the boundary instance stays mounted across navigation, so once a page
  // errors, `hasError` persists and every subsequent page renders the error fallback.
  return (
    <ErrorBoundary key={location.pathname} errorTitle={t("errorBoundaryTitle")} retryLabel={t("errorBoundaryRetry")}>
      <Suspense fallback={fallback ?? <Spinner />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
