import { memo } from "react";

interface RankingNameCellProps {
  name: string;
  suffix?: React.ReactNode;
}

export const RankingNameCell = memo(function RankingNameCell({ name, suffix }: RankingNameCellProps) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <p className="text-sm font-semibold break-words min-w-0">{name}</p>
      {suffix}
    </div>
  );
});