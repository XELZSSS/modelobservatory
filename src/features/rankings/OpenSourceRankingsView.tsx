import { useMemo } from "react";
import type { DataTableColumn } from "../../shared/components/data/DataTable";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFilteredData } from "../../shared/hooks/useFilteredData";
import { DataTable } from "../../shared/components/data/DataTable";
import { RankBadge } from "../../shared/components/composite/RankBadge";
import { ViewLayout } from "../../shared/components/composite/ViewLayout";
import { secondaryTextClass, modelCellClass, modelNameCellClass } from "../../shared/utils/cssConstants";
import type { OpenSourceModelEntry } from "../../shared/types";
import { formatShortNumber } from "../../shared/utils/format";

interface TableRow {
  rank: number;
  model: OpenSourceModelEntry;
}

function getRowId(row: TableRow) {
  return row.model.id;
}

const getSearchFields = (m: OpenSourceModelEntry) => [m.id];

export function OpenSourceRankingsView({ rankings }: { rankings: OpenSourceModelEntry[] }) {
  const { t } = useTranslation();
  const filtered = useFilteredData(rankings, getSearchFields);

  const rows = useMemo(() => filtered.map((model, index) => ({ rank: index + 1, model })), [filtered]);

  const columns = useMemo<DataTableColumn<TableRow>[]>(
    () => [
      {
        id: "model",
        header: t("modelNameOrId"),
        cell: (row) => (
          <div className={modelCellClass}>
            <RankBadge rank={row.rank} />
            <span className={modelNameCellClass}>{row.model.id.split("/").pop() || row.model.id}</span>
          </div>
        ),
      },
      {
        id: "downloads",
        header: t("downloads"),
        accessorFn: (r) => r.model.downloads,
        sortable: true,
        align: "right",
        cell: (row) => <span className="text-sm font-bold">{formatShortNumber(row.model.downloads)}</span>,
      },
      {
        id: "likes",
        header: t("likes"),
        accessorFn: (r) => r.model.likes,
        sortable: true,
        align: "right",
        hiddenMd: true,
        cell: (row) => <span className="text-sm">{formatShortNumber(row.model.likes)}</span>,
      },
      {
        id: "license",
        header: t("license"),
        accessorFn: (r) => r.model.license,
        sortable: true,
        align: "right",
        hiddenMd: true,
        cell: (row) => <span className="text-sm">{row.model.license || t("notAvailable")}</span>,
      },
    ],
    [t],
  );

  return (
    <ViewLayout>
      <p className={secondaryTextClass}>{t("openSourceDataSource")}</p>
      <DataTable data={rows} columns={columns} getRowId={getRowId} />
    </ViewLayout>
  );
}
