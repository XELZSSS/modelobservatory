import type { TranslationKey } from "../i18n";

export const BENCHMARK_KEYS = [
  "aime25",
  "gpqa",
  "mmlu_pro",
  "math_500",
  "humaneval",
  "livecodebench",
] as const;

export const BENCHMARK_LABELS: Record<(typeof BENCHMARK_KEYS)[number], TranslationKey> = {
  aime25: "benchmarkAime25",
  gpqa: "benchmarkGpqa",
  mmlu_pro: "benchmarkMmluPro",
  math_500: "benchmarkMath500",
  humaneval: "benchmarkHumaneval",
  livecodebench: "benchmarkLivecodebench",
};
