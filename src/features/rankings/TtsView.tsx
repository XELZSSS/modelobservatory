import { useMemo } from "react";
import type { DataTableColumn } from "../../shared/components/data/DataTable";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSearchStore } from "../../shared/stores/searchStore";
import { useTtsLeaderboard } from "../../shared/hooks/useQueries";
import { DataTable } from "../../shared/components/data/DataTable";
import { ellipsisTextClasses, secondaryTextClass, modelCellClass, modelNameCellClass } from "../../shared/utils/cssConstants";
import { RankBadge } from "../../shared/components/composite/RankBadge";
import { ViewLayout } from "../../shared/components/composite/ViewLayout";
import type { TtsModel } from "../../shared/types";

function getRowId(model: TtsModel) {
  return model.id;
}

export function TtsView() {
  const { t } = useTranslation();
  const searchTerm = useSearchStore((s) => s.searchTerm);
  const { data } = useTtsLeaderboard();

  const filtered = useMemo(() => {
    const models = data ?? [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return models;
    return models.filter((m) => m.name.toLowerCase().includes(term) || (m.provider || "").toLowerCase().includes(term));
  }, [data, searchTerm]);

  const rankMap = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((m, i) => map.set(m.id, i + 1));
    return map;
  }, [filtered]);

  const columns = useMemo<DataTableColumn<TtsModel>[]>(
    () => [
      {
        id: "model",
        header: t("modelNameOrId"),
        cell: (model) => (
          <div className={modelCellClass}>
            <RankBadge rank={rankMap.get(model.id) ?? 0} />
            <p className={modelNameCellClass}>{model.name}</p>
          </div>
        ),
      },
      {
        id: "provider",
        header: t("creator"),
        accessorFn: (row) => row.provider,
        hiddenMd: true,
        align: "right",
        cell: (model) => <p className={`text-sm ${ellipsisTextClasses} text-right`}>{model.provider || t("notAvailable")}</p>,
      },
      {
        id: "quality",
        header: t("ttsQualityElo"),
        accessorFn: (row) => row.quality_elo,
        sortable: true,
        align: "right",
        cell: (model) => <span className="text-sm font-bold">{model.quality_elo != null ? model.quality_elo.toFixed(0) : t("notAvailable")}</span>,
      },
      {
        id: "speed",
        header: t("ttsSpeed"),
        accessorFn: (row) => row.speed_chars_per_sec,
        sortable: true,
        align: "right",
        hiddenMd: true,
        cell: (model) => <span className="text-sm">{model.speed_chars_per_sec != null ? `${model.speed_chars_per_sec.toFixed(1)}` : t("notAvailable")}</span>,
      },
      {
        id: "price",
        header: t("ttsPrice"),
        accessorFn: (row) => row.price_per_1m_chars,
        sortable: true,
        align: "right",
        hiddenMd: true,
        cell: (model) => <span className="text-sm">{model.price_per_1m_chars != null ? `$${model.price_per_1m_chars.toFixed(2)}` : t("notAvailable")}</span>,
      },
    ],
    [t, rankMap],
  );

  return (
    <ViewLayout>
      <p className={secondaryTextClass}>{t("ttsSource")}</p>
      <DataTable data={filtered} columns={columns} getRowId={getRowId} />
    </ViewLayout>
  );
}
