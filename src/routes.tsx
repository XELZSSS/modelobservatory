import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ErrorBoundary } from "./shared/components/feedback/ErrorBoundary";
import { Spinner } from "./shared/components/feedback/SuspenseQuery";
import { useTranslation } from "./shared/i18n/useTranslation";
import { useSearchStore } from "./shared/stores/searchStore";

const HomeView = lazy(() => import("./features/home/HomeView").then((m) => ({ default: m.HomeView })));
const RankingsHubView = lazy(() => import("./features/rankings/RankingsHubView").then((m) => ({ default: m.RankingsHubView })));

const TAB_INDEX = { modelRankings: 0, openRouterRankings: 1, openSourceRankings: 2, hallucinationRankings: 3, tts: 4 } as const;
const ReleasesView = lazy(() => import("./features/releases/ReleasesView").then((m) => ({ default: m.ReleasesView })));
const StatusView = lazy(() => import("./features/system/StatusView").then((m) => ({ default: m.StatusView })));
const CompareView = lazy(() => import("./features/compare/CompareView").then((m) => ({ default: m.CompareView })));
const PriceCompareView = lazy(() => import("./features/compare/PriceCompareView").then((m) => ({ default: m.PriceCompareView })));
const NewsView = lazy(() => import("./features/news/NewsView").then((m) => ({ default: m.NewsView })));
const ModelDetailView = lazy(() => import("./features/models/ModelDetailView").then((m) => ({ default: m.ModelDetailView })));
const NotFound = lazy(() => import("./features/system/NotFound").then((m) => ({ default: m.NotFound })));

export function AppRoutes() {
  const { t } = useTranslation();
  const location = useLocation();
  const resetSearch = useSearchStore((s) => s.resetSearch);

  useEffect(() => {
    resetSearch();
  }, [location.pathname, resetSearch]);

  return (
    <Suspense fallback={<Spinner />}>
      <ErrorBoundary errorTitle={t("errorBoundaryTitle")} retryLabel={t("errorBoundaryRetry")}>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/models" element={<RankingsHubView defaultTab={0} />} />
          <Route path="/pricing" element={<Navigate to="/models" replace />} />
          <Route path="/releases" element={<ReleasesView defaultMode="feed" />} />
          <Route path="/news" element={<NewsView />} />
          <Route path="/score-release" element={<ReleasesView defaultMode="release-dates" lockedMode />} />
          <Route path="/status" element={<StatusView />} />
          <Route path="/hallucinations" element={<RankingsHubView defaultTab={TAB_INDEX.hallucinationRankings} />} />
          <Route path="/tts" element={<RankingsHubView defaultTab={TAB_INDEX.tts} />} />
          <Route path="/open-source" element={<RankingsHubView defaultTab={TAB_INDEX.openSourceRankings} />} />
          <Route path="/rankings" element={<RankingsHubView defaultTab={0} />} />
          <Route path="/categories/:slug" element={<Navigate to="/rankings" replace />} />
          <Route path="/compare" element={<CompareView />} />
          <Route path="/price-compare" element={<PriceCompareView />} />
          <Route path="/model/:source/*" element={<ModelDetailView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </Suspense>
  );
}
