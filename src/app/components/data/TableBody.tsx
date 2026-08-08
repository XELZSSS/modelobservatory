import { memo, Fragment, type ReactNode } from "react";
import { cn } from "../../../shared/utils/cn";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { DataTableColumn } from "./DataTable";

interface TableBodyProps<T> {
  pagedData: T[];
  columns: DataTableColumn<T>[];
  getRowId?: (row: T) => string;
  isExpandable: boolean;
  expandedRowId?: string | null;
  onToggleExpand?: (rowId: string | null) => void;
  renderExpandedRow?: (row: T) => ReactNode;
}

function TableBodyInner<T>({
  pagedData,
  columns,
  getRowId,
  isExpandable,
  expandedRowId,
  onToggleExpand,
  renderExpandedRow,
}: TableBodyProps<T>) {
  return (
    <tbody>
      {pagedData.map((row, rowIndex) => {
        const rowId = getRowId?.(row) ?? String(rowIndex);
        const isExpanded = expandedRowId === rowId;
        return (
          <TableRow
            key={rowId}
            row={row}
            columns={columns}
            rowIndex={rowIndex}
            isExpandable={isExpandable}
            isExpanded={isExpanded}
            rowId={rowId}
            onToggleExpand={onToggleExpand}
            renderExpandedRow={renderExpandedRow}
          />
        );
      })}
    </tbody>
  );
}

interface TableRowProps<T> {
  row: T;
  columns: DataTableColumn<T>[];
  rowIndex: number;
  isExpandable: boolean;
  isExpanded: boolean;
  rowId: string;
  onToggleExpand?: (rowId: string | null) => void;
  renderExpandedRow?: (row: T) => ReactNode;
}

function TableRow<T>({ row, columns, rowIndex, isExpandable, isExpanded, rowId, onToggleExpand, renderExpandedRow }: TableRowProps<T>) {
  const toggle = () => onToggleExpand?.(isExpanded ? null : rowId);
  return (
    <Fragment>
      <tr
        aria-expanded={isExpandable ? isExpanded : undefined}
        className={cn(
          "border-b border-border transition-colors",
          rowIndex % 2 === 0 ? "bg-bg-card" : "bg-bg-primary",
          "hover:bg-hover",
          isExpanded && "bg-accent-light",
        )}
        onClick={isExpandable ? toggle : undefined}
        onKeyDown={
          isExpandable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle();
                }
              }
            : undefined
        }
        role={isExpandable ? "button" : undefined}
        tabIndex={isExpandable ? 0 : undefined}
      >
        {columns.map((col, colIdx) => (
          <td
            key={col.id}
            className={cn(
              "px-3 py-3",
              col.align === "right" && "text-right",
              col.align === "center" && "text-center",
              col.hiddenMd && "hidden md:table-cell",
              isExpandable && "cursor-pointer",
            )}
            style={{ width: col.width }}
          >
            <div className="flex items-center gap-2 min-w-0">
              {isExpandable && colIdx === 0 && (
                <span className="shrink-0 text-text-secondary">{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
              )}
              {col.cell(row)}
            </div>
          </td>
        ))}
      </tr>
      {isExpanded && renderExpandedRow && (
        <tr className="border-b border-border bg-bg-secondary/50">
          <td colSpan={columns.length} className="p-0">
            {renderExpandedRow(row)}
          </td>
        </tr>
      )}
    </Fragment>
  );
}

export const TableBody = memo(TableBodyInner) as typeof TableBodyInner;