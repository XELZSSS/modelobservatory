import { fetchRsc, CACHE_TTL_MS } from "../http";
import { withCache } from "../cache";
import { findNextData, parseRscPayload, rscParseError } from "../parsers/rsc";
import { num, str, strOr, bool, obj } from "../parsers/coerce";
import type { ArtificialAnalysisModel } from "../../shared/types";
import { upstreamConfig } from "../../shared/config";

function compact(m: Record<string, unknown>): ArtificialAnalysisModel {
  const mc = obj(m.model_creators);
  const omn = obj(m.omniscience_breakdown);
  const iic = obj(m.intelligence_index_cost);
  const iitc = obj(m.intelligence_index_token_counts);
  const td = obj(m.timescaleData);
  const ic = typeof iic?.input_cost === "number" && typeof iitc?.input_tokens === "number" && iitc.input_tokens > 0;
  const oc = typeof iic?.output_cost === "number" && typeof iitc?.output_tokens === "number" && iitc.output_tokens > 0;

  const benchmarks: Record<string, number | null> = {};
  const benchmarkKeys = ["aime25", "gpqa", "hle", "scicode", "gdpval", "tau2", "terminalbench_hard", "ifbench", "lcr", "omniscience", "critpt", "livecodebench", "mmlu_pro", "math_500", "humaneval", "apex_agents", "terminalbench_v2_1", "tau_banking"];
  for (const key of benchmarkKeys) {
    const val = num(m[key]);
    if (val !== undefined) benchmarks[key] = val;
  }

  const pricing: ArtificialAnalysisModel["pricing"] = {
    input: typeof m.price_1m_input_tokens === "number" ? m.price_1m_input_tokens : ic ? ((iic!.input_cost as number) / (iitc!.input_tokens as number)) * 1e6 : num(m.price_input),
    output: typeof m.price_1m_output_tokens === "number" ? m.price_1m_output_tokens : oc ? ((iic!.output_cost as number) / (iitc!.output_tokens as number)) * 1e6 : num(m.price_output),
    cache_hit: num(m.cache_hit_price),
    cache_hit_discount_percent: num(m.cache_hit_discount_percent),
    cacheHitRate: num(m.cacheHitRate),
    blended: {
      "0_3_1": num(m.price_1m_blended_0_3_1) ?? undefined,
      "7_2_1": num(m.price_1m_blended_7_2_1) ?? undefined,
      "0_1_1": num(m.price_1m_blended_0_1_1) ?? undefined,
      "0_100_1": num(m.price_1m_blended_0_100_1) ?? undefined,
      "100_1_1": num(m.price_1m_blended_100_1_1) ?? undefined,
    },
    intelligence_index_cost: iic ? { ...iic } : undefined,
  };

  const speed: ArtificialAnalysisModel["speed"] = {
    median_output_speed: num(m.median_output_speed),
    median_time_to_first_token: num(m.median_time_to_first_token),
    timescaleData: td ? { median_output_speed: typeof td.median_output_speed === "number" ? td.median_output_speed : undefined } : undefined,
  };

  const tokenCounts: ArtificialAnalysisModel["token_counts"] = iitc ? { ...iitc } : undefined;

  return {
    id: str(m.id), slug: str(m.slug), name: str(m.name), short_name: strOr(m.short_name),
    model_creators: mc ? { name: str(mc.name), color: str(mc.color) } : undefined,
    intelligence_index: num(m.intelligence_index), intelligence_index_is_estimated: bool(m.intelligence_index_is_estimated),
    estimated_intelligence_index: num(m.estimated_intelligence_index),
    coding_index: num(m.coding_index), agentic_index: num(m.agentic_index), math_index: num(m.math_index),
    context_window_tokens: num(m.context_window_tokens), contextWindowFormatted: strOr(m.contextWindowFormatted),
    parameters: num(m.parameters), activeParams: num(m.activeParams), size_class: strOr(m.size_class),
    reasoning_model: bool(m.reasoning_model), commercial_allowed: bool(m.commercial_allowed),
    knowledge_cutoff_date: strOr(m.knowledge_cutoff_date), frontier_model: bool(m.frontier_model),
    release_date: strOr(m.release_date), is_open_weights: bool(m.is_open_weights),
    open_source_categorization: strOr(m.open_source_categorization),
    license_name: strOr(m.license_name), license_url: strOr(m.license_url),
    benchmarks,
    pricing,
    speed,
    token_counts: tokenCounts,
    input_modality_text: bool(m.input_modality_text), input_modality_image: bool(m.input_modality_image),
    input_modality_speech: bool(m.input_modality_speech), input_modality_video: bool(m.input_modality_video),
    output_modality_text: bool(m.output_modality_text), output_modality_image: bool(m.output_modality_image),
    output_modality_speech: bool(m.output_modality_speech), output_modality_video: bool(m.output_modality_video),
    model_url: strOr(m.model_url), hosts_url: strOr(m.hosts_url),
    model_weights_source_url: strOr(m.model_weights_source_url), model_family_slug: strOr(m.model_family_slug),
    model_creator_id: strOr(m.model_creator_id), display_order: num(m.display_order),
    deprecated: bool(m.deprecated), deleted: bool(m.deleted),
    omniscience_breakdown: omn && typeof omn.total === "object" && omn.total !== null ? { total: { ...(omn.total as Record<string, unknown>) } } : omn ? { total: {} } : undefined,
  };
}

export async function getIntelligenceIndex(): Promise<ArtificialAnalysisModel[]> {
  return withCache("aa-defaultData", CACHE_TTL_MS, async () => {
    const rsc = await fetchRsc(`${upstreamConfig.artificialAnalysis}/evaluations/artificial-analysis-intelligence-index`, { headers: { RSC: "1", "Next-Router-State-Tree": "%5B%5D" } });
    let raw: Record<string, unknown>[];
    try {
      raw = parseRscPayload<Record<string, unknown>>(rsc, "defaultData", (tree) => findNextData(tree, "defaultData"));
    } catch (e) {
      throw new Error(rscParseError("defaultData", rsc, e), { cause: e });
    }
    if (raw.length === 0) throw new Error(rscParseError("defaultData", rsc));
    return raw.map(compact).sort((a, b) => (b.intelligence_index ?? -Infinity) - (a.intelligence_index ?? -Infinity));
  });
}
