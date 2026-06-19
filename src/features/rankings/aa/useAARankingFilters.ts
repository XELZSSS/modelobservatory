import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useFilteredData } from "../../../shared/hooks/useFilteredData";
import type { ArtificialAnalysisModel } from "../../../shared/types";

export type ViewMode = "rankings" | "pricing";
export type ReasoningFilter = "all" | "reasoning" | "non-reasoning";

const REASONING_KEYWORDS = /\b(reasoning|thinking)\b/i;
const REASONING_PREFIXES = /^(o[134]|gpt-5)/i;

function isReasoningModel(model: ArtificialAnalysisModel) {
  return REASONING_KEYWORDS.test(model.name) || REASONING_PREFIXES.test(model.name);
}

const getSearchFields = (m: ArtificialAnalysisModel) => [m.name, m.slug, m.model_creators?.name || ""];

export function useAARankingFilters(rankings: ArtificialAnalysisModel[]) {
  const location = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>((location.state as { viewMode?: ViewMode })?.viewMode ?? "rankings");
  const [reasoningFilter, setReasoningFilter] = useState<ReasoningFilter>("all");
  const [modalityFilter, setModalityFilter] = useState<string>("all");

  const preFiltered = useMemo(() => {
    let result = rankings.filter((model) => {
      if (viewMode === "rankings") return typeof model.intelligence_index === "number" && Number.isFinite(model.intelligence_index);
      return model.pricing?.input != null || model.pricing?.output != null || model.pricing?.cache_hit != null || model.pricing?.blended?.["7_2_1"] != null;
    });
    if (reasoningFilter === "reasoning") result = result.filter(isReasoningModel);
    else if (reasoningFilter === "non-reasoning") result = result.filter((m) => !isReasoningModel(m));
    return result;
  }, [rankings, viewMode, reasoningFilter]);

  const searchFiltered = useFilteredData(preFiltered, getSearchFields);

  const filtered = useMemo(() => {
    if (modalityFilter === "all") return searchFiltered;
    return searchFiltered.filter((m) => {
      switch (modalityFilter) {
        case "text": return m.input_modality_text || m.output_modality_text;
        case "image": return m.input_modality_image || m.output_modality_image;
        case "speech": return m.input_modality_speech || m.output_modality_speech;
        case "video": return m.input_modality_video || m.output_modality_video;
        default: return true;
      }
    });
  }, [searchFiltered, modalityFilter]);

  return {
    filtered,
    viewMode, setViewMode,
    reasoningFilter, setReasoningFilter,
    modalityFilter, setModalityFilter,
  };
}
