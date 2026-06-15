import { lazy, Suspense, useMemo, useState } from "react";

import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TranslationKey } from "../../shared/i18n";
import { useSuspenseArtificialRankings, useHallucinationRankings, useOpenSourceModels, useOpenRouterRankings } from "../../shared/hooks/useQueries";
import { SuspenseQuery } from "../../shared/components/feedback/SuspenseQuery";

import { ArtificialAnalysisView } from "./ArtificialAnalysisView";
import { SectionHeader } from "../../shared/components/composite/SectionHeader";
import { TabContainer, type TabItem } from "../../shared/components/composite/TabContainer";
import { Spinner } from "../../shared/components/feedback/SuspenseQuery";

const HallucinationRankingsView = lazy(() => import("./HallucinationRankingsView").then((m) => ({ default: m.HallucinationRankingsView })));
const OpenSourceRankingsView = lazy(() => import("./OpenSourceRankingsView").then((m) => ({ default: m.OpenSourceRankingsView })));
const OpenRouterRankingsView = lazy(() => import("./OpenRouterRankingsView").then((m) => ({ default: m.OpenRouterRankingsView })));
const TtsView = lazy(() => import("./TtsView").then((m) => ({ default: m.TtsView })));

interface RankingsHubProps {
  defaultTab?: number;
}

const TAB_IDS = ["modelRankings", "openRouterRankings", "openSourceRankings", "hallucinationRankings", "tts"] as const;

function RankingsContent({ defaultTab }: { defaultTab: number }) {
  const { t } = useTranslation();
  const [activeTabId, setActiveTabId] = useState(() => TAB_IDS[defaultTab] ?? TAB_IDS[0]);
  const { data: artificialRankings } = useSuspenseArtificialRankings();
  const hallucinationRankings = useHallucinationRankings(artificialRankings, activeTabId === "hallucinationRankings");
  const openSourceQ = useOpenSourceModels(activeTabId === "openSourceRankings");
  const orQ = useOpenRouterRankings(activeTabId === "openRouterRankings");

  const tabs: TabItem[] = useMemo(
    () => [
      {
        id: "modelRankings",
        label: t("modelRankings"),
        content: <ArtificialAnalysisView rankings={artificialRankings} />,
      },
      {
        id: "openRouterRankings",
        label: t("openRouterRankings"),
        content: orQ.data ? (
          <Suspense fallback={null}>
            <OpenRouterRankingsView data={orQ.data} />
          </Suspense>
        ) : (
          <Spinner />
        ),
      },
      {
        id: "openSourceRankings",
        label: t("openSourceRankings"),
        content: openSourceQ.data ? (
          <Suspense fallback={null}>
            <OpenSourceRankingsView rankings={openSourceQ.data ?? []} />
          </Suspense>
        ) : (
          <Spinner />
        ),
      },
      {
        id: "hallucinationRankings",
        label: t("hallucinationRankings"),
        content: hallucinationRankings.length > 0 ? (
          <Suspense fallback={null}>
            <HallucinationRankingsView rankings={hallucinationRankings} />
          </Suspense>
        ) : (
          <Spinner />
        ),
      },
      {
        id: "tts",
        label: t("tts"),
        content: (
          <Suspense fallback={<Spinner />}>
            <TtsView />
          </Suspense>
        ),
      },
    ],
    [t, artificialRankings, orQ.data, openSourceQ.data, hallucinationRankings],
  );

  return (
    <>
      <SectionHeader title={t(activeTabId as TranslationKey)} />
      <TabContainer tabs={tabs} defaultTabId={activeTabId} onTabChange={(tabId) => setActiveTabId(tabId as typeof activeTabId)} />
    </>
  );
}

export function RankingsHubView({ defaultTab = 0 }: RankingsHubProps) {
  return (
    <SuspenseQuery>
      <RankingsContent defaultTab={defaultTab} />
    </SuspenseQuery>
  );
}
