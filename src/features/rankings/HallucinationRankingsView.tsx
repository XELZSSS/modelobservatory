import { useMemo } from "react";
import type { DataTableColumn } from "../../shared/components/data/DataTable";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFilteredData } from "../../shared/hooks/useFilteredData";
import { DataTable } from "../../shared/components/data/DataTable";
import { RankBadge } from "../../shared/components/composite/RankBadge";
import { ViewLayout } from "../../shared/components/composite/ViewLayout";
import { secondaryTextClass, modelCellClass, modelNameCellClass } from "../../shared/utils/cssConstants";
import type { HallucinationRankingEntry } from "../../shared/types";

interface TableRow {
  rank: number;
  entry: HallucinationRankingEntry;
}

function getRowId(row: TableRow) {
  return row.entry.slug || row.entry.model;
}

function fmtRate(v: number) {
  return `${v.toFixed(1)}%`;
}
function fmtScore(v: number) {
  return v.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

const getSearchFields = (entry: HallucinationRankingEntry) => [entry.model];

export function HallucinationRankingsView({ rankings }: { rankings: HallucinationRankingEntry[] }) {
  const { t } = useTranslation();
  const filtered = useFilteredData(rankings, getSearchFields);

  const rows = useMemo(() => filtered.map((entry, index) => ({ rank: index + 1, entry })), [filtered]);

  const columns = useMemo<DataTableColumn<TableRow>[]>(
    () => [
      {
        id: "model",
        header: t("modelNameOrId"),
        cell: (row) => (
          <div className={modelCellClass}>
            <RankBadge rank={row.rank} />
            <span className={modelNameCellClass}>{row.entry.model}</span>
          </div>
        ),
      },
      {
        id: "hallucinationRate",
        header: t("hallucinationRate"),
        accessorFn: (r) => r.entry.hallucinationRate,
        sortable: true,
        align: "right",
        cell: (row) => <span className="text-sm font-bold">{fmtRate(row.entry.hallucinationRate)}</span>,
      },
      {
        id: "accuracy",
        header: t("accuracy"),
        accessorFn: (r) => r.entry.accuracy,
        sortable: true,
        align: "right",
        hiddenMd: true,
        cell: (row) => <span className="text-sm">{fmtRate(row.entry.accuracy)}</span>,
      },
      {
        id: "attemptRate",
        header: t("attemptRate"),
        accessorFn: (r) => r.entry.attemptRate,
        sortable: true,
        align: "right",
        hiddenMd: true,
        cell: (row) => <span className="text-sm">{fmtRate(row.entry.attemptRate)}</span>,
      },
      {
        id: "omniscienceIndex",
        header: t("omniscienceIndex"),
        accessorFn: (r) => r.entry.omniscienceIndex,
        sortable: true,
        align: "right",
        hiddenMd: true,
        cell: (row) => <span className="text-sm">{fmtScore(row.entry.omniscienceIndex)}</span>,
      },
    ],
    [t],
  );

  return (
    <ViewLayout>
      <p className={secondaryTextClass}>{t("hallucinationSource")}</p>
      <DataTable data={rows} columns={columns} getRowId={getRowId} />
    </ViewLayout>
  );
}
