import { useMemo } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useTtsLeaderboard } from "../../shared/hooks/useApiQuery";
import { useFilteredData } from "../../shared/hooks/useFilteredData";
import { DataTable, type DataTableColumn } from "../../shared/components/data/DataTable";
import { RankingNameCell } from "../../shared/components/composite/RankingNameCell";
import { ViewLayout } from "../../shared/components/composite/ViewLayout";

import { cn } from "../../shared/utils/cn";
import { formatDollar } from "../../shared/utils/format";
import type { TtsModel } from "../../shared/types";

const getRowId = (model: TtsModel) => model.id;
const getSearchFields = (m: TtsModel) => [m.name, m.provider || ""];

export function TtsView() {
  const { t } = useTranslation();
  const { data } = useTtsLeaderboard();
  const filtered = useFilteredData(data ?? [], getSearchFields);

  const tagClass = "inline-flex items-center text-[11px] leading-[16px] px-1.5 py-0.5 rounded-[4px] border border-border bg-bg-secondary text-text-secondary";
  const columns = useMemo<DataTableColumn<TtsModel>[]>(
    () => [
      {
        id: "model",
        header: t("modelNameOrId"),
        cell: (model) => (
          <>
            <RankingNameCell name={model.name} />
            <div className="flex flex-wrap gap-1 mt-1 md:hidden">
              {model.provider && <span className={tagClass}>{model.provider}</span>}
              {model.speed_chars_per_sec != null && <span className={tagClass}>{t("ttsSpeed")}: {model.speed_chars_per_sec.toFixed(1)}</span>}
              {model.price_per_1m_chars != null && <span className={tagClass}>{formatDollar(model.price_per_1m_chars, t)}</span>}
            </div>
          </>
        ),
      },
      {
        id: "provider",
        header: t("creator"),
        accessorFn: (row) => row.provider,
        hiddenMd: true,
        align: "right",
        cell: (model) => <p className={cn("text-sm", "overflow-hidden text-ellipsis whitespace-nowrap", "text-right")}>{model.provider || t("notAvailable")}</p>,
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
    [t],
  );

  return (
    <ViewLayout>
      <p className="text-xs text-text-secondary">{t("ttsSource")}</p>
      {filtered.length === 0 ? (
        <p className={cn("text-sm text-text-secondary", "py-8 text-center")}>{t("noResults")}</p>
      ) : (
        <DataTable data={filtered} columns={columns} getRowId={getRowId} />
      )}
    </ViewLayout>
  );
}
