import { useMemo } from "react";
import { useCompareStore } from "../stores/compareStore";
import { useArtificialRankings } from "./useQueries";
import { modelId } from "../utils/modelId";
import type { ArtificialAnalysisModel } from "../types";

export function useCompareModels(): ArtificialAnalysisModel[] {
  const compareIds = useCompareStore((s) => s.compareIds);
  const rankingsQ = useArtificialRankings();
  return useMemo(() => {
    if (!rankingsQ.data) return [];
    return compareIds
      .map((id) => rankingsQ.data!.find((m) => modelId(m) === id))
      .filter((m): m is ArtificialAnalysisModel => !!m);
  }, [compareIds, rankingsQ.data]);
}
