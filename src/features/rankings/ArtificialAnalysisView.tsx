import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { DataTableColumn } from "../../shared/components/data/DataTable";
import { DataTable } from "../../shared/components/data/DataTable";
import { MAX_COMPARE_MODELS } from "../../shared/constants";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useRankMap } from "../../shared/hooks/useRankMap";
import { useCompareStore } from "../../shared/stores/compareStore";
import { modelId } from "../../shared/utils/modelId";

import type { ArtificialAnalysisModel } from "../../shared/types";
import { buildRankingColumns, buildPricingColumns, ModelExpandedDetail } from "./aaColumns";

import { useAARankingFilters } from "./aa/useAARankingFilters";
import { useCostEstimator } from "./aa/useCostEstimator";
import { FilterToolbar } from "./aa/FilterToolbar";
import { PricingInputs } from "./aa/PricingInputs";
import { CompareBar } from "./aa/CompareBar";

export function ArtificialAnalysisView({ rankings }: { rankings: ArtificialAnalysisModel[] }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const compareIds = useCompareStore((s) => s.compareIds);
  const toggleCompareModel = useCompareStore((s) => s.toggleCompareModel);
  const clearCompare = useCompareStore((s) => s.clearCompare);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const { filtered, viewMode, setViewMode, reasoningFilter, setReasoningFilter, modalityFilter, setModalityFilter } = useAARankingFilters(rankings);
  const { promptTokens, setPromptTokens, completionTokens, setCompletionTokens, calcPrompt, calcCompletion, avgCost } = useCostEstimator(filtered);
  const rankMap = useRankMap(filtered, modelId);

  const getModelState = useCallback(
    (model: ArtificialAnalysisModel) => {
      const key = model.id || model.slug;
      const isCompared = compareIds.includes(key);
      return { isCompared, compareDisabled: !isCompared && compareIds.length >= MAX_COMPARE_MODELS };
    },
    [compareIds],
  );

  const modelColumns = useMemo<DataTableColumn<ArtificialAnalysisModel>[]>(() => {
    return viewMode === "pricing"
      ? buildPricingColumns(t, getModelState, toggleCompareModel, calcPrompt, calcCompletion)
      : buildRankingColumns(t, getModelState, toggleCompareModel, rankMap, modelId);
  }, [getModelState, toggleCompareModel, t, viewMode, calcPrompt, calcCompletion, rankMap]);

  return (
    <div className="flex flex-col gap-4">
      <FilterToolbar
        viewMode={viewMode}
        onViewModeChange={(mode) => { setViewMode(mode); setExpandedRowId(null); }}
        reasoningFilter={reasoningFilter}
        onReasoningFilterChange={setReasoningFilter}
        modalityFilter={modalityFilter}
        onModalityFilterChange={setModalityFilter}
      />

      {viewMode === "pricing" && (
        <PricingInputs
          promptTokens={promptTokens}
          onPromptTokensChange={setPromptTokens}
          completionTokens={completionTokens}
          onCompletionTokensChange={setCompletionTokens}
          avgCost={avgCost}
        />
      )}

      <CompareBar
        compareIds={compareIds}
        rankings={rankings}
        onRemove={toggleCompareModel}
        onClear={clearCompare}
        onCompare={() => navigate(viewMode === "pricing" ? "/price-compare" : "/compare")}
      />

      <DataTable
        data={filtered}
        columns={modelColumns}
        getRowId={modelId}
        expandedRowId={expandedRowId}
        onToggleExpand={setExpandedRowId}
        renderExpandedRow={(model) => <ModelExpandedDetail model={model} />}
      />
    </div>
  );
}
