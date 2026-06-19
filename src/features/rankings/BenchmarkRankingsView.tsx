import { useState, useMemo } from "react";
import { TabButton } from "../../shared/components/composite/TabButton";
import { DataTable } from "../../shared/components/data/DataTable";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSuspenseArtificialRankings } from "../../shared/hooks/useQueries";
import { useRankMap } from "../../shared/hooks/useRankMap";
import { secondaryTextClass } from "../../shared/utils/cssConstants";
import { BENCHMARK_KEYS, BENCHMARK_LABELS, useBenchmarkColumns } from "./useBenchmarkColumns";

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
  const columns = useBenchmarkColumns(t, selectedBenchmark, rankMap);

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
