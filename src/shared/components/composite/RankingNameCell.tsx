import { memo } from "react";
import { modelCellClass, modelNameCellClass } from "../../utils/cssConstants";

interface RankingNameCellProps {
  name: string;
  suffix?: React.ReactNode;
}

export const RankingNameCell = memo(function RankingNameCell({ name, suffix }: RankingNameCellProps) {
  return (
    <div className={modelCellClass}>
      <p className={modelNameCellClass}>{name}</p>
      {suffix}
    </div>
  );
});
