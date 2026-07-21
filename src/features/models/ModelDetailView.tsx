import type { ComponentType } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { BackButton } from "../../shared/components/composite/BackButton";
import { SectionHeader } from "../../shared/components/composite/SectionHeader";
import { ViewLayout } from "../../shared/components/composite/ViewLayout";
import { SuspenseQuery } from "../../shared/components/feedback/SuspenseQuery";
import { NotFound } from "../system/NotFound";

import { MODEL_SOURCES, type ModelSource } from "../../shared/config";
import { useParams } from "react-router-dom";
import { useModelLookup } from "../../shared/hooks/useModelLookup";
import { useSuspenseArtificialRankings, useSuspenseOpenSourceReleases, useSuspenseTtsLeaderboard } from "../../shared/hooks/useApiQuery";
import { ModelDetailContent } from "../../shared/components/composite/ModelDetailContent";
import { OsDetailContent } from "./detail/OsDetailContent";
import { TtsDetailContent } from "./detail/TtsDetailContent";

import { ORDetail } from "./detail/ORDetail";
import { HallDetail } from "./detail/HallDetail";

function useModelSourceParams(): { src: ModelSource | null; decodedId: string } {
  const { source, "*": splat } = useParams<{ source: string; "*": string }>();
  const src = (source && source in MODEL_SOURCES ? source : null) as ModelSource | null;
  const decodedId = splat ? decodeURIComponent(splat) : "";
  return { src, decodedId };
}

function createDetailView<T>(useQuery: () => { data: T[] }, Content: ComponentType<{ model: T }>, ...keys: (keyof T & string)[]): ComponentType<{ decodedId: string }> {
  return function DetailView({ decodedId }: { decodedId: string }) {
    const { data } = useQuery();
    const model = useModelLookup(data, decodedId, ...keys);
    if (!model) return <NotFound />;
    return <Content model={model} />;
  };
}

const AADetail = createDetailView(useSuspenseArtificialRankings, ModelDetailContent, "id", "slug");
const OSDetail = createDetailView(useSuspenseOpenSourceReleases, OsDetailContent, "id");
const TTSDetail = createDetailView(useSuspenseTtsLeaderboard, TtsDetailContent, "id", "name");

const SOURCE_LABELS: Record<ModelSource, string> = {
  aa: "artificialSource",
  or: "openRouterSource",
  os: "openSourceDataSource",
  hall: "hallucinationSource",
  tts: "ttsSource",
};

const SOURCE_COMPONENTS: Record<ModelSource, ComponentType<{ decodedId: string }>> = {
  aa: AADetail,
  or: ORDetail,
  os: OSDetail,
  hall: HallDetail,
  tts: TTSDetail,
};

function ModelDetailContentInner() {
  const { t } = useTranslation();
  const { src, decodedId } = useModelSourceParams();

  if (!src || !decodedId) return <NotFound />;

  const config = MODEL_SOURCES[src];
  const sourceLabel = t(SOURCE_LABELS[src] as Parameters<typeof t>[0]);
  const SourceComponent = SOURCE_COMPONENTS[src];

  return (
    <ViewLayout>
      <BackButton labelKey={config.backLabelKey} to={config.backTo} />
      <SectionHeader title={decodedId.split("/").pop() || decodedId} />
      <p className="text-xs text-text-secondary">{sourceLabel}</p>
      <SourceComponent decodedId={decodedId} />
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
