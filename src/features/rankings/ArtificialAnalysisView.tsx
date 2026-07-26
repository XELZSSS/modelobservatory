import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { DataTableColumn } from "../../shared/components/data/DataTable";
import { DataTable } from "../../shared/components/data/DataTable";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCompareStore } from "../../shared/stores/compareStore";
import { modelId } from "../../shared/utils/modelId";
import { TabButton } from "../../shared/components/composite/TabButton";
import { Input } from "../../shared/components/ui/input";

import { formatDollar } from "../../shared/utils/format";
import { calcModelCost } from "../../shared/utils/math";

import type { ArtificialAnalysisModel } from "../../shared/types";
import { buildRankingColumns, buildPricingColumns, ModelExpandedDetail } from "./aaColumns";

import { useAARankingFilters, type ViewMode, type ReasoningFilter } from "./aa/useAARankingFilters";
import { CompareChipBar } from "../../shared/components/composite/CompareChipBar";
import { BENCHMARK_KEYS, BENCHMARK_LABELS } from "../../shared/constants/benchmarks";
import { useBenchmarkColumns } from "./useBenchmarkColumns";

function useCostEstimator(filteredRankings: ArtificialAnalysisModel[]) {
  const [promptTokens, setPromptTokens] = useState("100000");
  const [completionTokens, setCompletionTokens] = useState("30000");
  const calcPrompt = Number(promptTokens) || 0;
  const calcCompletion = Number(completionTokens) || 0;
  const avgCost = useMemo(() => {
    let total = 0,
      count = 0;
    for (const m of filteredRankings) {
      const cost = calcModelCost(m, calcPrompt, calcCompletion);
      if (cost != null) {
        total += cost;
        count++;
      }
    }
    return count > 0 ? total / count : 0;
  }, [filteredRankings, calcPrompt, calcCompletion]);
  return { promptTokens, setPromptTokens, completionTokens, setCompletionTokens, calcPrompt, calcCompletion, avgCost };
}

function FilterToolbar({
  viewMode,
  onViewModeChange,
  reasoningFilter,
  onReasoningFilterChange,
  modalityFilter,
  onModalityFilterChange,
  selectedBenchmark,
  onBenchmarkChange,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  reasoningFilter: ReasoningFilter;
  onReasoningFilterChange: (filter: ReasoningFilter) => void;
  modalityFilter: string;
  onModalityFilterChange: (filter: string) => void;
  selectedBenchmark?: string;
  onBenchmarkChange?: (key: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 min-w-0">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end min-w-0">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-secondary">{t("artificialSource")}</p>
          <div className="flex flex-row gap-1 mt-1 flex-wrap items-center">
            <TabButton active={viewMode === "rankings"} onClick={() => onViewModeChange("rankings")}>
              {t("modelRankings")}
            </TabButton>
            <TabButton active={viewMode === "pricing"} onClick={() => onViewModeChange("pricing")}>
              {t("pricing")}
            </TabButton>
            <TabButton active={viewMode === "benchmarks"} onClick={() => onViewModeChange("benchmarks")}>
              {t("benchmarks")}
            </TabButton>
            {viewMode !== "benchmarks" && (
              <>
                <span className="w-[1px] h-4 bg-border mx-1" />
                {[
                  { key: "all" as const, label: t("all") },
                  { key: "reasoning" as const, label: t("reasoning") },
                  { key: "non-reasoning" as const, label: t("nonReasoning") },
                ].map((tab) => (
                  <TabButton key={tab.key} active={reasoningFilter === tab.key} onClick={() => onReasoningFilterChange(tab.key)}>
                    {tab.label}
                  </TabButton>
                ))}
                <span className="w-[1px] h-4 bg-border mx-1 hidden sm:block" />
                <div className="hidden sm:flex flex-row gap-1 items-center">
                  {[
                    { key: "all" as const, label: t("allModalities") },
                    { key: "text" as const, label: t("textOnly") },
                    { key: "image" as const, label: t("imageInput") },
                    { key: "speech" as const, label: t("speechInput") },
                    { key: "video" as const, label: t("videoInput") },
                  ].map((tab) => (
                    <TabButton key={tab.key} active={modalityFilter === tab.key} onClick={() => onModalityFilterChange(tab.key)}>
                      {tab.label}
                    </TabButton>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {viewMode === "benchmarks" && onBenchmarkChange && (
        <div className="flex flex-wrap gap-1">
          {BENCHMARK_KEYS.map((key) => (
            <TabButton key={key} active={selectedBenchmark === key} onClick={() => onBenchmarkChange(key)}>
              {t(BENCHMARK_LABELS[key])}
            </TabButton>
          ))}
        </div>
      )}
    </div>
  );
}

function PricingInputs({
  promptTokens,
  onPromptTokensChange,
  completionTokens,
  onCompletionTokensChange,
  avgCost,
}: {
  promptTokens: string;
  onPromptTokensChange: (v: string) => void;
  completionTokens: string;
  onCompletionTokensChange: (v: string) => void;
  avgCost: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2 flex-wrap items-center p-2 rounded-md border border-border">
      <Input
        type="number"
        value={promptTokens}
        onChange={(e) => onPromptTokensChange(e.target.value)}
        className="w-full sm:w-44 border-border"
        placeholder={t("monthlyPromptTokens")}
      />
      <Input
        type="number"
        value={completionTokens}
        onChange={(e) => onCompletionTokensChange(e.target.value)}
        className="w-full sm:w-44 border-border"
        placeholder={t("monthlyCompletionTokens")}
      />
      <div className="flex items-center">
        <span className="text-sm text-text-secondary">{t("estimatedMonthlyCost")}: </span>
        <span className="text-base font-bold ml-1">{formatDollar(avgCost)}</span>
        <span className="text-xs text-text-secondary ml-[2px]">{t("perModelAvg")}</span>
      </div>
    </div>
  );
}

export function ArtificialAnalysisView({ rankings }: { rankings: ArtificialAnalysisModel[] }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const compareIds = useCompareStore((s) => s.compareIds);
  const toggleCompareModel = useCompareStore((s) => s.toggleCompareModel);
  const clearCompare = useCompareStore((s) => s.clearCompare);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [selectedBenchmark, setSelectedBenchmark] = useState<string>("aime25");

  const { filtered, viewMode, setViewMode, reasoningFilter, setReasoningFilter, modalityFilter, setModalityFilter } = useAARankingFilters(rankings);
  const { promptTokens, setPromptTokens, completionTokens, setCompletionTokens, calcPrompt, calcCompletion, avgCost } = useCostEstimator(filtered);

  const benchmarkFiltered = useMemo(
    () => rankings.filter((m) => m.benchmarks?.[selectedBenchmark] != null).sort((a, b) => (b.benchmarks?.[selectedBenchmark] ?? 0) - (a.benchmarks?.[selectedBenchmark] ?? 0)),
    [rankings, selectedBenchmark],
  );

  const modelColumns = useMemo<DataTableColumn<ArtificialAnalysisModel>[]>(() => {
    if (viewMode === "benchmarks") return [];
    return viewMode === "pricing"
      ? buildPricingColumns(t, calcPrompt, calcCompletion)
      : buildRankingColumns(t);
  }, [t, viewMode, calcPrompt, calcCompletion]);

  const benchmarkColumns = useBenchmarkColumns(t, selectedBenchmark);

  return (
    <div className="flex flex-col gap-4">
      <FilterToolbar
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          setViewMode(mode);
          setExpandedRowId(null);
        }}
        reasoningFilter={reasoningFilter}
        onReasoningFilterChange={setReasoningFilter}
        modalityFilter={modalityFilter}
        onModalityFilterChange={setModalityFilter}
        selectedBenchmark={selectedBenchmark}
        onBenchmarkChange={setSelectedBenchmark}
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

      {viewMode !== "benchmarks" && (
        <>
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
        </>
      )}

      {viewMode === "benchmarks" && <DataTable data={benchmarkFiltered} columns={benchmarkColumns} getRowId={(row) => row.id} />}
    </div>
  );
}
