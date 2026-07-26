import { Plus, Check } from "lucide-react";
import type { DataTableColumn } from "../../shared/components/data/DataTable";
import { Badge } from "../../shared/components/ui/badge";
import { TagBadge } from "../../shared/components/ui/tag-badge";
import { Button } from "../../shared/components/ui/button";
import { ModelDetailContent } from "../../shared/components/composite/ModelDetailContent";

import { cn } from "../../shared/utils/cn";
import { formatContext, formatScore, formatDollar } from "../../shared/utils/format";
import { calcModelCost } from "../../shared/utils/math";
import type { ArtificialAnalysisModel } from "../../shared/types";
import type { TFunction } from "../../shared/i18n";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCompareStore } from "../../shared/stores/compareStore";
import { PRICING_BLENDS } from "../../shared/config";

function useIsCompared(model: ArtificialAnalysisModel): boolean {
  return useCompareStore((s) => s.compareIds.includes(model.id || model.slug));
}

function CompareButton({ model }: { model: ArtificialAnalysisModel }) {
  const isCompared = useIsCompared(model);
  const toggleCompareModel = useCompareStore((s) => s.toggleCompareModel);
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.stopPropagation();
        toggleCompareModel(model);
      }}
      className="shrink-0"
    >
      {isCompared ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
    </Button>
  );
}

export function ModelExpandedDetail({ model }: { model: ArtificialAnalysisModel }) {
  return (
    <div className="p-4">
      <ModelDetailContent model={model} />
    </div>
  );
}

function RankingModelCell({ model }: { model: ArtificialAnalysisModel }) {
  const { t } = useTranslation();
  const metricItems: [string, string][] = [
    [t("intelligenceIndex"), formatScore(t, model.intelligence_index)],
    [t("coding"), formatScore(t, model.coding_index)],
    [t("agentic"), formatScore(t, model.agentic_index)],
  ];
  return (
    <>
      <div className="flex items-center gap-2 min-w-0">
        <p className="text-sm font-bold break-words min-w-0">{model.name}</p>
        {model.intelligence_index_is_estimated && (
          <Badge variant="outline" className="shrink-0">
            {t("estimated")}
          </Badge>
        )}
        <CompareButton model={model} />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0 mt-1 md:hidden">
        {metricItems.map(([label, value]) => (
          <div key={label} className="flex items-baseline gap-1 min-w-0">
            <span className="text-xs text-text-tertiary shrink-0">{label}</span>
            <span className="text-xs font-semibold truncate">{value}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1 mt-1 md:hidden">
        {model.model_creators?.name && <TagBadge>{model.model_creators.name}</TagBadge>}
        <TagBadge>
          {t("contextWindow")}: {formatContext(t, model)}
        </TagBadge>
      </div>
    </>
  );
}

function priceCell(get: (m: ArtificialAnalysisModel) => number | null | undefined, t: TFunction) {
  return (m: ArtificialAnalysisModel) => formatDollar(get(m), t);
}

function scoreColumn(id: string, header: string, accessor: (m: ArtificialAnalysisModel) => number | null | undefined, t: TFunction): DataTableColumn<ArtificialAnalysisModel> {
  return {
    id,
    header,
    accessorFn: (row) => accessor(row),
    sortable: true,
    align: "right",
    hiddenMd: true,
    cell: (model) => formatScore(t, accessor(model)),
  };
}

export function buildRankingColumns(t: TFunction): DataTableColumn<ArtificialAnalysisModel>[] {
  return [
    {
      id: "model",
      header: t("modelNameOrId"),
      width: "40%",
      cell: (model) => <RankingModelCell model={model} />,
    },
    {
      id: "creator",
      header: t("creator"),
      accessorFn: (row) => row.model_creators?.name || null,
      hiddenMd: true,
      align: "right",
      cell: (model) => <p className={cn("text-sm", "overflow-hidden text-ellipsis whitespace-nowrap", "text-right")}>{model.model_creators?.name || t("notAvailable")}</p>,
    },
    scoreColumn("intelligence", t("intelligenceIndex"), (m) => m.intelligence_index, t),
    scoreColumn("coding", t("coding"), (m) => m.coding_index, t),
    scoreColumn("agentic", t("agentic"), (m) => m.agentic_index, t),
    {
      id: "contextWindow",
      header: t("contextWindow"),
      accessorFn: (row) => row.context_window_tokens,
      sortable: true,
      align: "right",
      hiddenMd: true,
      cell: (model) => formatContext(t, model),
    },
  ];
}

export function buildPricingColumns(
  t: TFunction,
  calcPrompt: number,
  calcCompletion: number,
): DataTableColumn<ArtificialAnalysisModel>[] {
  return [
    {
      id: "model",
      header: t("modelNameOrId"),
      width: "35%",
      cell: (model) => (
        <>
          <div className="flex items-center gap-1 min-w-0">
            <p className="text-sm break-words min-w-0">{model.name || model.slug}</p>
            <CompareButton model={model} />
          </div>
          <div className="flex flex-wrap gap-1 mt-1 md:hidden">
            {model.model_creators?.name && <TagBadge>{model.model_creators.name}</TagBadge>}
            {model.pricing?.cache_hit != null && (
              <TagBadge>
                {t("cacheHitPrice")}: {formatDollar(model.pricing.cache_hit, t)}
              </TagBadge>
            )}
            <TagBadge>
              {t("monthlyCost")}: {formatDollar(calcModelCost(model, calcPrompt, calcCompletion), t)}
            </TagBadge>
          </div>
        </>
      ),
    },
    {
      id: "provider",
      header: t("provider"),
      accessorFn: (r) => r.model_creators?.name || null,
      sortable: true,
      align: "right",
      hiddenMd: true,
      cell: (model) => <p className={cn("text-sm", "overflow-hidden text-ellipsis whitespace-nowrap", "text-right")}>{model.model_creators?.name || t("notAvailable")}</p>,
    },
    {
      id: "context",
      header: t("contextTokens"),
      accessorFn: (r) => r.context_window_tokens,
      sortable: true,
      align: "right",
      cell: (model) => formatContext(t, model),
    },
    {
      id: "cacheHitPrice",
      header: t("cacheHitPrice"),
      accessorFn: (r) => r.pricing?.cache_hit ?? null,
      sortable: true,
      align: "right",
      hiddenMd: true,
      cell: priceCell((m) => m.pricing?.cache_hit, t),
    },
    {
      id: "promptPrice",
      header: t("promptPrice"),
      accessorFn: (r) => r.pricing?.input ?? null,
      sortable: true,
      align: "right",
      cell: priceCell((m) => m.pricing?.input, t),
    },
    {
      id: "completionPrice",
      header: t("completionPrice"),
      accessorFn: (r) => r.pricing?.output ?? null,
      sortable: true,
      align: "right",
      cell: priceCell((m) => m.pricing?.output, t),
    },
    {
      id: "blendedPrice",
      header: t("blendedPrice"),
      accessorFn: (r) => r.pricing?.blended?.[PRICING_BLENDS.INPUT_7_OUTPUT_2_1] ?? null,
      sortable: true,
      align: "right",
      cell: priceCell((m) => m.pricing?.blended?.[PRICING_BLENDS.INPUT_7_OUTPUT_2_1], t),
    },
    {
      id: "monthlyCost",
      header: t("monthlyCost"),
      sortable: true,
      align: "right",
      hiddenMd: true,
      cell: (model) => {
        const cost = calcModelCost(model, calcPrompt, calcCompletion);
        return formatDollar(cost, t);
      },
    },
  ];
}