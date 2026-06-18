import { useMemo } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSuspenseArtificialRankings } from "../../shared/hooks/useQueries";
import { DataTable, type DataTableColumn } from "../../shared/components/data/DataTable";
import { formatScore, formatPricePerMillion } from "../../shared/utils/format";
import { secondaryTextClass } from "../../shared/utils/cssConstants";
import { computeProviderStats, type ProviderStats } from "../../shared/utils/providerStats";

export function ProviderCompareView() {
  const { t } = useTranslation();
  const { data } = useSuspenseArtificialRankings();

  const providerStats = useMemo(() => computeProviderStats(data), [data]);

  const columns = useMemo<DataTableColumn<ProviderStats>[]>(
    () => [
      {
        id: "name",
        header: t("provider"),
        accessorFn: (p) => p.name,
        cell: (p) => (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="font-medium">{p.name}</span>
          </div>
        ),
      },
      { id: "count", header: t("modelCount"), accessorFn: (p) => p.count, cell: (p) => p.count },
      {
        id: "avgIntelligence",
        header: t("avgIntelligence"),
        accessorFn: (p) => p.avgIntelligence ?? -1,
        cell: (p) => formatScore(t, p.avgIntelligence),
      },
      {
        id: "avgPrice",
        header: t("avgPrice"),
        accessorFn: (p) => p.avgPrice ?? -1,
        cell: (p) => formatPricePerMillion(t, p.avgPrice),
        hiddenMd: true,
      },
      {
        id: "avgSpeed",
        header: t("avgSpeed"),
        accessorFn: (p) => p.avgSpeed ?? -1,
        cell: (p) => (p.avgSpeed != null ? `${p.avgSpeed.toFixed(1)} tok/s` : t("notAvailable")),
        hiddenMd: true,
      },
    ],
    [t],
  );

  return (
    <div className="flex flex-col gap-4">
      <p className={secondaryTextClass}>{t("artificialSource")}</p>
      <DataTable columns={columns} data={providerStats} getRowId={(p) => p.name} />
    </div>
  );
}
