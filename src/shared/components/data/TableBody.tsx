import { Fragment, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import type { DataTableColumn } from "./DataTable";

export function TableBody<T>({
  pagedData,
  columns,
  getRowId,
  isExpandable,
  expandedRowId,
  onToggleExpand,
  renderExpandedRow,
}: {
  pagedData: T[];
  columns: DataTableColumn<T>[];
  getRowId?: (row: T) => string;
  isExpandable: boolean;
  expandedRowId?: string | null;
  onToggleExpand?: (rowId: string | null) => void;
  renderExpandedRow?: (row: T) => ReactNode;
}) {
  return (
    <tbody>
      {pagedData.map((record, idx) => {
        const rowId = getRowId?.(record) ?? String(idx);
        const isExpanded = isExpandable && rowId === expandedRowId;
        const isLast = idx === pagedData.length - 1;
        return (
          <Fragment key={rowId}>
            <tr
              className={cn(!isLast && "border-b border-border", "transition-[background-color] hover:bg-hover", isExpandable && "cursor-pointer")}
              tabIndex={isExpandable ? 0 : undefined}
              aria-expanded={isExpandable ? isExpanded : undefined}
              onClick={() => {
                if (isExpandable) onToggleExpand!(expandedRowId === rowId ? null : rowId);
              }}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && isExpandable) {
                  e.preventDefault();
                  onToggleExpand!(expandedRowId === rowId ? null : rowId);
                }
              }}
            >
              {columns.map((col) => (
                <td
                  key={col.id}
                  className={cn("py-2 px-2.5 break-words min-w-0", col.align === "right" && "tabular-nums font-mono", col.hiddenMd && "hidden md:table-cell")}
                  style={{ width: col.width, textAlign: col.align || "left" }}
                >
                  {col.cell(record)}
                </td>
              ))}
            </tr>
            {isExpanded && (
              <tr>
                <td colSpan={columns.length} className="p-0 bg-bg-secondary border-t border-border">
                  {renderExpandedRow?.(record)}
                </td>
              </tr>
            )}
          </Fragment>
        );
      })}
    </tbody>
  );
}
