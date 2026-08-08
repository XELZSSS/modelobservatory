import { StatCard } from "../../../components/composite/StatCard";
import { InfoCard } from "../../../components/composite/InfoCard";
import { InfoRow } from "../../../components/composite/InfoRow";
import { Badge } from "../../../components/ui/badge";
import { useTranslation } from "../../../i18n/useTranslation";
import { formatShortNumber, formatTrend, formatDollar, categoryLabel } from "../../../../shared/utils/format";
import { getRecommendation } from "../../../../shared/config/recommendations";
import { useSuspenseOpenRouterRankings } from "../../../api/queries";
import { findModel } from "../../../../shared/utils/id";
import { NotFound } from "../../system/NotFound";
import { DetailLayout, StatGrid, InfoGrid } from "../../../components/composite/DetailLayout";
import type { OpenRouterRankEntry } from "../../../../shared/types";

function OrDetailInner({ model }: { model: OpenRouterRankEntry }) {
  const { t, lang } = useTranslation();
  return (
    <DetailLayout>
      <StatGrid columns={4}>
        <StatCard label={t("creator")} value={model.creator} />
        <StatCard label={t("inputTokens")} value={formatShortNumber(model.promptTokens ?? 0)} />
        <StatCard label={t("outputTokens")} value={formatShortNumber(model.completionTokens ?? 0)} />
        {model.reasoningTokens ? (
          <StatCard label={t("reasoningTokens")} value={formatShortNumber(model.reasoningTokens)} />
        ) : (
          <StatCard label={t("category")} value={categoryLabel(model.category, t)} />
        )}
      </StatGrid>
      <InfoGrid>
        <InfoCard title={t("modelInfo")}>
          <InfoRow compact label={t("apiModelId")} value={<code className="font-mono text-xs bg-bg-secondary px-1 rounded">{model.id}</code>} />
          <InfoRow compact label={t("category")} value={categoryLabel(model.category, t)} />
          <InfoRow compact label={t("trend")} value={formatTrend(model.change, t)} />
          <InfoRow compact label={t("totalTokens")} value={formatShortNumber(model.totalTokens ?? 0)} />
        </InfoCard>
        <InfoCard title={t("pricing")}>
          <InfoRow compact label={t("promptPrice")} value={formatDollar(model.pricing?.prompt, t)} />
          <InfoRow compact label={t("completionPrice")} value={formatDollar(model.pricing?.completion, t)} />
        </InfoCard>
      </InfoGrid>
      <InfoCard title={t("techSelectionAdvice")}>
        <p className="text-xs text-text-secondary leading-relaxed">{getRecommendation(model.id, lang)}</p>
      </InfoCard>
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline">{model.variant || model.category}</Badge>
        {model.isFree && (
          <Badge variant="outline" className="text-success">
            {t("free")}
          </Badge>
        )}
      </div>
    </DetailLayout>
  );
}

export function OrDetail({ decodedId }: { decodedId: string }) {
  const { data: orPayload } = useSuspenseOpenRouterRankings();
  const orData = orPayload?.tokenUsageRankings ?? [];
  const model = findModel(orData, decodedId, "id");
  if (!model) return <NotFound />;
  return <OrDetailInner model={model} />;
}