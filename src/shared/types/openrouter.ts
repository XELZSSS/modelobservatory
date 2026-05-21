export interface OpenRouterRankEntry {
  rank: number;
  id: string;
  name: string;
  creator: string;
  category: "coding" | "reasoning" | "general";
  variant?: string;
  date?: string;
  totalTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  reasoningTokens?: number;
  cachedTokens?: number;
  requestCount?: number;
  toolCalls?: number;
  mediaPrompts?: number;
  mediaCompletions?: number;
  audioPrompts?: number;
  change?: number | null;
  pricing?: {
    prompt: number;
    completion: number;
  };
  contextWindow?: number;
  isFree?: boolean;
}

export interface OpenRouterAppEntry {
  rank: number;
  id: string;
  name: string;
  description?: string;
  slug?: string;
  url?: string | null;
  categories: string[];
  totalTokens: number;
  requestCount: number;
}

export interface OpenRouterRankingsPayload {
  tokenUsageRankings: OpenRouterRankEntry[];
  appUsageRankings: OpenRouterAppEntry[];
  fetchedAt: string;
}
