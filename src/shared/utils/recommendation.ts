import type { TFunction, TranslationKey } from "../i18n";

const REC_RULES: [RegExp, TranslationKey][] = [
  [/claude-3[.-]5-sonnet/, "recClaude"],
  [/deepseek-[vr]/, "recDeepSeek"],
  [/gpt-[45]/, "recGpt"],
  [/gemini/, "recGemini"],
  [/mimo/, "recMiMo"],
];

export function getRecommendation(id: string, t: TFunction): string {
  const lower = id.toLowerCase();
  const match = REC_RULES.find(([re]) => re.test(lower));
  return t(match ? match[1] : "recDefault");
}
