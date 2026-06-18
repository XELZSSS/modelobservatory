import { useState, useMemo } from "react";
import { TabButton } from "../../shared/components/composite/TabButton";

import type { DataTableColumn } from "../../shared/components/data/DataTable";
import { DataTable } from "../../shared/components/data/DataTable";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TranslationKey } from "../../shared/i18n/useTranslation";
import { useSuspenseArtificialRankings } from "../../shared/hooks/useQueries";
import { useRankMap } from "../../shared/hooks/useRankMap";
import { formatScore } from "../../shared/utils/format";
import { secondaryTextClass } from "../../shared/utils/cssConstants";
import type { ArtificialAnalysisModel } from "../../shared/types";

const BENCHMARK_KEYS = [
  "aime25",
  "gpqa",
  "hle",
  "scicode",
  "mmlu_pro",
  "math_500",
  "humaneval",
  "livecodebench",
  "gdpval",
  "tau2",
  "terminalbench_hard",
  "ifbench",
  "lcr",
  "omniscience",
  "critpt",
  "apex_agents",
  "terminalbench_v2_1",
  "tau_banking",
] as const;

const BENCHMARK_LABELS: Record<(typeof BENCHMARK_KEYS)[number], TranslationKey> = {
  aime25: "benchmarkAime25",
  gpqa: "benchmarkGpqa",
  hle: "benchmarkHle",
  scicode: "benchmarkScicode",
  mmlu_pro: "benchmarkMmluPro",
  math_500: "benchmarkMath500",
  humaneval: "benchmarkHumaneval",
  livecodebench: "benchmarkLivecodebench",
  gdpval: "benchmarkGdpval",
  tau2: "benchmarkTau2",
  terminalbench_hard: "benchmarkTerminalbenchHard",
  ifbench: "benchmarkIfbench",
  lcr: "benchmarkLcr",
  omniscience: "benchmarkOmniscience",
  critpt: "benchmarkCritpt",
  apex_agents: "benchmarkApexAgents",
  terminalbench_v2_1: "benchmarkTerminalbenchV2_1",
  tau_banking: "benchmarkTauBanking",
};

export function BenchmarkRankingsView() {
  const { t } = useTranslation();
  const { data } = useSuspenseArtificialRankings();
  const [selectedBenchmark, setSelectedBenchmark] = useState<string>("aime25");

  const filteredData = useMemo(
    () =>
      data
        .filter((m) => m.benchmarks?.[selectedBenchmark] != null)
        .sort((a, b) => (b.benchmarks?.[selectedBenchmark] ?? 0) - (a.benchmarks?.[selectedBenchmark] ?? 0)),
    [data, selectedBenchmark],
  );

  const rankMap = useRankMap(filteredData, (m) => m.id);


  const columns = useMemo<DataTableColumn<ArtificialAnalysisModel>[]>(
    () => [
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
    ],
    [t, selectedBenchmark, rankMap],
  );

  return (
    <div className="flex flex-col gap-4">
      <p className={secondaryTextClass}>{t("artificialSource")}</p>
      <div className="flex flex-wrap gap-1">
        {BENCHMARK_KEYS.map((key) => (
          <TabButton key={key} active={selectedBenchmark === key} onClick={() => setSelectedBenchmark(key)}>
            {t(BENCHMARK_LABELS[key])}
          </TabButton>
        ))}
      </div>
      <DataTable data={filteredData} columns={columns} getRowId={(row) => row.id} />
    </div>
  );
}
