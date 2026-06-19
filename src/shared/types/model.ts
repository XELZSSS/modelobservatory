export interface ArtificialAnalysisModel {
  id: string;
  slug: string;
  name: string;
  short_name?: string | null;
  model_creators?: { name?: string; color?: string };
  intelligence_index: number | null;
  intelligence_index_is_estimated?: boolean;
  estimated_intelligence_index?: number | null;
  release_date?: string | null;
  is_open_weights?: boolean;
  open_source_categorization?: string | null;
  license_name?: string | null;
  license_url?: string | null;
  context_window_tokens?: number | null;
  contextWindowFormatted?: string | null;
  parameters?: number | null;
  activeParams?: number | null;
  size_class?: string | null;
  reasoning_model?: boolean;
  commercial_allowed?: boolean;
  knowledge_cutoff_date?: string | null;
  frontier_model?: boolean;

  coding_index?: number | null;
  agentic_index?: number | null;

  benchmarks?: Record<string, number | null>;

  pricing?: {
    input?: number | null;
    output?: number | null;
    cache_hit?: number | null;
    cache_hit_discount_percent?: number | null;
    cacheHitRate?: number | null;
    blended?: Record<string, number | null | undefined>;
    intelligence_index_cost?: {
      total_cost?: number | null;
      input_cost?: number | null;
      output_cost?: number | null;
    };
  };

  speed?: {
    median_output_speed?: number | null;
    median_time_to_first_token?: number | null;
    timescaleData?: { median_output_speed?: number | null };
  };

  token_counts?: {
    input_tokens?: number;
    answer_tokens?: number;
    output_tokens?: number;
    reasoning_tokens?: number;
  };

  input_modality_text?: boolean;
  input_modality_image?: boolean;
  input_modality_speech?: boolean;
  input_modality_video?: boolean;
  output_modality_text?: boolean;
  output_modality_image?: boolean;
  output_modality_speech?: boolean;
  output_modality_video?: boolean;

  // URLs
  model_url?: string | null;
  hosts_url?: string | null;
  model_weights_source_url?: string | null;
  model_family_slug?: string | null;
  model_creator_id?: string | null;
  display_order?: number | null;
  deprecated?: boolean;
  deleted?: boolean;

  omniscience_breakdown?: {
    total?: {
      accuracy?: number | null;
      attempt_rate?: number | null;
      hallucination_rate?: number | null;
      omniscience?: number | null;
    };
  };
}

export interface TtsModel {
  id: string;
  name: string;
  provider: string | null;
  quality_elo: number | null;
  speed_chars_per_sec: number | null;
  price_per_1m_chars: number | null;
}

export interface OpenSourceModelEntry {
  id: string;
  author: string;
  downloads: number;
  likes: number;
  license: string;
  task: string | null;
  createdAt: string | null;
  lastModified: string | null;
  tags: string[];
}
