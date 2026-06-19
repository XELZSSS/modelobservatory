import type { ComponentType } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { BackButton } from "../../shared/components/composite/BackButton";
import { SectionHeader } from "../../shared/components/composite/SectionHeader";
import { ViewLayout } from "../../shared/components/composite/ViewLayout";
import { SuspenseQuery } from "../../shared/components/feedback/SuspenseQuery";
import { NotFound } from "../system/NotFound";
import { secondaryTextClass } from "../../shared/utils/cssConstants";
import { MODEL_SOURCES, type ModelSource } from "../../shared/constants";

import { AADetail } from "./detail/AADetail";
import { ORDetail } from "./detail/ORDetail";
import { OSDetail } from "./detail/OSDetail";
import { HallDetail } from "./detail/HallDetail";
import { TTSDetail } from "./detail/TTSDetail";
import { useModelSourceParams } from "./useModelSourceParams";

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
      <p className={secondaryTextClass}>{sourceLabel}</p>
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
