import type { Lang } from "../i18n";

const RECOMMENDATIONS: { [key: string]: { en: string; zh: string } } = {
  claude: {
    en: "The industry standard for code generation and multi-step planning, with outstanding intelligence and instruction-following.",
    zh: "当前行业公认的代码生成与多步骤规划标杆，智能与指令遵循等级极其优秀。",
  },
  deepseek: {
    en: "Possesses top-tier reasoning and deep chain-of-thought capabilities, making it the most cost-effective choice for developers.",
    zh: "拥有顶尖的推理及深度思维链链条能力，是当前极客开发极高性价比的顶流。",
  },
  gpt: {
    en: "A masterpiece in multimodal capability and low latency, standing as the stable first choice for complex production environments.",
    zh: "多模态与超低调用延迟的代表作，生产环境复杂业务落地的稳定首选之作。",
  },
  gemini: {
    en: "A powerful tool for multimodal, complex, long-context analysis and huge document processing (up to millions of tokens).",
    zh: "超大上下文（达百万级别）的多模态复杂长文本分析与大文档处理神器。",
  },
  mimo: {
    en: "A representative of highly energy-efficient reasoning, perfect for high-concurrency, low-latency, multi-agent communication.",
    zh: "高能效推理模型代表，极适合高并发、低延迟的轻量多 Agent 通信场景。",
  },
  default: {
    en: "Suitable for daily general conversations, lightweight agent tasks, and general text processing scenarios.",
    zh: "适用于日常通用多轮对话、轻量级 Agent 任务与通用文本处理场景。",
  },
};

export function getRecommendation(id: string, lang: Lang): string {
  const lower = id.toLowerCase();
  if (/claude-3[.-]5-sonnet/.test(lower)) return RECOMMENDATIONS.claude![lang];
  if (/deepseek-[vr]/.test(lower)) return RECOMMENDATIONS.deepseek![lang];
  if (/gpt-[45]/.test(lower)) return RECOMMENDATIONS.gpt![lang];
  if (/gemini/.test(lower)) return RECOMMENDATIONS.gemini![lang];
  if (/mimo/.test(lower)) return RECOMMENDATIONS.mimo![lang];
  return RECOMMENDATIONS.default![lang];
}
