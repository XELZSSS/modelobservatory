import { memo, useState, useEffect, type ReactNode } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSystemStats } from "../../shared/hooks/useQueries";
import { textSecondaryClass } from "../../shared/utils/cssConstants";

export const StatusBarPill = memo(function StatusBarPill({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center px-1.5 py-[3px] border border-border rounded-md bg-bg-primary">
      <span className={`${textSecondaryClass} whitespace-nowrap tabular-nums`}>{children}</span>
    </div>
  );
});

export function UptimeDisplay() {
  const { t } = useTranslation();
  const statsQ = useSystemStats();
  const uptime = statsQ.data?.uptime ?? 0;

  function fmtUptime(s: number): string {
    if (s < 60) return t("uptimeSeconds", { value: Math.round(s) });
    if (s < 3600) return t("uptimeMinutes", { value: Math.floor(s / 60), value2: Math.round(s % 60) });
    if (s < 86400) return t("uptimeHours", { value: Math.floor(s / 3600), value2: Math.floor((s % 3600) / 60) });
    return t("uptimeDays", { value: Math.floor(s / 86400), value2: Math.floor((s % 86400) / 3600) });
  }

  if (uptime <= 0) return null;

  return (
    <StatusBarPill>
      {t("uptime")}: {fmtUptime(uptime)}
    </StatusBarPill>
  );
}

export const ClockDisplay = memo(function ClockDisplay() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  const text = now.toLocaleString(undefined, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  return <StatusBarPill>{text}</StatusBarPill>;
});
