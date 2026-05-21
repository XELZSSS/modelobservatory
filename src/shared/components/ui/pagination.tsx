import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { textSecondaryClass } from "../../utils/cssConstants";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft size={16} />
      </Button>
      <span className={`${textSecondaryClass} tabular-nums`} aria-live="polite">
        {page} / {totalPages}
      </span>
      <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
