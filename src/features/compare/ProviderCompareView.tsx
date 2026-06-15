import { useMemo } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSuspenseArtificialRankings } from "../../shared/hooks/useQueries";
import { DataTable, type DataTableColumn } from "../../shared/components/data/DataTable";
import type { ArtificialAnalysisModel } from "../../shared/types";
import { formatScore, formatPricePerMillion } from "../../shared/utils/format";
import { secondaryTextClass } from "../../shared/utils/cssConstants";

interface ProviderStats {
  name: string;
  color: string;
  count: number;
  avgPrice: number | null;
  avgSpeed: number | null;
  avgIntelligence: number | null;
}

function computeProviderStats(models: ArtificialAnalysisModel[]): ProviderStats[] {
  const providers = new Map<string, { models: ArtificialAnalysisModel[]; color: string }>();

  for (const m of models) {
    const name = m.model_creators?.name || "Unknown";
    const color = m.model_creators?.color || "#6b7280";
    let bucket = providers.get(name);
    if (!bucket) {
      bucket = { models: [], color };
      providers.set(name, bucket);
    }
    bucket.models.push(m);
  }

  return Array.from(providers.entries())
    .map(([name, { models, color }]) => {
      const count = models.length;

      const prices = models.map((m) => m.pricing?.input).filter((p): p is number => p != null);
      const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null;

      const speeds = models.map((m) => m.speed?.median_output_speed ?? m.speed?.timescaleData?.median_output_speed).filter((s): s is number => s != null);
      const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : null;

      const intelligences = models.map((m) => m.intelligence_index).filter((i): i is number => i != null);
      const avgIntelligence = intelligences.length > 0 ? intelligences.reduce((a, b) => a + b, 0) / intelligences.length : null;

      return { name, color, count, avgPrice, avgSpeed, avgIntelligence };
    })
    .sort((a, b) => b.count - a.count);
}

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
