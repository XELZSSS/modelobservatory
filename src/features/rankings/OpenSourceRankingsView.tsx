import { RankingTable, type RankedRow } from "../../shared/components/data/RankingTable";
import { RankingNameCell } from "../../shared/components/composite/RankingNameCell";
import type { DataTableColumn } from "../../shared/components/data/DataTable";
import type { OpenSourceModelEntry } from "../../shared/types";
import type { TranslationKey } from "../../shared/i18n";
import { formatShortNumber } from "../../shared/utils/format";

const getRowId = (model: OpenSourceModelEntry) => model.id;
const getSearchFields = (model: OpenSourceModelEntry) => [model.id];

function buildColumns(t: (key: TranslationKey) => string): DataTableColumn<RankedRow<OpenSourceModelEntry>>[] {
  return [
    {
      id: "model",
      header: t("modelNameOrId"),
      cell: (row) => <RankingNameCell rank={row.rank} name={row.item.id.split("/").pop() || row.item.id} />,
    },
    {
      id: "downloads",
      header: t("downloads"),
      accessorFn: (r) => r.item.downloads,
      sortable: true,
      align: "right",
      cell: (row) => <span className="text-sm font-bold">{formatShortNumber(row.item.downloads)}</span>,
    },
    {
      id: "likes",
      header: t("likes"),
      accessorFn: (r) => r.item.likes,
      sortable: true,
      align: "right",
      hiddenMd: true,
      cell: (row) => <span className="text-sm">{formatShortNumber(row.item.likes)}</span>,
    },
    {
      id: "license",
      header: t("license"),
      accessorFn: (r) => r.item.license,
      sortable: true,
      align: "right",
      hiddenMd: true,
      cell: (row) => <span className="text-sm">{row.item.license || t("notAvailable")}</span>,
    },
  ];
}

export function OpenSourceRankingsView({ rankings }: { rankings: OpenSourceModelEntry[] }) {
  return (
    <RankingTable
      data={rankings}
      columns={buildColumns}
      getRowId={getRowId}
      getSearchFields={getSearchFields}
      sourceKey="openSourceDataSource"
    />
  );
}
