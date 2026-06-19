import { memo } from "react";
import { StatCard } from "../../shared/components/composite/StatCard";
import type { HomeKpi } from "./useHomeDashboardData";

export const KpiStrip = memo(function KpiStrip({ kpis }: { kpis: HomeKpi[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-2.5">
      {kpis.map((kpi, i) => (
        <div key={kpi.label} className={i >= 2 ? "hidden sm:block" : ""}>
          <StatCard icon={kpi.Icon} label={kpi.label} value={kpi.value} />
        </div>
      ))}
    </div>
  );
});
