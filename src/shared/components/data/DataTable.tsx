import { memo, useCallback, useMemo, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { useTranslation } from "../../i18n/useTranslation";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTableSort, useTablePagination } from "./useTableState";
import { Pagination } from "../ui/pagination";
import { TableHeader } from "./TableHeader";
import { TableBody } from "./TableBody";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessorFn?: (row: T) => unknown;
  cell: (row: T) => ReactNode;
  align?: "left" | "center" | "right";
  width?: number | string;
  hiddenMd?: boolean;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId?: (row: T) => string;
  pageSize?: number;
  hideHeader?: boolean;
  expandedRowId?: string | null;
  onToggleExpand?: (rowId: string | null) => void;
  renderExpandedRow?: (row: T) => ReactNode;
}

function DataTableInner<T>({ data, columns, getRowId, pageSize = 30, hideHeader, expandedRowId, onToggleExpand, renderExpandedRow }: DataTableProps<T>) {
  const isMobile = useIsMobile();
  const effectivePageSize = isMobile ? Math.min(pageSize, 15) : pageSize;
  const { t } = useTranslation();

  const isExpandable = !!(renderExpandedRow && onToggleExpand);

  const dedupedData = useMemo(() => {
    if (!getRowId) return data;
    const seen = new Set<string>();
    return data.filter((record, index) => {
      const key = getRowId(record);
      // Empty ids are shared by every id-less row; fall back to the array
      // index so rows are never silently collapsed together.
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data, getRowId]);

  const { sortedData, sortState, toggleSort } = useTableSort(dedupedData, columns);
  const { page, totalPages, pagedData, goToPage, resetPage } = useTablePagination(sortedData, effectivePageSize);

  const handleSort = useCallback((colId: string) => {
    resetPage();
    toggleSort(colId);
  }, [resetPage, toggleSort]);

  return (
    <div className="flex flex-col gap-2">
      {sortedData.length === 0 ? (
        <div className="py-12 text-center text-sm text-text-secondary">{t("noResults")}</div>
      ) : (
        <>
          <div className="rounded-lg border border-border overflow-x-auto min-w-0">
            <table className="w-full text-sm table-auto">
              {!hideHeader && <TableHeader columns={columns} sortState={sortState} onSort={handleSort} />}
              <TableBody
                pagedData={pagedData}
                columns={columns}
                getRowId={getRowId}
                isExpandable={isExpandable}
                expandedRowId={expandedRowId}
                onToggleExpand={onToggleExpand}
                renderExpandedRow={renderExpandedRow}
              />
            </table>
          </div>
          {sortedData.length > effectivePageSize && <Pagination page={page} totalPages={totalPages} onChange={goToPage} className="pt-1 self-center" />}
        </>
      )}
    </div>
  );
}

export const DataTable = memo(DataTableInner) as typeof DataTableInner;
