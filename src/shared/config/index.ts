export const FIVE_MINUTES = 5 * 60_000;
export const THIRTY_MINUTES = 30 * 60_000;
export const HEALTH_CHECK_INTERVAL = 30 * 1000;
export const SYSTEM_STATS_INTERVAL = 30 * 1_000;

export const STORAGE_KEYS = {
  lang: "lang",
  theme: "theme",
  compare: "compare-store",
  cacheVersion: "app_cache_ver",
} as const;

const DEFAULT_BACK = "backToModelRankings" as const;

export const MODEL_SOURCES = {
  aa: { labelKey: "modelRankings" as const, backTo: "/models", backLabelKey: DEFAULT_BACK },
  or: { labelKey: "openRouterRankings" as const, backTo: "/models", backLabelKey: DEFAULT_BACK },
  os: { labelKey: "openSourceRankings" as const, backTo: "/open-source", backLabelKey: "backToOpenSourceRankings" as const },
  hall: { labelKey: "hallucinationRankings" as const, backTo: "/hallucinations", backLabelKey: DEFAULT_BACK },
  tts: { labelKey: "tts" as const, backTo: "/tts", backLabelKey: DEFAULT_BACK },
} as const;

export type ModelSource = keyof typeof MODEL_SOURCES;

export const upstreamConfig = {
  arena: "https://arena.ai/leaderboard",
  arenaRoot: "https://arena.ai",
  artificialAnalysis: "https://artificialanalysis.ai",
  huggingface: "https://huggingface.co/api/models",
  openrouter: "https://openrouter.ai",
  polymarket: "https://gamma-api.polymarket.com",
} as const;

export const HEALTH_TIMEOUT_MS = 15_000;
export const USER_AGENT = "ModelObservatory/3.0 (fresh-build)";

export const PRICING_BLENDS = {
  INPUT_3_OUTPUT_1: "0_3_1",
  INPUT_7_OUTPUT_2_1: "7_2_1",
  INPUT_0_OUTPUT_1_1: "0_1_1",
  INPUT_0_OUTPUT_100_1: "0_100_1",
  INPUT_100_OUTPUT_1_1: "100_1_1",
} as const;

export const DEFAULT_TTL_MS = FIVE_MINUTES;
export const NEWS_TTL_MS = THIRTY_MINUTES;
export const HEALTH_TTL_MS = 60 * 1_000;
export const POLYMARKET_TAGS_TTL_MS = 24 * 60 * 60 * 1_000;
export const START_TTL_MS = 24 * 60 * 60 * 1_000;
export const PARTIAL_FAIL_TTL_MS = 60_000;

export const apiBase = import.meta.env?.VITE_API_BASE?.replace(/\/+$/, "") ?? "";

export const REPO_URL = "https://github.com/XELZSSS/modelobservatory";

const VENTUREBEAT_AI = "https://venturebeat.com/category/ai/feed/";
const ARS_TECHNICA = "https://feeds.arstechnica.com/arstechnica/index";
const WIRED = "https://www.wired.com/feed/tag/ai/latest/rss";
const TECHCRUNCH_AI = "https://techcrunch.com/category/artificial-intelligence/feed/";
const ZDNET = "https://www.zdnet.com/topic/artificial-intelligence/rss.xml";
const TECHCRUNCH_STARTUPS = "https://techcrunch.com/category/startups/feed/";
const CRUNCHBASE = "https://news.crunchbase.com/feed/";
const HF_BLOG = "https://huggingface.co/blog/feed.xml";
const ANALYTICS_VIDHYA = "https://www.analyticsvidhya.com/blog/category/artificial-intelligence/feed/";
const MIT_TECH_REVIEW = "https://www.technologyreview.com/topic/artificial-intelligence/feed/";

export const rssConfig = {
  industry: [VENTUREBEAT_AI, TECHCRUNCH_AI, ARS_TECHNICA, WIRED, MIT_TECH_REVIEW],
  opensource: [ANALYTICS_VIDHYA, HF_BLOG],
  hardware: [ZDNET],
  funding: [TECHCRUNCH_STARTUPS, CRUNCHBASE],
} as const;

export const BENCHMARK_KEYS = [
  "aime25",
  "gpqa",
  "hle",
  "mmlu_pro",
  "math_500",
  "humaneval",
  "livecodebench",
  "gdpval",
  "scicode",
  "ifbench",
  "lcr",
  "tau2",
  "tau-banking",
  "terminalbench-v2-1",
  "terminalbench-hard",
  "critpt",
  "apex-agents",
  "omniscience",
] as const;