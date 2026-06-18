import { withCache } from "../cache";
import { CACHE_TTL_MS, fetchJSON } from "../http";
import { errorMessage } from "../errors";
import type { ModelPrediction, ReleasePrediction, ProviderPrediction, PredictionsPayload } from "../../shared/types";

const API = "https://gamma-api.polymarket.com";
const AI_TAGS = ["537", "103303", "661"];
const TOP_N = 6;

interface Market {
  id: string; question: string; outcomes: string; outcomePrices: string;
  volume: string; endDate: string; url: string; slug: string; active: boolean; closed: boolean;
}

const COMPANY_KEYWORDS: Record<string, string[]> = {
  OpenAI: ["openai", "gpt", "chatgpt", "o1", "o3", "o4"], Anthropic: ["anthropic", "claude"],
  Google: ["google", "gemini", "deepmind"], Meta: ["meta", "llama"], Microsoft: ["microsoft", "copilot"],
  xAI: ["xai", "grok"], Mistral: ["mistral"], DeepSeek: ["deepseek"],
  Alibaba: ["alibaba", "qwen", "z.ai"], NVIDIA: ["nvidia"], Apple: ["apple"],
  Amazon: ["amazon"], Perplexity: ["perplexity"],
};

function parseArr(raw: string): string[] { try { const v = JSON.parse(raw); return Array.isArray(v) ? v.map(String) : []; } catch { return []; } }
function parsePrices(raw: string): number[] { return parseArr(raw).map((s) => Number(s) || 0); }
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
  return detectCompany(q) ? "model_ranking" : "other";
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

function url(u: string): string { return u ? `https://polymarket.com${u}` : ""; }

function sortByVolume<T extends { volume: number }>(items: T[]): T[] {
  return items.sort((a, b) => b.volume - a.volume).slice(0, TOP_N);
}

function settleOrThrow<T>(results: PromiseSettledResult<T[]>[], label: string): T[] {
  const valid = results.flatMap((r) => (r.status === "fulfilled" && Array.isArray(r.value) ? r.value : []));
  if (valid.length === 0) {
    const reasons = results
      .map((r, i) => (r.status === "rejected" ? `tag ${AI_TAGS[i]}: ${r.reason instanceof Error ? r.reason.message : r.reason}` : null))
      .filter(Boolean)
      .join("; ");
    throw new Error(`${label}: all upstream requests failed${reasons ? ` (${reasons})` : ""}`);
  }
  return valid;
}

async function fetchMarkets(): Promise<Market[]> {
  const results = await Promise.allSettled(
    AI_TAGS.map((tag) => fetchJSON<Market[]>(`${API}/markets?tag_id=${tag}&active=true&closed=false&limit=50&order=volume&ascending=false`)),
  );
  const markets = settleOrThrow(results, "Polymarket");
  const seen = new Set<string>();
  return markets.filter((m) => m.active && !m.closed && !seen.has(m.id) && (seen.add(m.id), true));
}

function buildModelPredictions(markets: Market[]): ModelPrediction[] {
  return sortByVolume(markets.filter((m) => classify(m.question) === "model_ranking").map((m) => {
    const company = detectCompany(m.question);
    if (!company) return null;
    const outcomes = parseArr(m.outcomes);
    const prices = parsePrices(m.outcomePrices);
    return { id: m.id, question: m.question, company, metric: m.question, probability: yesProb(outcomes, prices), volume: Number(m.volume) || 0, deadline: deadline(m.endDate), url: url(m.url) };
  }).filter((x): x is ModelPrediction => x !== null));
}

function buildReleasePredictions(markets: Market[]): ReleasePrediction[] {
  return sortByVolume(markets.filter((m) => classify(m.question) === "release").map((m) => {
    const outcomes = parseArr(m.outcomes);
    const prices = parsePrices(m.outcomePrices);
    const modelMatch = m.question.match(/(?:GPT|Claude|Gemini|Llama|Grok)[\s-]?\d[\w.]*/i);
    return { id: m.id, question: m.question, model: modelMatch?.[0] || m.question.split("?")[0]?.trim() || m.question, predictions: outcomes.map((label, i) => ({ window: label, probability: prices[i] || 0 })), volume: Number(m.volume) || 0, url: url(m.url) };
  }));
}

function buildProviderPredictions(markets: Market[]): ProviderPrediction[] {
  return sortByVolume(markets.filter((m) => classify(m.question) === "provider").map((m) => {
    const provider = detectCompany(m.question);
    if (!provider) return null;
    const outcomes = parseArr(m.outcomes);
    const prices = parsePrices(m.outcomePrices);
    const q = m.question.toLowerCase();
    return { id: m.id, question: m.question, provider, type: /ipo/.test(q) ? "ipo" : /market cap|largest/.test(q) ? "market_cap" : "valuation", options: outcomes.map((label, i) => ({ label, probability: prices[i] || 0 })), volume: Number(m.volume) || 0, deadline: deadline(m.endDate), url: url(m.url) };
  }).filter((x): x is ProviderPrediction => x !== null));
}

// NOTE: the try/catch must wrap `withCache` (not live inside its fn). Otherwise a failed
// fetch returns an empty payload that gets cached for the full TTL, so transient upstream
// errors keep users seeing empty data long after the upstream recovers.
export async function getPredictions(): Promise<PredictionsPayload> {
  try {
    return await withCache("polymarket:predictions", CACHE_TTL_MS, async () => {
      const markets = await fetchMarkets();
      return {
        modelRankings: buildModelPredictions(markets),
        releases: buildReleasePredictions(markets),
        providers: buildProviderPredictions(markets),
      };
    });
  } catch (e) {
    console.error("[polymarket] predictions failed:", errorMessage(e));
    return { modelRankings: [], releases: [], providers: [] };
  }
}
