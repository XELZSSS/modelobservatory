import { withCacheTtl } from "../cache";
import { fetchJSON } from "../fetch";
import { errorMessage } from "../errors";
import { deduplicateBy, formatSettleErrors, settledValues } from "../utils";
import type { ModelPrediction, ReleasePrediction, ProviderPrediction, PredictionsPayload } from "../../shared/types";
import { upstreamConfig, DEFAULT_TTL_MS } from "../../shared/config";

const API = upstreamConfig.polymarket;
const TOP_N = 6;

// ── Tag discovery ─────────────────────────────────────────────
// Polymarket tags are versioned by numeric id and the ids rotate over time
// (e.g. the old "gemini-ultra" tag id 661 is now dead). Instead of hardcoding
// ids we discover AI-related tags dynamically from /tags and filter markets
// by tag_id (tag_slug silently falls back to unrelated default markets).
const TAGS_TTL_MS = 24 * 60 * 60 * 1_000;
const TAGS_PAGE_LIMIT = 100;
const TAGS_MAX_OFFSET = 3_000;
const MAX_AI_TAGS = 15;

const AI_TAG_PATTERN = /(^|[^a-z0-9])(ai|gpt|llm)([^a-z0-9]|$)|openai|chatgpt|claude|gemini|grok|deepseek|anthropic|qwen|mistral|llama|alibaba|nvidia|xiaomi|artificial|machine|agent|big-tech|tech-release|\btech\b|\bipo\b|\bxai\b|\bgoogle\b|\bamazon\b|\bmeta\b/i;

const FALLBACK_TAGS: { id: string; slug: string }[] = [
  { id: "537", slug: "openai" },
  { id: "103303", slug: "claude" },
  { id: "439", slug: "ai" },
  { id: "662", slug: "llm" },
];

interface Tag {
  id: string;
  slug: string;
}

async function discoverAiTags(): Promise<Tag[]> {
  return withCacheTtl("polymarket:ai-tags", TAGS_TTL_MS, async () => {
    const found: Tag[] = [];
    for (let offset = 0; offset <= TAGS_MAX_OFFSET; offset += TAGS_PAGE_LIMIT) {
      let page: Tag[] | null = null;
      try {
        page = await fetchJSON<Tag[]>(`${API}/tags?limit=${TAGS_PAGE_LIMIT}&offset=${offset}`);
      } catch {
        break;
      }
      if (!Array.isArray(page) || page.length === 0) break;
      for (const t of page) {
        if (typeof t.id === "string" && typeof t.slug === "string" && AI_TAG_PATTERN.test(t.slug.toLowerCase())) {
          found.push({ id: t.id, slug: t.slug });
        }
      }
      if (found.length >= MAX_AI_TAGS) break;
    }
    const unique = deduplicateBy(found, (t) => t.id);
    if (unique.length === 0) {
      // Discovery failed (API down/restructured): fall back to known-good ids,
      // with a short TTL so we retry discovery soon.
      console.warn("[polymarket] tag discovery returned nothing, using fallback tags");
      return { data: FALLBACK_TAGS, ttl: 60_000 };
    }
    return { data: unique, ttl: TAGS_TTL_MS };
  });
}

interface Market {
  id: string;
  question: string;
  slug: string;
  outcomes: string;
  outcomePrices: string;
  volume: string;
  volume24hr: string;
  endDate: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  events?: { slug?: string }[];
}

const COMPANY_KEYWORDS: Record<string, string[]> = {
  OpenAI: ["openai", "gpt", "chatgpt", "o1", "o3", "o4"],
  Anthropic: ["anthropic", "claude"],
  Google: ["google", "gemini", "deepmind"],
  Meta: ["meta", "llama"],
  Microsoft: ["microsoft", "copilot"],
  xAI: ["xai", "grok"],
  Mistral: ["mistral"],
  DeepSeek: ["deepseek"],
  Alibaba: ["alibaba", "qwen", "z.ai"],
  NVIDIA: ["nvidia"],
  Apple: ["apple"],
  Amazon: ["amazon"],
  Perplexity: ["perplexity"],
};

function parseArr(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}
function parsePrices(raw: string): number[] {
  return parseArr(raw).map((s) => Number(s) || 0);
}
function parseOutcomes(m: Market) {
  return { outcomes: parseArr(m.outcomes), prices: parsePrices(m.outcomePrices) };
}
function detectCompany(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [company, kw] of Object.entries(COMPANY_KEYWORDS)) {
    if (kw.some((k) => lower.includes(k))) return company;
  }
  return null;
}

function classify(q: string): "model_ranking" | "release" | "provider" | "other" {
  const lower = q.toLowerCase();
  if (/release|launch|ship|come out/.test(lower)) return "release";
  if (/best.*model|top.*model|number.*1.*model/.test(lower)) return "model_ranking";
  if (/ipo|valuation|market cap/.test(lower)) return "provider";
  const company = detectCompany(q);
  if (company && /model|arena|benchmark|elo|intelligen|lab|frontier|score|agent/.test(lower)) return "model_ranking";
  return "other";
}

function yesProb(outcomes: string[], prices: number[]): number {
  for (let i = 0; i < outcomes.length; i++) {
    if (outcomes[i]?.toLowerCase() === "yes") return prices[i] || 0;
  }
  return prices.length > 0 ? Math.max(...prices) : 0;
}

function deadline(endDate: string): string {
  if (!endDate) return "";
  const d = new Date(endDate);
  return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0]!;
}

function marketUrl(m: Market): string {
  const eventSlug = m.events?.[0]?.slug || m.slug;
  return eventSlug ? `https://polymarket.com/event/${eventSlug}` : "";
}

function volume24h(m: Market): number {
  return Number(m.volume24hr) || Number(m.volume) || 0;
}

function sortByActivity<T extends { volume: number }>(items: T[]): T[] {
  return items.sort((a, b) => b.volume - a.volume).slice(0, TOP_N);
}

function settleOrThrow<T>(results: PromiseSettledResult<T[]>[], label: string): T[] {
  const valid = settledValues(results).filter((v): v is T[] => Array.isArray(v)).flatMap((v) => v);
  if (valid.length === 0) {
    const reasons = formatSettleErrors(results, ["tag fetch"]);
    throw new Error(`${label}: all upstream requests failed${reasons ? ` (${reasons})` : ""}`);
  }
  return valid;
}

async function fetchLiveMarkets(): Promise<Market[]> {
  const tags = await discoverAiTags();
  const results = await Promise.allSettled(
    tags.map((tag) =>
      fetchJSON<Market[]>(`${API}/markets?tag_id=${tag.id}&active=true&closed=false&limit=50&order=volume24hr&ascending=false`),
    ),
  );
  const markets = settleOrThrow(results, "Polymarket");

  // Keep only markets that are actually tradeable right now: open, not archived,
  // not expired, and with recent trading activity. Expired-but-unclosed markets
  // are a known gamma-api quirk and must not surface as live predictions.
  const now = Date.now();
  return deduplicateBy(
    markets.filter((m) => {
      const end = m.endDate ? Date.parse(m.endDate) : NaN;
      return m.active && !m.closed && !m.archived && (!Number.isNaN(end) ? end > now : true) && volume24h(m) > 0;
    }),
    (m) => m.id,
  );
}

function buildModelPredictions(markets: Market[]): ModelPrediction[] {
  return sortByActivity(
    markets
      .filter((m) => classify(m.question) === "model_ranking")
      .map((m) => {
        const company = detectCompany(m.question);
        if (!company) return null;
        const { outcomes, prices } = parseOutcomes(m);
        return {
          id: m.id,
          question: m.question,
          company,
          metric: m.question,
          probability: yesProb(outcomes, prices),
          volume: volume24h(m),
          deadline: deadline(m.endDate),
          url: marketUrl(m),
        };
      })
      .filter((x): x is ModelPrediction => x !== null),
  );
}

function buildReleasePredictions(markets: Market[]): ReleasePrediction[] {
  return sortByActivity(
    markets
      .filter((m) => classify(m.question) === "release")
      .map((m) => {
        const { outcomes, prices } = parseOutcomes(m);
        const modelMatch = m.question.match(/(?:GPT|Claude|Gemini|Llama|Grok)[\s-]?\d[\w.]*/i);
        return {
          id: m.id,
          question: m.question,
          model: modelMatch?.[0] || m.question.split("?")[0]?.trim() || m.question,
          predictions: outcomes.map((label, i) => ({ window: label, probability: prices[i] || 0 })),
          volume: volume24h(m),
          url: marketUrl(m),
        };
      }),
  );
}

function buildProviderPredictions(markets: Market[]): ProviderPrediction[] {
  return sortByActivity(
    markets
      .filter((m) => classify(m.question) === "provider")
      .map((m) => {
        const provider = detectCompany(m.question);
        if (!provider) return null;
        const { outcomes, prices } = parseOutcomes(m);
        const q = m.question.toLowerCase();
        return {
          id: m.id,
          question: m.question,
          provider,
          type: /ipo/.test(q) ? "ipo" : /market cap|largest/.test(q) ? "market_cap" : "valuation",
          options: outcomes.map((label, i) => ({ label, probability: prices[i] || 0 })),
          volume: volume24h(m),
          deadline: deadline(m.endDate),
          url: marketUrl(m),
        };
      })
      .filter((x): x is ProviderPrediction => x !== null),
  );
}

// NOTE: the try/catch must wrap `withCache` (not live inside its fn). Otherwise a failed
// fetch returns an empty payload that gets cached for the full TTL, so transient upstream
// errors keep users seeing empty data long after the upstream recovers.
export async function getPredictions(): Promise<PredictionsPayload> {
  try {
    return await withCacheTtl("polymarket:predictions", DEFAULT_TTL_MS, async () => {
      const markets = await fetchLiveMarkets();
      return {
        data: {
          modelRankings: buildModelPredictions(markets),
          releases: buildReleasePredictions(markets),
          providers: buildProviderPredictions(markets),
        },
        ttl: DEFAULT_TTL_MS,
      };
    });
  } catch (e) {
    console.error("[polymarket] predictions failed:", errorMessage(e));
    return { modelRankings: [], releases: [], providers: [] };
  }
}
