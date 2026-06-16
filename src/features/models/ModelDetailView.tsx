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

/** Only load data for the relevant source instead of all sources. */
function AADetail({ decodedId }: { decodedId: string }) {
  const { data: aaData } = useSuspenseArtificialRankings();
  const model = aaData.find((m) => m.id === decodedId || m.slug === decodedId);
  return model ? <ModelDetailContent model={model} /> : null;
}

function ORDetail({ decodedId }: { decodedId: string }) {
  const { data: orPayload } = useSuspenseOpenRouterRankings();
  const orData = orPayload?.tokenUsageRankings ?? [];
  const model = orData.find((m) => m.id === decodedId);
  return model ? <OrDetailContent model={model} /> : null;
}

function OSDetail({ decodedId }: { decodedId: string }) {
  const { data: osData } = useSuspenseOpenSourceReleases();
  const model = osData.find((m) => m.id === decodedId);
  return model ? <OsDetailContent model={model} /> : null;
}

function HallDetail({ decodedId }: { decodedId: string }) {
  const { data: aaData } = useSuspenseArtificialRankings();
  const hallucinationRankings = useHallucinationRankings(aaData);
  const entry = hallucinationRankings.find((m) => m.id === decodedId || m.slug === decodedId);
  const aaModel = aaData.find((m) => m.id === decodedId || m.slug === decodedId);
  return entry ? <HallDetailContent model={entry} aaModel={aaModel} /> : null;
}

function TTSDetail({ decodedId }: { decodedId: string }) {
  const { data: ttsData } = useSuspenseTtsLeaderboard();
  const model = ttsData.find((m) => m.id === decodedId || m.name === decodedId);
  return model ? <TtsDetailContent model={model} /> : null;
}

function SourceContent({ src, decodedId }: { src: ModelSource; decodedId: string }) {
  switch (src) {
    case "aa": return <AADetail decodedId={decodedId} />;
    case "or": return <ORDetail decodedId={decodedId} />;
    case "os": return <OSDetail decodedId={decodedId} />;
    case "hall": return <HallDetail decodedId={decodedId} />;
    case "tts": return <TTSDetail decodedId={decodedId} />;
    default: return null;
  }
}

function ModelDetailContentInner() {
  const { t } = useTranslation();
  const { source, "*": splat } = useParams<{ source: string; "*": string }>();

  const src = (source && source in MODEL_SOURCES ? source : null) as ModelSource | null;
  const decodedId = splat ? decodeURIComponent(splat) : "";

  if (!src || !decodedId) return <NotFound />;

  const config = MODEL_SOURCES[src];
  const sourceLabel = t(SOURCE_LABELS[src] as Parameters<typeof t>[0]);

  return (
    <ViewLayout>
      <BackButton labelKey={config.backLabelKey} to={config.backTo} />
      <SectionHeader title={decodedId.split("/").pop() || decodedId} />
      <p className={secondaryTextClass}>{sourceLabel}</p>
      <SourceContent src={src} decodedId={decodedId} />
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
