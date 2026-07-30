import { CheckCircle, XCircle, Clock, Zap } from "lucide-react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle";
import { SectionHeader } from "../../shared/components/composite/SectionHeader";
import { Card, CardContent } from "../../shared/components/ui/card";
import type { HealthEntry } from "../../shared/types";
import { useSuspenseHealthStatus } from "../../shared/hooks/useApiQuery";
import { SuspenseQuery } from "../../shared/components/feedback/SuspenseQuery";
import { PageContainer, PageHeader, PageSection } from "../../shared/components/layout/PageContainer";

function HealthStatusBadge({ status, label }: { status: HealthEntry["status"]; label?: string }) {
  const { t } = useTranslation();
  const text = label ?? (status === "ok" ? t("statusOk") : t("statusError"));
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${status === "ok" ? "text-success" : "text-destructive"}`}>
      {status === "ok" ? <CheckCircle size={12} /> : <XCircle size={12} />}
      {text}
    </span>
  );
}

function DataSourceCard({ entry }: { entry: HealthEntry }) {
  const { t } = useTranslation();
  const ok = entry.status === "ok";

  return (
    <Card className={ok ? "" : "border-destructive/30"}>
      {!ok && <div className="h-1 bg-destructive shrink-0" />}
      <CardContent padding="md">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold truncate">{entry.name}</p>
          {ok ? <CheckCircle size={14} className="shrink-0 text-success" /> : <XCircle size={14} className="shrink-0 text-destructive" />}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Zap size={12} className="shrink-0" />
            <span>{ok ? `${entry.responseTime}ms` : t("notAvailable")}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Clock size={12} className="shrink-0" />
            <span>{ok ? `HTTP ${entry.statusCode}` : t("statusError")}</span>
          </div>
          {!ok && entry.detail && <p className="text-xs text-destructive mt-1 truncate">{entry.detail}</p>}
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
    <PageContainer>
      <PageHeader title={t("systemStatus")} />
      <div className="flex items-center gap-3 mb-6 p-4 rounded-lg border border-border bg-bg-card">
        <p className="text-sm font-semibold">{t("overallStatus")}</p>
        <HealthStatusBadge status={allOk ? "ok" : "error"} label={allOk ? t("allHealthy") : t("hasIssues")} />
        <span className="text-xs text-text-secondary">
          ({okCount}/{data.length})
        </span>
      </div>

      {errorCount > 0 && (
        <PageSection title={t("hasIssues")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data
              .filter((e) => e.status !== "ok")
              .map((entry) => (
                <DataSourceCard key={entry.name} entry={entry} />
              ))}
          </div>
        </PageSection>
      )}

      <PageSection title={t("healthySources")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data
            .filter((e) => e.status === "ok")
            .map((entry) => (
              <DataSourceCard key={entry.name} entry={entry} />
            ))}
        </div>
      </PageSection>
    </PageContainer>
  );
}

export function StatusView() {
  const { t } = useTranslation();
  useDocumentTitle(t("systemStatus"));
  return (
    <SuspenseQuery>
      <StatusContent />
    </SuspenseQuery>
  );
}
