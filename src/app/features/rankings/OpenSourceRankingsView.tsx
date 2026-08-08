import { useMemo } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import { useFilteredData } from "../../hooks/useFilteredData";
import { DataTable, type DataTableColumn } from "../../components/data/DataTable";
import { RankingNameCell } from "../../components/composite/RankingNameCell";
import { TagBadge } from "../../components/ui/tag-badge";
import type { OpenSourceModelEntry } from "../../../shared/types";
import { formatShortNumber } from "../../../shared/utils/format";

const getRowId = (model: OpenSourceModelEntry) => model.id;
const getSearchFields = (model: OpenSourceModelEntry) => [model.id];

export function OpenSourceRankingsView({ rankings }: { rankings: OpenSourceModelEntry[] }) {
  const { t } = useTranslation();
  const filtered = useFilteredData(rankings, getSearchFields);

  const columns = useMemo<DataTableColumn<OpenSourceModelEntry>[]>(
    () => [
      {
        id: "model",
        header: "",
        cell: (item) => (
          <>
            <RankingNameCell name={item.id.split("/").pop() || item.id} />
            <div className="flex flex-wrap gap-1 mt-1 md:hidden">
              <TagBadge>
                {t("likes")}: {formatShortNumber(item.likes)}
              </TagBadge>
              {item.license && <TagBadge>{item.license}</TagBadge>}
            </div>
          </>
        ),
      },
      {
        id: "downloads",
        header: "",
        accessorFn: (r) => r.downloads,
        sortable: true,
        align: "right",
        cell: (item) => <span className="text-sm font-semibold">{formatShortNumber(item.downloads)}</span>,
      },
      {
        id: "likes",
        header: "",
        accessorFn: (r) => r.likes,
        sortable: true,
        align: "right",
        hiddenMd: true,
        cell: (item) => <span className="text-sm">{formatShortNumber(item.likes)}</span>,
      },
      {
        id: "license",
        header: "",
        accessorFn: (r) => r.license,
        sortable: true,
        align: "right",
        hiddenMd: true,
        cell: (item) => <span className="text-sm">{item.license || t("notAvailable")}</span>,
      },
    ],
    [t],
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-text-secondary">{t("openSourceDataSource")}</p>
      {filtered.length === 0 ? (
        <p className="text-sm text-text-secondary py-8 text-center">{t("noResults")}</p>
      ) : (
        <DataTable data={filtered} columns={columns} getRowId={getRowId} hideHeader />
      )}
    </div>
  );
}