import { CheckCircle, XCircle, Clock, Zap } from "lucide-react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SectionHeader } from "../../shared/components/composite/SectionHeader";
import { Card, CardContent } from "../../shared/components/ui/card";
import type { HealthEntry } from "../../shared/types";
import { useSuspenseHealthStatus } from "../../shared/hooks/useQueries";
import { SuspenseQuery } from "../../shared/components/feedback/SuspenseQuery";

function HealthStatusBadge({ status, label }: { status: HealthEntry["status"]; label?: string }) {
  const { t } = useTranslation();
  const text = label ?? (status === "ok" ? t("statusOk") : t("statusError"));
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${status === "ok" ? "text-green-500" : "text-destructive"}`}>
      {status === "ok" ? <CheckCircle size={12} /> : <XCircle size={12} />}
      {text}
    </span>
  );
}

function DataSourceCard({ entry }: { entry: HealthEntry }) {
  const { t } = useTranslation();
  const ok = entry.status === "ok";

  return (
    <Card style={ok ? undefined : { borderColor: "rgba(252,83,58,0.4)", backgroundColor: "rgba(252,83,58,0.05)" }}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold truncate">{entry.name}</p>
          {ok ? <CheckCircle size={14} className="shrink-0 text-green-500" /> : <XCircle size={14} className="shrink-0 text-destructive" />}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Zap size={12} className="shrink-0" />
            <span>{ok ? `${entry.responseTime}ms` : t("notAvailable")}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Clock size={12} className="shrink-0" />
            <span>{ok ? `HTTP ${entry.statusCode}` : t("statusError")}</span>
          </div>
          {!ok && entry.detail && (
            <p className="text-xs text-destructive mt-1 truncate">{entry.detail}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusContent() {
  const { t } = useTranslation();
  const { data } = useSuspenseHealthStatus();

  const allOk = data.length > 0 && data.every((e) => e.status === "ok");
  const okCount = data.filter((e) => e.status === "ok").length;
  const errorCount = data.length - okCount;

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader title={t("systemStatus")} />

      <div className="flex flex-row gap-2 items-center">
        <p className="text-sm font-bold">{t("overallStatus")}</p>
        <HealthStatusBadge status={allOk ? "ok" : "error"} label={allOk ? t("allHealthy") : t("hasIssues")} />
        <span className="text-xs text-text-secondary">
          ({okCount}/{data.length})
        </span>
      </div>

      {errorCount > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-destructive">{t("hasIssues")} ({errorCount})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.filter((e) => e.status !== "ok").map((entry) => (
              <DataSourceCard key={entry.name} entry={entry} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.filter((e) => e.status === "ok").map((entry) => (
          <DataSourceCard key={entry.name} entry={entry} />
        ))}
      </div>
    </div>
  );
}

export function StatusView() {
  return (
    <SuspenseQuery>
      <StatusContent />
    </SuspenseQuery>
  );
}
