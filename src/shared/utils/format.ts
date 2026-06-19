import type { TFunction, TranslationKey } from "../i18n";
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

export function formatScore(t: TFunction, n?: number | null, opts?: { decimals?: number }) {
  if (typeof n !== "number" || !Number.isFinite(n)) return t("notAvailable");
  return n.toFixed(opts?.decimals ?? 2);
}

export function formatCompactDollar(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(2)}`;
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

export function formatDollar(v: number | null | undefined, t?: TFunction): string {
  if (typeof v !== "number" || !Number.isFinite(v)) return t?.("notAvailable") ?? "N/A";
  return `$${v.toFixed(2)}`;
}

export function formatPricePerMillion(t: TFunction, v?: number | null) {
  if (typeof v === "number") return `$${v.toFixed(2)}${t("perMTokens")}`;
  return t("notAvailable");
}

export function formatTrend(change?: number | null, t?: TFunction): string {
  if (change == null) return t ? t("notAvailable") : "N/A";
  return `${change >= 0 ? "+" : ""}${(change * 100).toFixed(1)}%`;
}

const REC_RULES: [RegExp, TranslationKey][] = [
  [/claude-3[.-]5-sonnet/, "recClaude"],
  [/deepseek-[vr]/, "recDeepSeek"],
  [/gpt-[45]/, "recGpt"],
  [/gemini/, "recGemini"],
  [/mimo/, "recMiMo"],
];

export function getRecommendation(id: string, t: TFunction): string {
  const lower = id.toLowerCase();
  const match = REC_RULES.find(([re]) => re.test(lower));
  return t(match ? match[1] : "recDefault");
}

const CAT_MAP: Record<string, TranslationKey> = { coding: "catCoding", reasoning: "catReasoning" };

export function categoryLabel(cat: string, t: TFunction): string {
  return t(CAT_MAP[cat] ?? "catGeneral");
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
