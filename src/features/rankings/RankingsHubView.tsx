import { lazy, memo, Suspense, useMemo, useState } from "react";

import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle";
import type { TranslationKey } from "../../shared/i18n";
import { useSuspenseArtificialRankings, useHallucinationRankings, useOpenSourceModels, useOpenRouterRankings } from "../../shared/hooks/useApiQuery";
import { SuspenseQuery, Spinner } from "../../shared/components/feedback/SuspenseQuery";
import { ArtificialAnalysisView } from "./ArtificialAnalysisView";
import { SectionHeader } from "../../shared/components/composite/SectionHeader";
import { TabContainer, type TabItem } from "../../shared/components/composite/TabContainer";
import { PageContainer, PageHeader } from "../../shared/components/layout/PageContainer";

const HallucinationRankingsView = lazy(() => import("./HallucinationRankingsView").then((m) => ({ default: m.HallucinationRankingsView })));
const OpenSourceRankingsView = lazy(() => import("./OpenSourceRankingsView").then((m) => ({ default: m.OpenSourceRankingsView })));
const OpenRouterRankingsView = lazy(() => import("./OpenRouterRankingsView").then((m) => ({ default: m.OpenRouterRankingsView })));
const TtsView = lazy(() => import("./TtsView").then((m) => ({ default: m.TtsView })));
const ProviderCompareView = lazy(() => import("../compare/ProviderCompareView").then((m) => ({ default: m.ProviderCompareView })));

interface RankingsHubProps {
  defaultTab?: number;
}

const TAB_IDS = ["modelRankings", "openRouterRankings", "openSourceRankings", "hallucinationRankings", "tts", "providerCompare"] as const;
type TabId = (typeof TAB_IDS)[number];

const TabPanel = memo(function TabPanel({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Spinner />}>{children}</Suspense>;
});

function ActiveTabContent({ activeTabId, artificialRankings }: { activeTabId: TabId; artificialRankings: import("../../shared/types").ArtificialAnalysisModel[] }) {
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
  const [activeTabId, setActiveTabId] = useState<TabId>(() => TAB_IDS[defaultTab] ?? TAB_IDS[0]);

  const { data: artificialRankings } = useSuspenseArtificialRankings();

  const tabs: TabItem[] = useMemo(() => TAB_IDS.map((id) => ({ id, label: t(id as TranslationKey) })), [t]);

  return (
    <PageContainer>
      <PageHeader title={t(activeTabId as TranslationKey)} description={t("artificialSource")} />
      <TabContainer tabs={tabs} activeTab={activeTabId} tabSize="md" onTabChange={(tabId) => setActiveTabId(tabId as TabId)}>
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
