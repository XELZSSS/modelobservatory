import { StatCard } from "../../../components/composite/StatCard";
import { InfoCard } from "../../../components/composite/InfoCard";
import { InfoRow } from "../../../components/composite/InfoRow";
import { useTranslation } from "../../../i18n/useTranslation";
import { ModelDetailContent } from "../../../components/composite/ModelDetailContent";
import { useSuspenseArtificialRankings, useHallucinationRankings } from "../../../api/queries";
import { findModel } from "../../../../shared/utils/id";
import { NotFound } from "../../system/NotFound";
import { DetailLayout, StatGrid } from "../../../components/composite/DetailLayout";
import type { HallucinationRankingEntry, ArtificialAnalysisModel } from "../../../../shared/types";

function HallDetailContent({ model, aaModel }: { model: HallucinationRankingEntry; aaModel?: ArtificialAnalysisModel }) {
  const { t } = useTranslation();
  return (
    <DetailLayout>
      <StatGrid columns={4}>
        <StatCard label={t("omniscienceIndex")} value={model.omniscienceIndex.toFixed(1)} />
        <StatCard label={t("accuracy")} value={`${model.accuracy.toFixed(1)}%`} />
        <StatCard label={t("hallucinationRate")} value={`${model.hallucinationRate.toFixed(1)}%`} />
        <StatCard label={t("attemptRate")} value={`${model.attemptRate.toFixed(1)}%`} />
      </StatGrid>
      <InfoCard title={t("modelInfo")}>
        <InfoRow compact label={t("modelNameOrId")} value={model.model} />
        <InfoRow compact label={t("slug")} value={model.slug} />
        {aaModel?.model_creators?.name && <InfoRow compact label={t("creator")} value={aaModel.model_creators.name} />}
        {aaModel?.release_date && <InfoRow compact label={t("releaseDate")} value={aaModel.release_date} />}
      </InfoCard>
      {aaModel && (
        <>
          <p className="text-xs font-semibold text-text-secondary mt-2">{t("modelDetail")}</p>
          <ModelDetailContent model={aaModel} />
        </>
      )}
    </DetailLayout>
  );
}

export function HallDetail({ decodedId }: { decodedId: string }) {
  const { data: aaData } = useSuspenseArtificialRankings();
  const hallucinationRankings = useHallucinationRankings(aaData);
  const entry = findModel(hallucinationRankings, decodedId, "id", "slug");
  const aaModel = findModel(aaData, decodedId, "id", "slug");
  if (!entry) return <NotFound />;
  return <HallDetailContent model={entry} aaModel={aaModel} />;
}