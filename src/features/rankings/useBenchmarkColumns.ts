import { BENCHMARK_KEYS, BENCHMARK_LABELS } from "../../shared/constants/benchmarks";
import type { TranslationKey } from "../../shared/i18n";
import type { ArtificialAnalysisModel } from "../../shared/types";
import type { DataTableColumn } from "../../shared/components/data/DataTable";
import { formatScore } from "../../shared/utils/format";

export function useBenchmarkColumns(
  t: (key: TranslationKey) => string,
  selectedBenchmark: string,
  rankMap: Map<string, number>,
): DataTableColumn<ArtificialAnalysisModel>[] {
  return [
    {
      id: "rank",
      header: "#",
      cell: (row) => rankMap.get(row.id),
      width: 50,
    },
    {
      id: "name",
      header: t("modelName"),
      cell: (row) => row.name,
      accessorFn: (row) => row.name,
      sortable: true,
    },
    {
      id: "score",
      header: t("benchmarkScore"),
      cell: (row) => formatScore(t, row.benchmarks?.[selectedBenchmark]),
      accessorFn: (row) => row.benchmarks?.[selectedBenchmark],
      sortable: true,
      align: "right",
    },
    {
      id: "intelligence_index",
      header: t("intelligenceIndex"),
      cell: (row) => formatScore(t, row.intelligence_index),
      accessorFn: (row) => row.intelligence_index,
      sortable: true,
      align: "right",
    },
  ];
}

export { BENCHMARK_KEYS, BENCHMARK_LABELS };
