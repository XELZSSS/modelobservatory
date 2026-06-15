// ── upstream URLs ──────────────────────────────────────────────
export const upstreamConfig = {
  arena: "https://arena.ai/leaderboard",
  artificialAnalysis: "https://artificialanalysis.ai",
  huggingface: "https://huggingface.co/api/models",
  openrouter: "https://openrouter.ai",
} as const;

// ── HTTP constants ─────────────────────────────────────────────
export const HEALTH_TIMEOUT_MS = 15_000;
export const USER_AGENT = "ModelObservatory/1.0 (+https://github.com/model-observatory)";

// ── cache TTLs ─────────────────────────────────────────────────
export const DEFAULT_TTL_MS = 5 * 60 * 1_000;
export const NEWS_TTL_MS = 30 * 60 * 1_000;
export const HEALTH_TTL_MS = 60 * 1_000;
export const START_TTL_MS = 24 * 60 * 60 * 1_000;

// ── API base ───────────────────────────────────────────────────
export const apiBase = import.meta.env?.VITE_API_BASE?.replace(/\/+$/, "") ?? "";

// ── RSS feed URLs ──────────────────────────────────────────────
const TECHCRUNCH_AI = "https://techcrunch.com/category/artificial-intelligence/feed/";
const ARS_TECHNICA = "https://feeds.arstechnica.com/arstechnica/index";
const HF_BLOG = "https://huggingface.co/blog/feed.xml";
const ANALYTICS_VIDHYA = "https://www.analyticsvidhya.com/blog/category/artificial-intelligence/feed/";
const VENTUREBEAT_AI = "https://venturebeat.com/category/ai/feed/";

export const rssConfig = {
  official: [TECHCRUNCH_AI, VENTUREBEAT_AI],
  industry: [ARS_TECHNICA, "https://www.wired.com/feed/tag/ai/latest/rss"],
  research: ["https://export.arxiv.org/rss/cs.AI", HF_BLOG],
  agentic: ["https://www.technologyreview.com/topic/artificial-intelligence/feed/", ANALYTICS_VIDHYA],
  policy: [TECHCRUNCH_AI, ARS_TECHNICA],
  hardware: [VENTUREBEAT_AI, "https://www.zdnet.com/topic/artificial-intelligence/rss.xml"],
  funding: ["https://techcrunch.com/category/startups/feed/", "https://news.crunchbase.com/feed/"],
  opensource: [HF_BLOG, ANALYTICS_VIDHYA],
} as const;
