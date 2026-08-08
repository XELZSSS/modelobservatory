import { lazy, memo, Suspense, useMemo, useState } from "react";

import { useTranslation } from "../../i18n/useTranslation";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { TranslationKey } from "../../../shared/i18n";
import { useSuspenseArtificialRankings, useHallucinationRankings, useOpenSourceModels, useOpenRouterRankings } from "../../api/queries";
import { SuspenseQuery, Spinner } from "../../components/feedback/SuspenseQuery";
import { ArtificialAnalysisView } from "./ArtificialAnalysisView";
import { SectionHeader } from "../../components/composite/SectionHeader";
import { TabContainer, type TabItem } from "../../components/composite/TabContainer";
import { PageContainer, PageHeader } from "../../components/layout/PageContainer";
import type { ArtificialAnalysisModel } from "../../../shared/types";

const HallucinationRankingsView = lazy(() => import("./HallucinationRankingsView").then((m) => ({ default: m.HallucinationRankingsView })));
const OpenSourceRankingsView = lazy(() => import("./OpenSourceRankingsView").then((m) => ({ default: m.OpenSourceRankingsView })));
const OpenRouterRankingsView = lazy(() => import("./OpenRouterRankingsView").then((m) => ({ default: m.OpenRouterRankingsView })));
const TtsView = lazy(() => import("./TtsView").then((m) => ({ default: m.TtsView })));
const ProviderCompareView = lazy(() => import("../compare/ProviderCompareView").then((m) => ({ default: m.ProviderCompareView })));

import { RANKING_TABS, type RankingTabId } from "./constants";

interface RankingsHubProps {
  defaultTab?: number;
}

const TabPanel = memo(function TabPanel({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Spinner />}>{children}</Suspense>;
});

function ActiveTabContent({ activeTabId, artificialRankings }: { activeTabId: RankingTabId; artificialRankings: ArtificialAnalysisModel[] }) {
  const hallucinationRankings = useHallucinationRankings(artificialRankings, activeTabId === "hallucinationRankings");
  const openSourceQ = useOpenSourceModels(activeTabId === "openSourceRankings");
  const orQ = useOpenRouterRankings(activeTabId === "openRouterRankings");

  switch (activeTabId) {
    case "modelRankings":
      return <ArtificialAnalysisView rankings={artificialRankings} />;
    case "openRouterRankings":
      return orQ.data ? (
        <TabPanel>
          <OpenRouterRankingsView data={orQ.data} />
        </TabPanel>
      ) : (
        <Spinner />
      );
    case "openSourceRankings":
      return openSourceQ.data ? (
        <TabPanel>
          <OpenSourceRankingsView rankings={openSourceQ.data ?? []} />
        </TabPanel>
      ) : (
        <Spinner />
      );
    case "hallucinationRankings":
      return (
        <TabPanel>
          <HallucinationRankingsView rankings={hallucinationRankings} />
        </TabPanel>
      );
    case "tts":
      return (
        <TabPanel>
          <TtsView />
        </TabPanel>
      );
    case "providerCompare":
      return (
        <TabPanel>
          <ProviderCompareView />
        </TabPanel>
      );
    default:
      return null;
  }
}

function RankingsContent({ defaultTab }: { defaultTab: number }) {
  const { t } = useTranslation();
  const [activeTabId, setActiveTabId] = useState<RankingTabId>(() => RANKING_TABS[defaultTab] ?? RANKING_TABS[0]);

  const { data: artificialRankings } = useSuspenseArtificialRankings();

  const tabs: TabItem[] = useMemo(() => RANKING_TABS.map((id) => ({ id, label: t(id as TranslationKey) })), [t]);

  return (
    <PageContainer>
      <PageHeader title={t(activeTabId as TranslationKey)} description={t("artificialSource")} />
      <TabContainer tabs={tabs} activeTab={activeTabId} tabSize="md" onTabChange={(tabId) => setActiveTabId(tabId as RankingTabId)}>
        <ActiveTabContent activeTabId={activeTabId} artificialRankings={artificialRankings} />
      </TabContainer>
    </PageContainer>
  );
}

export function RankingsHubView({ defaultTab = 0 }: RankingsHubProps) {
  const { t } = useTranslation();
  useDocumentTitle(t("modelRankings"));
  return (
    <SuspenseQuery>
      <RankingsContent defaultTab={defaultTab} />
    </SuspenseQuery>
  );
}