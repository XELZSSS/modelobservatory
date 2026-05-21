import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { BackButton } from "../../shared/components/composite/BackButton";
import { SectionHeader } from "../../shared/components/composite/SectionHeader";
import { ViewLayout } from "../../shared/components/composite/ViewLayout";
import { SuspenseQuery } from "../../shared/components/feedback/SuspenseQuery";
import { NotFound } from "../system/NotFound";
import { secondaryTextClass } from "../../shared/utils/cssConstants";
import { MODEL_SOURCES, type ModelSource } from "../../shared/constants";
import {
  useSuspenseArtificialRankings,
  useSuspenseOpenSourceReleases,
  useSuspenseOpenRouterRankings,
  useHallucinationRankings,
  useSuspenseTtsLeaderboard,
} from "../../shared/hooks/useQueries";

import { ModelDetailContent } from "../../shared/components/composite/ModelDetailContent";
import { OrDetailContent } from "./detail/OrDetailContent";
import { OsDetailContent } from "./detail/OsDetailContent";
import { HallDetailContent } from "./detail/HallDetailContent";
import { TtsDetailContent } from "./detail/TtsDetailContent";

const SOURCE_LABELS: Record<ModelSource, string> = {
  aa: "artificialSource",
  or: "openRouterSource",
  os: "openSourceDataSource",
  hall: "hallucinationSource",
  tts: "ttsSource",
};

function ModelDetailContentInner() {
  const { t } = useTranslation();
  const { source, "*": splat } = useParams<{ source: string; "*": string }>();

  const { data: aaData } = useSuspenseArtificialRankings();
  const { data: osData } = useSuspenseOpenSourceReleases();
  const { data: orPayload } = useSuspenseOpenRouterRankings();
  const { data: ttsData } = useSuspenseTtsLeaderboard();
  const hallucinationRankings = useHallucinationRankings(aaData);

  const src = (source && source in MODEL_SOURCES ? source : null) as ModelSource | null;
  const decodedId = splat ? decodeURIComponent(splat) : "";

  const content = useMemo(() => {
    if (!src || !decodedId) return null;
    switch (src) {
      case "aa": {
        const model = aaData.find((m) => m.id === decodedId || m.slug === decodedId);
        return model ? <ModelDetailContent model={model} /> : null;
      }
      case "or": {
        const orData = orPayload?.tokenUsageRankings ?? [];
        const model = orData.find((m) => m.id === decodedId);
        return model ? <OrDetailContent model={model} /> : null;
      }
      case "os": {
        const model = osData.find((m) => m.id === decodedId);
        return model ? <OsDetailContent model={model} /> : null;
      }
      case "hall": {
        const entry = hallucinationRankings.find((m) => m.id === decodedId || m.slug === decodedId);
        const aaModel = aaData.find((m) => m.id === decodedId || m.slug === decodedId);
        return entry ? <HallDetailContent model={entry} aaModel={aaModel} /> : null;
      }
      case "tts": {
        const model = ttsData.find((m) => m.id === decodedId || m.name === decodedId);
        return model ? <TtsDetailContent model={model} /> : null;
      }
      default:
        return null;
    }
  }, [src, decodedId, aaData, osData, orPayload, ttsData, hallucinationRankings]);

  if (!src || !decodedId) return <NotFound />;

  const config = MODEL_SOURCES[src];

  if (!content) {
    return (
      <div className="flex flex-col gap-3.5">
        <BackButton labelKey={config.backLabelKey} to={config.backTo} />
        <p className={secondaryTextClass}>{t("notFound")}</p>
      </div>
    );
  }

  const sourceLabel = t(SOURCE_LABELS[src] as Parameters<typeof t>[0]);

  return (
    <ViewLayout>
      <BackButton labelKey={config.backLabelKey} to={config.backTo} />
      <SectionHeader title={decodedId.split("/").pop() || decodedId} />
      <p className={secondaryTextClass}>{sourceLabel}</p>
      {content}
    </ViewLayout>
  );
}

export function ModelDetailView() {
  return (
    <SuspenseQuery>
      <ModelDetailContentInner />
    </SuspenseQuery>
  );
}
