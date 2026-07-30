import { useMemo } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import { useFilteredData } from "../../hooks/useFilteredData";
import { DataTable, type DataTableColumn } from "./DataTable";
import { PageContainer, PageSection } from "../layout/PageContainer";

import { cn } from "../../utils/cn";
import type { TranslationKey } from "../../i18n";

export interface RankedRow<T> {
  rank: number;
  item: T;
}

interface RankingTableProps<T> {
  data: T[];
  columns: (t: (key: TranslationKey) => string) => DataTableColumn<RankedRow<T>>[];
  getRowId: (item: T) => string;
  getSearchFields: (item: T) => string[];
  sourceKey: TranslationKey;
  /** Optional: compute rank from position in filtered list instead of using index+1 */
  getRank?: (item: T, index: number) => number;
  emptyMessageKey?: TranslationKey;
  extraHeader?: React.ReactNode;
}

export function RankingTable<T>({ data, columns, getRowId, getSearchFields, sourceKey, getRank, emptyMessageKey, extraHeader }: RankingTableProps<T>) {
  const { t } = useTranslation();
  const filtered = useFilteredData(data, getSearchFields);

  const rows = useMemo(() => filtered.map((item, index) => ({ rank: getRank ? getRank(item, index) : index + 1, item })), [filtered, getRank]);

  const tableColumns = useMemo<DataTableColumn<RankedRow<T>>[]>(() => columns(t), [t]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-text-secondary">{t(sourceKey)}</p>
      {extraHeader}
      {rows.length === 0 ? (
        <p className="text-sm text-text-secondary py-8 text-center">{t(emptyMessageKey ?? "noResults")}</p>
      ) : (
        <DataTable data={rows} columns={tableColumns} getRowId={(row) => getRowId(row.item)} hideHeader />
      )}
    </div>
  );
}
