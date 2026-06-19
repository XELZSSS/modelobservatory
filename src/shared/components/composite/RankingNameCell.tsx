import { memo } from "react";
import { RankBadge } from "./RankBadge";
import { modelCellClass, modelNameCellClass } from "../../utils/cssConstants";

interface RankingNameCellProps {
  rank: number;
  name: string;
  /** Optional extra element rendered after the name */
  suffix?: React.ReactNode;
}

export const RankingNameCell = memo(function RankingNameCell({ rank, name, suffix }: RankingNameCellProps) {
  return (
    <div className={modelCellClass}>
      <RankBadge rank={rank} />
      <p className={modelNameCellClass}>{name}</p>
      {suffix}
    </div>
  );
});
