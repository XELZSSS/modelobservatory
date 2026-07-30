import { memo } from "react";
import { cn } from "../../utils/cn";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { DataTableColumn } from "./DataTable";
import type { SortState } from "./useTableState";

interface TableHeaderProps<T> {
  columns: DataTableColumn<T>[];
  sortState: SortState;
  onSort: (colId: string) => void;
}

export function TableHeader<T>({ columns, sortState, onSort }: TableHeaderProps<T>) {
  return (
    <thead>
      <tr className="border-b border-border bg-bg-secondary">
        {columns.map((col) => {
          const isSorted = sortState.col === col.id;
          const isHidden = col.hiddenMd;
          return (
            <th
              key={col.id}
              className={cn(
                "px-3 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider",
                col.align === "right" && "text-right",
                col.align === "center" && "text-center",
                isHidden && "hidden md:table-cell",
                col.sortable && "cursor-pointer hover:text-text-primary select-none",
              )}
              style={{ width: col.width }}
              onClick={() => col.sortable && onSort(col.id)}
            >
              <span className="inline-flex items-center gap-1">
                {col.header}
                {col.sortable && isSorted && (
                  sortState.dir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                )}
              </span>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
