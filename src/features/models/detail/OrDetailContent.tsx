import { StatCard } from "../../../shared/components/composite/StatCard";
import { InfoCard } from "../../../shared/components/composite/InfoCard";
import { InfoRow } from "../../../shared/components/composite/InfoRow";
import { Badge } from "../../../shared/components/ui/badge";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatShortNumber, formatTrend, getRecommendation, categoryLabel } from "../../../shared/utils/format";
import type { OpenRouterRankEntry } from "../../../shared/types";

export function OrDetailContent({ model }: { model: OpenRouterRankEntry }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
        <StatCard label={t("creator")} value={model.creator} />
        <StatCard label={t("inputTokens")} value={formatShortNumber(model.promptTokens ?? 0)} />
        <StatCard label={t("outputTokens")} value={formatShortNumber(model.completionTokens ?? 0)} />
        {model.reasoningTokens ? <StatCard label={t("reasoningTokens")} value={formatShortNumber(model.reasoningTokens)} /> : <StatCard label={t("category")} value={categoryLabel(model.category, t)} />}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
        <InfoCard title={t("modelInfo")}>
          <InfoRow compact label={t("apiModelId")} value={<code className="font-mono text-xs bg-bg-secondary px-1 rounded">{model.id}</code>} />
          <InfoRow compact label={t("category")} value={categoryLabel(model.category, t)} />
          <InfoRow compact label={t("trend")} value={formatTrend(model.change, t)} />
          <InfoRow compact label={t("totalTokens")} value={formatShortNumber(model.totalTokens ?? 0)} />
        </InfoCard>
        <InfoCard title={t("pricing")}>
          <InfoRow compact label={t("promptPrice")} value={model.pricing ? `$${model.pricing.prompt.toFixed(2)}` : t("notAvailable")} />
          <InfoRow compact label={t("completionPrice")} value={model.pricing ? `$${model.pricing.completion.toFixed(2)}` : t("notAvailable")} />
        </InfoCard>
      </div>
      <InfoCard title={t("techSelectionAdvice")}>
        <p className="text-xs text-text-secondary leading-relaxed">{getRecommendation(model.id, t)}</p>
      </InfoCard>
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline">{model.variant || model.category}</Badge>
        {model.isFree && <Badge variant="outline" className="text-green-500">Free</Badge>}
      </div>
    </div>
  );
}
