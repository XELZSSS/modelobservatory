import { memo } from "react";
import { getRankColor } from "../rankColor";
import { numberTextClass } from "../../utils/cssConstants";

export const RankBadge = memo(function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const base = getRankColor(rank);
    return (
      <span
        className={`inline-flex size-7 items-center justify-center rounded-[4px] text-xs font-extrabold leading-none transition-all duration-200 ${numberTextClass}`}
        style={{ backgroundColor: base, color: "#ffffff" }}
      >
        {rank}
      </span>
    );
  }

  return (
    <span className={`inline-flex size-7 items-center justify-center rounded-[4px] text-xs font-bold leading-none ${numberTextClass}`} style={{ color: "#8a8a8a" }}>
      {rank}
    </span>
  );
});
