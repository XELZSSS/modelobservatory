import { useReducer, useMemo, useCallback, useState } from "react";
import type { DataTableColumn } from "./DataTable";

type SortDir = "asc" | "desc" | null;

interface SortState {
  col: string | null;
  dir: SortDir;
}

function sortReducer(state: SortState, action: { type: "toggle"; colId: string }): SortState {
  if (state.col !== action.colId) return { col: action.colId, dir: "asc" };
  if (state.dir === "asc") return { col: action.colId, dir: "desc" };
  return { col: null, dir: null };
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

export function useTableSort<T>(data: T[], columns: DataTableColumn<T>[]) {
  const [sortState, dispatch] = useReducer(sortReducer, { col: null, dir: null });

  const sortedData = useMemo(() => {
    if (!sortState.col || !sortState.dir) return data;
    const col = columns.find((c) => c.id === sortState.col);
    if (!col?.accessorFn) return data;
    const dir = sortState.dir === "asc" ? 1 : -1;
    const indexed = data.map((d, i) => [d, i] as const);
    indexed.sort((a, b) => {
      const r = compareValues(col.accessorFn!(a[0]), col.accessorFn!(b[0]));
      if (r !== 0) return r * dir;
      return a[1] - b[1];
    });
    return indexed.map((entry) => entry[0]);
  }, [data, sortState, columns]);

  const toggleSort = useCallback((colId: string) => {
    dispatch({ type: "toggle", colId });
  }, []);

  return { sortedData, sortState, toggleSort } as const;
}

export function useTablePagination<T>(data: T[], pageSize: number) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedData = data.length > pageSize ? data.slice((safePage - 1) * pageSize, safePage * pageSize) : data;

  const goToPage = useCallback((p: number) => setPage(Math.max(1, Math.min(p, totalPages))), [totalPages]);
  const nextPage = useCallback(() => setPage((prev) => Math.min(prev + 1, totalPages)), [totalPages]);
  const prevPage = useCallback(() => setPage((prev) => Math.max(1, prev - 1)), []);
  const resetPage = useCallback(() => setPage(1), []);

  return { page: safePage, totalPages, pagedData, goToPage, nextPage, prevPage, resetPage } as const;
}
