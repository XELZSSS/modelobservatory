/* eslint-disable react-refresh/only-export-components */
import { Plus, Check } from "lucide-react";
import type { DataTableColumn } from "../../shared/components/data/DataTable";
import { Badge } from "../../shared/components/ui/badge";
import { Button } from "../../shared/components/ui/button";
import { ModelDetailContent } from "../../shared/components/composite/ModelDetailContent";
import { ellipsisTextClasses, modelCellClass } from "../../shared/utils/cssConstants";
import { cn } from "../../shared/utils/cn";
import { formatContext, formatScore, formatDollar } from "../../shared/utils/format";
import { calcModelCost } from "../../shared/utils/costCalc";
import type { ArtificialAnalysisModel } from "../../shared/types";
import type { TFunction } from "../../shared/i18n";
import { useTranslation } from "../../shared/i18n/useTranslation";

export function ModelExpandedDetail({ model }: { model: ArtificialAnalysisModel }) {
  return (
    <div className="p-4">
      <ModelDetailContent model={model} />
    </div>
  );
}

function RankingModelCell({
  model,
  isCompared,
  onToggleCompare,
}: {
  model: ArtificialAnalysisModel;
  isCompared: boolean;
  onToggleCompare: (m: ArtificialAnalysisModel) => void;
}) {
  const { t } = useTranslation();
  const metricItems: [string, string][] = [
    [t("intelligenceIndex"), formatScore(t, model.intelligence_index)],
    [t("coding"), formatScore(t, model.coding_index)],
    [t("agentic"), formatScore(t, model.agentic_index)],
  ];
  return (
    <>
      <div className={modelCellClass}>
        <p className="text-sm font-bold break-words min-w-0">{model.name}</p>
        {model.intelligence_index_is_estimated && (
          <Badge variant="outline" className="shrink-0">
            {t("estimated")}
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare(model);
          }}
          className="shrink-0"
        >
          {isCompared ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0 mt-1 md:hidden">
        {metricItems.map(([label, value]) => (
          <div key={label} className="flex items-baseline gap-1 min-w-0">
            <span className="text-xs text-text-tertiary shrink-0">{label}</span>
            <span className="text-xs font-semibold truncate">{value}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function priceCell(get: (m: ArtificialAnalysisModel) => number | null | undefined, t: TFunction) {
  return (m: ArtificialAnalysisModel) => formatDollar(get(m), t);
}

function scoreColumn(
  id: string,
  header: string,
  accessor: (m: ArtificialAnalysisModel) => number | null | undefined,
  t: TFunction,
): DataTableColumn<ArtificialAnalysisModel> {
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

export function buildRankingColumns(
  t: TFunction,
  getModelState: (model: ArtificialAnalysisModel) => { isCompared: boolean },
  toggleCompareModel: (m: ArtificialAnalysisModel) => void,
): DataTableColumn<ArtificialAnalysisModel>[] {
  return [
    {
      id: "model",
      header: t("modelNameOrId"),
      width: "40%",
      cell: (model) => {
        const { isCompared } = getModelState(model);
        return (
          <RankingModelCell
            model={model}
            isCompared={isCompared}
            onToggleCompare={toggleCompareModel}
          />
        );
      },
    },
    {
      id: "creator",
      header: t("creator"),
      accessorFn: (row) => row.model_creators?.name || null,
      hiddenMd: true,
      align: "right",
      cell: (model) => <p className={cn("text-sm", ellipsisTextClasses, "text-right")}>{model.model_creators?.name || t("notAvailable")}</p>,
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
  getModelState: (model: ArtificialAnalysisModel) => { isCompared: boolean },
  toggleCompareModel: (m: ArtificialAnalysisModel) => void,
  calcPrompt: number,
  calcCompletion: number,
): DataTableColumn<ArtificialAnalysisModel>[] {
  return [
    {
      id: "model",
      header: t("modelNameOrId"),
      width: "35%",
      cell: (model) => {
        const { isCompared } = getModelState(model);
        return (
          <div className="flex items-center gap-1 min-w-0">
            <p className="text-sm break-words min-w-0">{model.name || model.slug}</p>
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
          </div>
        );
      },
    },
    {
      id: "provider",
      header: t("provider"),
      accessorFn: (r) => r.model_creators?.name || null,
      sortable: true,
      align: "right",
      hiddenMd: true,
      cell: (model) => <p className={cn("text-sm", ellipsisTextClasses, "text-right")}>{model.model_creators?.name || t("notAvailable")}</p>,
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
      accessorFn: (r) => r.pricing?.blended?.["7_2_1"] ?? null,
      sortable: true,
      align: "right",
      cell: priceCell((m) => m.pricing?.blended?.["7_2_1"], t),
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
