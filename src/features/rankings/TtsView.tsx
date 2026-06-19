import { useMemo } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useTtsLeaderboard } from "../../shared/hooks/useQueries";
import { useFilteredData } from "../../shared/hooks/useFilteredData";
import { useRankMap } from "../../shared/hooks/useRankMap";
import { DataTable, type DataTableColumn } from "../../shared/components/data/DataTable";
import { RankingNameCell } from "../../shared/components/composite/RankingNameCell";
import { ViewLayout } from "../../shared/components/composite/ViewLayout";
import { secondaryTextClass, textSecondaryClass, ellipsisTextClasses } from "../../shared/utils/cssConstants";
import { formatDollar } from "../../shared/utils/format";
import type { TtsModel } from "../../shared/types";

const getRowId = (model: TtsModel) => model.id;
const getSearchFields = (m: TtsModel) => [m.name, m.provider || ""];

export function TtsView() {
  const { t } = useTranslation();
  const { data } = useTtsLeaderboard();
  const filtered = useFilteredData(data ?? [], getSearchFields);
  const rankMap = useRankMap(filtered, (m) => m.id);

  const columns = useMemo<DataTableColumn<TtsModel>[]>(
    () => [
      {
        id: "model",
        header: t("modelNameOrId"),
        cell: (model) => <RankingNameCell rank={rankMap.get(model.id) ?? 0} name={model.name} />,
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
        cell: (model) => <span className="text-sm">{formatDollar(model.price_per_1m_chars, t)}</span>,
      },
    ],
    [t, rankMap],
  );

  return (
    <ViewLayout>
      <p className={secondaryTextClass}>{t("ttsSource")}</p>
      {filtered.length === 0 ? (
        <p className={`${textSecondaryClass} py-8 text-center`}>{t("noResults")}</p>
      ) : (
        <DataTable data={filtered} columns={columns} getRowId={getRowId} />
      )}
    </ViewLayout>
  );
}
