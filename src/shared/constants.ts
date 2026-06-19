/** Time constants (milliseconds) */
export const FIVE_MINUTES = 5 * 60_000;
export const THIRTY_MINUTES = 30 * 60_000;

/** Health check interval in milliseconds */
export const HEALTH_CHECK_INTERVAL = 30 * 1000;

/** System stats refresh interval */
export const SYSTEM_STATS_INTERVAL = 30 * 1_000;

/** LocalStorage keys */
export const STORAGE_KEYS = {
  lang: "lang",
  theme: "theme",
  compare: "compare-store",
  trendSnapshots: "trend_snapshots",
  cacheVersion: "app_cache_ver",
} as const;

/** Model detail page source configuration */
const DEFAULT_BACK = "backToModelRankings" as const;
export const MODEL_SOURCES = {
  aa:   { labelKey: "modelRankings" as const,         backTo: "/models",         backLabelKey: DEFAULT_BACK },
  or:   { labelKey: "openRouterRankings" as const,    backTo: "/rankings",       backLabelKey: DEFAULT_BACK },
  os:   { labelKey: "openSourceRankings" as const,    backTo: "/open-source",    backLabelKey: "backToOpenSourceRankings" as const },
  hall: { labelKey: "hallucinationRankings" as const, backTo: "/hallucinations", backLabelKey: DEFAULT_BACK },
  tts:  { labelKey: "tts" as const,                  backTo: "/tts",            backLabelKey: DEFAULT_BACK },
} as const;

export type ModelSource = keyof typeof MODEL_SOURCES;
