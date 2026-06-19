/** Maximum number of models in comparison view */
export const MAX_COMPARE_MODELS = 4;

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
export const MODEL_SOURCES = {
  aa:   { labelKey: "modelRankings" as const,         backTo: "/models",         backLabelKey: "backToModelRankings" as const },
  or:   { labelKey: "openRouterRankings" as const,    backTo: "/rankings",       backLabelKey: "backToModelRankings" as const },
  os:   { labelKey: "openSourceRankings" as const,    backTo: "/open-source",    backLabelKey: "backToOpenSourceRankings" as const },
  hall: { labelKey: "hallucinationRankings" as const, backTo: "/hallucinations", backLabelKey: "backToModelRankings" as const },
  tts:  { labelKey: "tts" as const,                  backTo: "/tts",            backLabelKey: "backToModelRankings" as const },
} as const;

export type ModelSource = keyof typeof MODEL_SOURCES;
