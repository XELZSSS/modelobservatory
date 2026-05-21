import type { TFunction } from "../i18n";
import type { ArtificialAnalysisModel } from "../types";

export function safeHref(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") return url;
  } catch {
    /* invalid URL */
  }
  return undefined;
}

export function formatBoolean(t: TFunction, value?: boolean | null) {
  if (value === true) return t("yes");
  if (value === false) return t("no");
  return t("notAvailable");
}

export function formatShortNumber(n: number) {
  if (!Number.isFinite(n)) return "—";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(2)}K`;
  return `${sign}${abs}`;
}

export function formatScore(t: TFunction, n?: number | null) {
  if (typeof n !== "number") return t("notAvailable");
  return n.toFixed(2);
}

export function formatCost(t: TFunction, n?: number | null) {
  if (typeof n !== "number" || !Number.isFinite(n)) return t("notAvailable");
  return `${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatContext(t: TFunction, model: ArtificialAnalysisModel) {
  if (model.contextWindowFormatted) return model.contextWindowFormatted;
  if (!model.context_window_tokens) return t("notAvailable");
  if (model.context_window_tokens >= 1000000) return `${Math.round(model.context_window_tokens / 1000000)}m`;
  if (model.context_window_tokens >= 1000) return `${Math.round(model.context_window_tokens / 1000)}k`;
  return model.context_window_tokens.toLocaleString();
}

export function formatPricePerMillion(t: TFunction, v?: number | null) {
  if (typeof v === "number") return `$${v.toFixed(2)}${t("perMTokens")}`;
  return t("notAvailable");
}

export function formatTrend(change?: number | null, t?: TFunction): string {
  if (change == null) return t ? t("notAvailable") : "N/A";
  return `${change >= 0 ? "+" : ""}${(change * 100).toFixed(1)}%`;
}

export function getRecommendation(id: string, t: TFunction): string {
  const lowerId = id.toLowerCase();
  if (lowerId.includes("claude-3-5-sonnet") || lowerId.includes("claude-3.5-sonnet")) return t("recClaude");
  if (lowerId.includes("deepseek-v3") || lowerId.includes("deepseek-r1")) return t("recDeepSeek");
  if (lowerId.includes("gpt-4o") || lowerId.includes("gpt-5")) return t("recGpt");
  if (lowerId.includes("gemini")) return t("recGemini");
  if (lowerId.includes("mimo")) return t("recMiMo");
  return t("recDefault");
}

export function categoryLabel(cat: string, t: TFunction): string {
  if (cat === "coding") return t("catCoding");
  if (cat === "reasoning") return t("catReasoning");
  return t("catGeneral");
}

export function formatRelativeTime(isoString: string, t: TFunction): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return t("timeJustNow");
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return t("timeMinutesAgo", { value: diffMins });
  if (diffHours < 24) return t("timeHoursAgo", { value: diffHours });
  return t("timeDaysAgo", { value: diffDays });
}
