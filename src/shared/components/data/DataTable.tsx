import { Fragment, useMemo, useCallback, type ReactNode } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTableSort, useTablePagination } from "./useTableState";
import { textSecondaryClass } from "../../utils/cssConstants";
import { Pagination } from "../ui/pagination";

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
  expandedRowId?: string | null;
  onToggleExpand?: (rowId: string | null) => void;
  renderExpandedRow?: (row: T) => ReactNode;
}

export function DataTable<T>({ data, columns, getRowId, pageSize = 30, expandedRowId, onToggleExpand, renderExpandedRow }: DataTableProps<T>) {
  const isMobile = useIsMobile();
  const effectivePageSize = isMobile ? Math.min(pageSize, 15) : pageSize;
  const { t } = useTranslation();

  const isExpandable = !!(renderExpandedRow && onToggleExpand);

  const dedupedData = useMemo(() => {
    if (!getRowId) return data;
    const seen = new Set<string>();
    return data.filter((record) => {
      const key = getRowId(record);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data, getRowId]);

  const { sortedData, sortState, toggleSort } = useTableSort(dedupedData, columns);
  const { page, totalPages, pagedData, nextPage, prevPage, resetPage } = useTablePagination(sortedData, effectivePageSize);

  const handleSort = useCallback(
    (colId: string) => {
      resetPage();
      toggleSort(colId);
    },
    [resetPage, toggleSort],
  );

  const resolveRowId = useCallback((record: T, index: number): string => (getRowId ? getRowId(record) : String(index)), [getRowId]);

  return (
    <div className="flex flex-col gap-2">
      {sortedData.length === 0 ? (
        <div className={`py-8 text-center ${textSecondaryClass}`}>{t("noResults")}</div>
      ) : (
        <>
          <div className="rounded-md border border-border overflow-x-auto min-w-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-secondary">
                  {columns.map((col) => (
                    <th
                      key={col.id}
                      className={`py-1.5 px-2 font-semibold text-text-secondary whitespace-nowrap border-b border-border ${col.hiddenMd ? "hidden md:table-cell" : ""}`}
                      style={{ width: col.width, textAlign: col.align || "left" }}
                      aria-sort={col.sortable ? (sortState.col === col.id ? (sortState.dir === "asc" ? "ascending" : "descending") : "none") : undefined}
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-text-primary transition-colors cursor-pointer"
                          style={{ textAlign: col.align || "left" }}
                          onClick={() => handleSort(col.id)}
                        >
                          {col.header}
                          <span className="inline-flex flex-col leading-none">
                            <ChevronUp size={10} className={sortState.col === col.id && sortState.dir === "asc" ? "text-text-primary" : "opacity-30"} />
                            <ChevronDown size={10} className={`-mt-0.5 ${sortState.col === col.id && sortState.dir === "desc" ? "text-text-primary" : "opacity-30"}`} />
                          </span>
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedData.map((record, idx) => {
                  const rowId = resolveRowId(record, idx);
                  const isExpanded = isExpandable && rowId === expandedRowId;
                  const isLast = idx === pagedData.length - 1;
                  return (
                    <Fragment key={rowId}>
                      <tr
                        className={`${isLast ? "" : "border-b border-border"} transition-[background-color] hover:bg-hover ${isExpandable ? "cursor-pointer" : ""}`}
                        tabIndex={isExpandable ? 0 : undefined}
                        aria-expanded={isExpandable ? isExpanded : undefined}
                        onClick={() => {
                          if (isExpandable) {
                            onToggleExpand!(expandedRowId === rowId ? null : rowId);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (isExpandable) {
                              onToggleExpand!(expandedRowId === rowId ? null : rowId);
                            }
                          }
                        }}
                      >
                        {columns.map((col) => (
                          <td key={col.id} className={`py-1.5 px-2 ${col.hiddenMd ? "hidden md:table-cell" : ""}`} style={{ width: col.width, textAlign: col.align || "left" }}>
                            {col.cell(record)}
                          </td>
                        ))}
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={columns.length} className="p-0">
                            {renderExpandedRow?.(record)}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {sortedData.length > effectivePageSize && (
            <Pagination page={page} totalPages={totalPages} onChange={(p) => { if (p < page) prevPage(); else if (p > page) nextPage(); }} className="pt-1 self-center" />
          )}
        </>
      )}
    </div>
  );
}
