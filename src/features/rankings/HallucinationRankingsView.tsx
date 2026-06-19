import { RankingTable, type RankedRow } from "../../shared/components/data/RankingTable";
import { RankingNameCell } from "../../shared/components/composite/RankingNameCell";
import type { DataTableColumn } from "../../shared/components/data/DataTable";
import type { HallucinationRankingEntry } from "../../shared/types";
import type { TranslationKey } from "../../shared/i18n";

function fmtRate(v: number) {
  return `${v.toFixed(1)}%`;
}

function fmtScore(v: number) {
  return v.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

const getRowId = (entry: HallucinationRankingEntry) => entry.id || entry.slug || entry.model;
const getSearchFields = (entry: HallucinationRankingEntry) => [entry.model];

function buildColumns(t: (key: TranslationKey) => string): DataTableColumn<RankedRow<HallucinationRankingEntry>>[] {
  return [
    {
      id: "model",
      header: t("modelNameOrId"),
      cell: (row) => <RankingNameCell name={row.item.model} />,
    },
    {
      id: "hallucinationRate",
      header: t("hallucinationRate"),
      accessorFn: (r) => r.item.hallucinationRate,
      sortable: true,
      align: "right",
      cell: (row) => <span className="text-sm font-bold">{fmtRate(row.item.hallucinationRate)}</span>,
    },
    {
      id: "accuracy",
      header: t("accuracy"),
      accessorFn: (r) => r.item.accuracy,
      sortable: true,
      align: "right",
      hiddenMd: true,
      cell: (row) => <span className="text-sm">{fmtRate(row.item.accuracy)}</span>,
    },
    {
      id: "attemptRate",
      header: t("attemptRate"),
      accessorFn: (r) => r.item.attemptRate,
      sortable: true,
      align: "right",
      hiddenMd: true,
      cell: (row) => <span className="text-sm">{fmtRate(row.item.attemptRate)}</span>,
    },
    {
      id: "omniscienceIndex",
      header: t("omniscienceIndex"),
      accessorFn: (r) => r.item.omniscienceIndex,
      sortable: true,
      align: "right",
      hiddenMd: true,
      cell: (row) => <span className="text-sm">{fmtScore(row.item.omniscienceIndex)}</span>,
    },
  ];
}

export function HallucinationRankingsView({ rankings }: { rankings: HallucinationRankingEntry[] }) {
  return (
    <RankingTable
      data={rankings}
      columns={buildColumns}
      getRowId={getRowId}
      getSearchFields={getSearchFields}
      sourceKey="hallucinationSource"
    />
  );
}
