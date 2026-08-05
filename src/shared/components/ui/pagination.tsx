import { memo, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { cn } from "../../utils/cn";
import { useTranslation } from "../../i18n/useTranslation";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

export const Pagination = memo(function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button variant="outline" size="icon" aria-label={t("previousPage")} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft size={16} />
      </Button>
      <span className="text-sm text-text-secondary tabular-nums" aria-live="polite">
        {page} / {totalPages}
      </span>
      <Button variant="outline" size="icon" aria-label={t("nextPage")} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        <ChevronRight size={16} />
      </Button>
    </div>
  );
});
