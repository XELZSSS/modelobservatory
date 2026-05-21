import { useCallback, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { X, ArrowLeftRight } from "lucide-react";
import type { DataTableColumn } from "../../shared/components/data/DataTable";
import { Badge } from "../../shared/components/ui/badge";
import { Button } from "../../shared/components/ui/button";
import { Card } from "../../shared/components/ui/card";
import { FilterChip } from "../../shared/components/composite/TabButton";
import { Input } from "../../shared/components/ui/input";
import { MAX_COMPARE_MODELS } from "../../shared/constants";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSearchStore } from "../../shared/stores/searchStore";
import { useCompareStore } from "../../shared/stores/compareStore";
import { DataTable } from "../../shared/components/data/DataTable";
import { secondaryTextClass, textSecondaryClass } from "../../shared/utils/cssConstants";
import { calcModelCost } from "../../shared/utils/costCalc";
import { modelId } from "../../shared/utils/modelId";

import type { ArtificialAnalysisModel } from "../../shared/types";
import { buildRankingColumns, buildPricingColumns, ModelExpandedDetail } from "./aaColumns";

type ViewMode = "rankings" | "pricing";

const REASONING_KEYWORDS = /\b(reasoning|thinking)\b/i;
const REASONING_PREFIXES = /^(o[134]|gpt-5)/i;

function isReasoningModel(model: ArtificialAnalysisModel) {
  return REASONING_KEYWORDS.test(model.name) || REASONING_PREFIXES.test(model.name);
}

export function ArtificialAnalysisView({ rankings }: { rankings: ArtificialAnalysisModel[] }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const searchTerm = useSearchStore((s) => s.searchTerm);
  const compareIds = useCompareStore((s) => s.compareIds);
  const toggleCompareModel = useCompareStore((s) => s.toggleCompareModel);
  const clearCompare = useCompareStore((s) => s.clearCompare);
  const [reasoningFilter, setReasoningFilter] = useState<"all" | "reasoning" | "non-reasoning">("all");
  const location = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>((location.state as { viewMode?: ViewMode })?.viewMode ?? "rankings");
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [promptTokens, setPromptTokens] = useState("100000");
  const [completionTokens, setCompletionTokens] = useState("30000");

  const calcPrompt = Number(promptTokens) || 0;
  const calcCompletion = Number(completionTokens) || 0;

  const getModelState = useCallback(
    (model: ArtificialAnalysisModel) => {
      const key = model.id || model.slug;
      const isCompared = compareIds.includes(key);
      return { isCompared, compareDisabled: !isCompared && compareIds.length >= MAX_COMPARE_MODELS };
    },
    [compareIds],
  );

  const filteredRankings = useMemo(() => {
    const valid = rankings.filter((model) => {
      if (viewMode === "rankings") return typeof model.intelligence_index === "number" && Number.isFinite(model.intelligence_index);
      return model.pricing?.input != null || model.pricing?.output != null || model.pricing?.cache_hit != null || model.pricing?.blended?.["7_2_1"] != null;
    });
    let filtered = valid;
    if (reasoningFilter === "reasoning") filtered = valid.filter(isReasoningModel);
    else if (reasoningFilter === "non-reasoning") filtered = valid.filter((m) => !isReasoningModel(m));
    const term = searchTerm.trim().toLowerCase();
    if (term)
      filtered = filtered.filter((m) => m.name.toLowerCase().includes(term) || m.slug.toLowerCase().includes(term) || (m.model_creators?.name || "").toLowerCase().includes(term));
    return filtered;
  }, [rankings, reasoningFilter, searchTerm, viewMode]);

  const rankMap = useMemo(() => {
    const map = new Map<string, number>();
    filteredRankings.forEach((m, i) => map.set(modelId(m), i + 1));
    return map;
  }, [filteredRankings]);

  const canOpenCompare = compareIds.length >= 2;

  const avgCost = useMemo(() => {
    let total = 0;
    let count = 0;
    for (const m of filteredRankings) {
      const cost = calcModelCost(m, calcPrompt, calcCompletion);
      if (cost != null) {
        total += cost;
        count++;
      }
    }
    return count > 0 ? total / count : 0;
  }, [filteredRankings, calcPrompt, calcCompletion]);

  const modelColumns = useMemo<DataTableColumn<ArtificialAnalysisModel>[]>(() => {
    return viewMode === "pricing"
      ? buildPricingColumns(t, getModelState, toggleCompareModel, calcPrompt, calcCompletion)
      : buildRankingColumns(t, getModelState, toggleCompareModel, rankMap, modelId);
  }, [getModelState, toggleCompareModel, t, viewMode, calcPrompt, calcCompletion, rankMap]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end min-w-0">
        <div className="flex-1 min-w-0">
          <p className={secondaryTextClass}>{t("artificialSource")}</p>
          <div className="flex flex-row gap-1 mt-1 flex-wrap items-center">
            <FilterChip
              active={viewMode === "rankings"}
              onClick={() => {
                setViewMode("rankings");
                setExpandedRowId(null);
              }}
            >
              {t("modelRankings")}
            </FilterChip>
            <FilterChip
              active={viewMode === "pricing"}
              onClick={() => {
                setViewMode("pricing");
                setExpandedRowId(null);
              }}
            >
              {t("pricing")}
            </FilterChip>
            <span className="w-[1px] h-4 bg-border mx-1" />
            {[
              { key: "all" as const, label: t("all") },
              { key: "reasoning" as const, label: t("reasoning") },
              { key: "non-reasoning" as const, label: t("nonReasoning") },
            ].map((tab) => (
              <FilterChip key={tab.key} active={reasoningFilter === tab.key} onClick={() => setReasoningFilter(tab.key)}>
                {tab.label}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>

      {viewMode === "pricing" && (
        <div className="flex gap-2 flex-wrap items-center p-2 rounded-md border border-border">
          <Input
            type="number"
            value={promptTokens}
            onChange={(e) => setPromptTokens(e.target.value)}
            className="w-full sm:w-44 border-border"
            placeholder={t("monthlyPromptTokens")}
          />
          <Input
            type="number"
            value={completionTokens}
            onChange={(e) => setCompletionTokens(e.target.value)}
            className="w-full sm:w-44 border-border"
            placeholder={t("monthlyCompletionTokens")}
          />
          <div className="flex items-center">
            <span className={textSecondaryClass}>{t("estimatedMonthlyCost")}: </span>
            <span className="text-base font-bold ml-1">${avgCost.toFixed(2)}</span>
            <span className={`${secondaryTextClass} ml-[2px]`}>{t("perModelAvg")}</span>
          </div>
        </div>
      )}

      {compareIds.length > 0 &&
        (() => {
          const compareModels = compareIds.map((id) => rankings.find((m) => (m.id || m.slug) === id)).filter((m): m is ArtificialAnalysisModel => !!m);
          return (
            <Card className="p-3">
              <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
                <div className="flex flex-row gap-1.5 items-center flex-wrap">
                  <p className={textSecondaryClass}>{t("selectedCount", { count: compareIds.length })}</p>
                  {compareModels.map((model) => (
                    <Badge key={model.id || model.slug} variant="outline" className="cursor-pointer" onClick={() => toggleCompareModel(model)}>
                      {model.short_name || model.name}
                      <X className="size-3 ml-0.5" />
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-row gap-2">
                  <Button size="sm" variant="outline" onClick={clearCompare}>
                    <X className="size-4" />
                    {t("clear")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate(viewMode === "pricing" ? "/price-compare" : "/compare")} disabled={!canOpenCompare}>
                    <ArrowLeftRight className="size-4" />
                    {t("compareSelected")}
                  </Button>
                </div>
              </div>
              {!canOpenCompare && <p className={secondaryTextClass}>{t("compareLimit")}</p>}
            </Card>
          );
        })()}

      <DataTable
        data={filteredRankings}
        columns={modelColumns}
        getRowId={modelId}
        expandedRowId={expandedRowId}
        onToggleExpand={setExpandedRowId}
        renderExpandedRow={(model) => <ModelExpandedDetail model={model} />}
      />
    </div>
  );
}
