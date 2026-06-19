import { Card, CardContent } from "../../shared/components/ui/card";
import type { HomeProviderStat } from "./useHomeDashboardData";

export function ProviderSpeedCard({ providerStats }: { providerStats: HomeProviderStat[] }) {
  return (
    <Card className="h-fit hidden md:block">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {providerStats.slice(0, 6).map((p) => (
            <div key={p.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <span className="text-sm font-medium truncate">{p.name}</span>
              </div>
              <span className="text-sm font-mono font-semibold ml-3 shrink-0">{p.avgSpeed.toFixed(1)} tok/s</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
