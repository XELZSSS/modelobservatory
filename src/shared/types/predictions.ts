export interface ModelPrediction {
  id: string;
  question: string;
  company: string;
  metric: string;
  probability: number;
  volume: number;
  deadline: string;
  url: string;
}

export interface ReleasePrediction {
  id: string;
  question: string;
  model: string;
  predictions: { window: string; probability: number }[];
  volume: number;
  url: string;
}

export interface ProviderPrediction {
  id: string;
  question: string;
  provider: string;
  type: "valuation" | "ipo" | "market_cap";
  options: { label: string; probability: number }[];
  volume: number;
  deadline: string;
  url: string;
}

export interface PredictionsPayload {
  modelRankings: ModelPrediction[];
  releases: ReleasePrediction[];
  providers: ProviderPrediction[];
}
