import type { TranslationKey } from "../i18n";
import { BENCHMARK_KEYS } from "./index";

export { BENCHMARK_KEYS };

export const RANKING_BENCHMARK_KEYS = ["aime25", "gpqa", "mmlu_pro", "math_500", "humaneval", "livecodebench"] as const;

export const BENCHMARK_LABELS: Record<(typeof RANKING_BENCHMARK_KEYS)[number], TranslationKey> = {
  aime25: "benchmarkAime25",
  gpqa: "benchmarkGpqa",
  mmlu_pro: "benchmarkMmluPro",
  math_500: "benchmarkMath500",
  humaneval: "benchmarkHumaneval",
  livecodebench: "benchmarkLivecodebench",
};