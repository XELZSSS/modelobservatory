import { useMemo, useState } from "react";
import { calcModelCost } from "../../../shared/utils/costCalc";
import type { ArtificialAnalysisModel } from "../../../shared/types";

export function useCostEstimator(filteredRankings: ArtificialAnalysisModel[]) {
  const [promptTokens, setPromptTokens] = useState("100000");
  const [completionTokens, setCompletionTokens] = useState("30000");

  const calcPrompt = Number(promptTokens) || 0;
  const calcCompletion = Number(completionTokens) || 0;

  const avgCost = useMemo(() => {
    let total = 0;
    let count = 0;
    for (const m of filteredRankings) {
      const cost = calcModelCost(m, calcPrompt, calcCompletion);
      if (cost != null) {
        total += cost;
        count++;
      }
    }
    return count > 0 ? total / count : 0;
  }, [filteredRankings, calcPrompt, calcCompletion]);

  return { promptTokens, setPromptTokens, completionTokens, setCompletionTokens, calcPrompt, calcCompletion, avgCost };
}
