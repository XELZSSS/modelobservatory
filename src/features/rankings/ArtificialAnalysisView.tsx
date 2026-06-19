import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { DataTableColumn } from "../../shared/components/data/DataTable";
import { DataTable } from "../../shared/components/data/DataTable";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCompareStore } from "../../shared/stores/compareStore";
import { modelId } from "../../shared/utils/modelId";

import type { ArtificialAnalysisModel } from "../../shared/types";
import { buildRankingColumns, buildPricingColumns, ModelExpandedDetail } from "./aaColumns";

import { useAARankingFilters } from "./aa/useAARankingFilters";
import { useCostEstimator } from "./aa/useCostEstimator";
import { FilterToolbar } from "./aa/FilterToolbar";
import { PricingInputs } from "./aa/PricingInputs";
import { CompareChipBar } from "../../shared/components/composite/CompareChipBar";

export function ArtificialAnalysisView({ rankings }: { rankings: ArtificialAnalysisModel[] }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const compareIds = useCompareStore((s) => s.compareIds);
  const toggleCompareModel = useCompareStore((s) => s.toggleCompareModel);
  const clearCompare = useCompareStore((s) => s.clearCompare);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const { filtered, viewMode, setViewMode, reasoningFilter, setReasoningFilter, modalityFilter, setModalityFilter } = useAARankingFilters(rankings);
  const { promptTokens, setPromptTokens, completionTokens, setCompletionTokens, calcPrompt, calcCompletion, avgCost } = useCostEstimator(filtered);

  const getModelState = useCallback(
    (model: ArtificialAnalysisModel) => {
      const key = model.id || model.slug;
      return { isCompared: compareIds.includes(key) };
    },
    [compareIds],
  );

  const modelColumns = useMemo<DataTableColumn<ArtificialAnalysisModel>[]>(() => {
    return viewMode === "pricing"
      ? buildPricingColumns(t, getModelState, toggleCompareModel, calcPrompt, calcCompletion)
      : buildRankingColumns(t, getModelState, toggleCompareModel);
  }, [getModelState, toggleCompareModel, t, viewMode, calcPrompt, calcCompletion]);

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

      <CompareChipBar
        models={compareIds.map((id) => rankings.find((m) => (m.id || m.slug) === id)).filter((m): m is ArtificialAnalysisModel => !!m)}
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
