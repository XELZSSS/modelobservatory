import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";
import type { DataTableColumn } from "./DataTable";

export function TableHeader<T>({
  columns,
  sortState,
  onSort,
}: {
  columns: DataTableColumn<T>[];
  sortState: { col: string | null; dir: "asc" | "desc" | null };
  onSort: (colId: string) => void;
}) {
  return (
    <thead>
      <tr className="bg-bg-secondary">
        {columns.map((col) => (
          <th
            key={col.id}
            className={cn("py-2 px-2.5 font-semibold text-text-secondary whitespace-nowrap border-b border-border", col.hiddenMd && "hidden md:table-cell")}
            style={{ width: col.width, textAlign: col.align || "left" }}
            aria-sort={col.sortable ? (sortState.col === col.id ? (sortState.dir === "asc" ? "ascending" : "descending") : "none") : undefined}
          >
            {col.sortable ? (
              <button
                type="button"
                className="inline-flex items-center gap-1 hover:text-text-primary transition-colors cursor-pointer"
                style={{ textAlign: col.align || "left" }}
                onClick={() => onSort(col.id)}
              >
                {col.header}
                <span className="inline-flex flex-col leading-none">
                  <ChevronUp size={10} className={sortState.col === col.id && sortState.dir === "asc" ? "text-text-primary" : "opacity-30"} />
                  <ChevronDown size={10} className={cn("-mt-0.5", sortState.col === col.id && sortState.dir === "desc" ? "text-text-primary" : "opacity-30")} />
                </span>
              </button>
            ) : (
              col.header
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
}
