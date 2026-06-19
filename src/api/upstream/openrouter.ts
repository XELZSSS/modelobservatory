import { withCache, formatSettleErrors } from "../cache";
import { fetchJSON } from "../http";
import { numOr } from "../parsers/coerce";
import { upstreamConfig, DEFAULT_TTL_MS } from "../../shared/config";
import type { OpenRouterAppEntry, OpenRouterRankingsPayload, OpenRouterRankEntry } from "../../shared/types";

const OPENROUTER = upstreamConfig.openrouter;

const CREATORS: Record<string, string> = {
  anthropic: "Anthropic", cohere: "Cohere", deepseek: "DeepSeek", google: "Google",
  mistralai: "Mistral", "meta-llama": "Meta", minimax: "MiniMax", openai: "OpenAI",
  qwen: "Qwen", xiaomi: "Xiaomi",
};

interface ModelRow {
  date: string;
  model_permaslug: string;
  variant: string;
  variant_permaslug: string;
  total_completion_tokens: number;
  total_prompt_tokens: number;
  total_native_tokens_reasoning: number;
  total_native_tokens_cached: number;
  total_tool_calls: number;
  count: number;
  num_media_prompt: number;
  num_media_completion: number;
  num_audio_prompt: number;
  change: number | null;
}

interface AppRow {
  app_id: number;
  total_tokens: string;
  total_requests: number;
  app: { id: number; title: string; description: string; slug: string; main_url: string | null; origin_url: string; categories: string[] };
}

interface AppResponse { day: AppRow[]; week: AppRow[]; month: AppRow[] }

function creatorFromSlug(slug: string): string {
  const p = slug.split("/")[0] || "Unknown";
  return CREATORS[p.toLowerCase()] || p.charAt(0).toUpperCase() + p.slice(1);
}

function categoryFrom(slug: string, name: string): OpenRouterRankEntry["category"] {
  const v = `${slug} ${name}`.toLowerCase();
  if (/coder|coding|code/.test(v)) return "coding";
  if (/reasoning|thought|r1|-o1/.test(v)) return "reasoning";
  return "general";
}

function titleFromSlug(permaslug: string): string {
  return (permaslug.split("/").slice(1).join("/") || permaslug)
    .replace(/[:/]/g, " ").split("-").filter(Boolean)
    .map((p) => (p.length <= 3 || /^\d/.test(p) ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(" ");
}

const SUM_KEYS = ["total_prompt_tokens", "total_completion_tokens", "total_native_tokens_reasoning", "total_native_tokens_cached", "total_tool_calls", "count", "num_media_prompt", "num_media_completion", "num_audio_prompt"] as const;

function mergeRows(rows: ModelRow[]): ModelRow[] {
  const grouped = new Map<string, ModelRow>();
  let idx = 0;
  for (const row of rows) {
    const key = row.variant_permaslug || row.model_permaslug || `unknown-${idx++}`;
    const existing = grouped.get(key);
    if (!existing) { grouped.set(key, { ...row, variant_permaslug: key }); continue; }
    for (const k of SUM_KEYS) {
      existing[k] = numOr(existing[k]) + numOr(row[k]);
    }
    if (row.date && (!existing.date || row.date > existing.date)) existing.date = row.date;
    if (row.change != null) existing.change = row.change;
  }
  return Array.from(grouped.values());
}

function mapModels(rows: ModelRow[]): OpenRouterRankEntry[] {
  return mergeRows(rows)
    .sort((a, b) => (numOr(a.total_prompt_tokens) + numOr(a.total_completion_tokens)) - (numOr(b.total_prompt_tokens) + numOr(b.total_completion_tokens)))
    .reverse()
    .map((row, i) => {
      const id = row.model_permaslug;
      const name = titleFromSlug(id);
      return {
        rank: i + 1, id, name, creator: creatorFromSlug(id), category: categoryFrom(id, name),
        variant: row.variant, date: row.date,
        totalTokens: numOr(row.total_prompt_tokens) + numOr(row.total_completion_tokens),
        promptTokens: numOr(row.total_prompt_tokens), completionTokens: numOr(row.total_completion_tokens),
        reasoningTokens: numOr(row.total_native_tokens_reasoning), cachedTokens: numOr(row.total_native_tokens_cached),
        requestCount: numOr(row.count), toolCalls: numOr(row.total_tool_calls),
        mediaPrompts: numOr(row.num_media_prompt), mediaCompletions: numOr(row.num_media_completion),
        audioPrompts: numOr(row.num_audio_prompt), change: row.change ?? null,
      };
    });
}

function mapApps(rows: AppRow[]): OpenRouterAppEntry[] {
  const seen = new Set<number>();
  return rows
    .filter((r) => r.app_id && !seen.has(r.app_id) && (seen.add(r.app_id), true))
    .sort((a, b) => numOr(b.total_tokens) - numOr(a.total_tokens))
    .map((row, i) => ({
      rank: i + 1, id: String(row.app_id),
      name: row.app?.title || row.app?.slug || `App ${row.app_id}`,
      description: row.app?.description, slug: row.app?.slug,
      url: row.app?.origin_url || row.app?.main_url || null,
      categories: row.app?.categories || [],
      totalTokens: numOr(row.total_tokens), requestCount: numOr(row.total_requests),
    }));
}

export async function getOpenRouterRankings(): Promise<OpenRouterRankingsPayload> {
  return withCache("openrouter-rankings", DEFAULT_TTL_MS, async () => {
    const [modelResult, appResult] = await Promise.allSettled([
      fetchJSON<{ data: ModelRow[] }>(`${OPENROUTER}/api/frontend/v1/rankings/models`),
      fetchJSON<{ data: AppResponse }>(`${OPENROUTER}/api/frontend/v1/rankings/apps`),
    ]);
    const modelRows = modelResult.status === "fulfilled" ? (modelResult.value?.data ?? []) : [];
    const appRows = appResult.status === "fulfilled" ? (appResult.value?.data?.day ?? []) : [];
    if (modelRows.length === 0 && appRows.length === 0) {
      const reasons = formatSettleErrors([modelResult, appResult], ["models", "apps"]);
      throw new Error(`OpenRouter: all upstream requests failed${reasons ? ` (${reasons})` : ""}`);
    }
    return { tokenUsageRankings: mapModels(modelRows), appUsageRankings: mapApps(appRows), fetchedAt: new Date().toISOString() };
  });
}
